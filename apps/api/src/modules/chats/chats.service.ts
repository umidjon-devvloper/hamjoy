import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, lt, or, sql } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { chats, listings, messages } from '../../db/schema';
import { ModerationService } from '../moderation/moderation.service';

type UnreadMap = Record<string, number>;

@Injectable()
export class ChatsService {
  constructor(
    @Inject(DB) private readonly db: DbClient,
    private readonly moderation: ModerationService,
  ) {}

  async startOrGet(buyerId: string, listingId: string): Promise<typeof chats.$inferSelect> {
    const [listing] = await this.db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
    if (!listing) throw new NotFoundException({ code: 'listing_not_found', message: "E'lon topilmadi" });
    if (listing.userId === buyerId) {
      throw new BadRequestException({ code: 'self_chat', message: "O'z e'loningizga xabar yoza olmaysiz" });
    }
    if (await this.moderation.anyBlock(buyerId, listing.userId)) {
      throw new ForbiddenException({ code: 'blocked', message: 'Bu foydalanuvchi bilan muloqot cheklangan' });
    }

    const sellerId = listing.userId;

    const [existing] = await this.db
      .select()
      .from(chats)
      .where(and(eq(chats.listingId, listingId), eq(chats.buyerId, buyerId), eq(chats.sellerId, sellerId)))
      .limit(1);
    if (existing) return existing;

    const [created] = await this.db
      .insert(chats)
      .values({ listingId, buyerId, sellerId })
      .returning();
    return created!;
  }

  async listMine(userId: string) {
    const rows = await this.db
      .select({ chat: chats, listing: listings })
      .from(chats)
      .leftJoin(listings, eq(listings.id, chats.listingId))
      .where(or(eq(chats.buyerId, userId), eq(chats.sellerId, userId)))
      .orderBy(desc(chats.lastMessageAt));

    return rows.map((r) => ({
      ...r.chat,
      listing: r.listing
        ? { id: r.listing.id, title: r.listing.title, status: r.listing.status }
        : null,
      unread: ((r.chat.unreadCounts as UnreadMap) ?? {})[userId] ?? 0,
    }));
  }

  async getById(userId: string, chatId: string) {
    const [row] = await this.db.select().from(chats).where(eq(chats.id, chatId)).limit(1);
    if (!row) throw new NotFoundException({ code: 'chat_not_found', message: 'Suhbat topilmadi' });
    if (row.buyerId !== userId && row.sellerId !== userId) {
      throw new ForbiddenException({ code: 'forbidden', message: "Bu suhbat sizniki emas" });
    }
    return row;
  }

  async listMessages(userId: string, chatId: string, cursor: string | undefined, limit: number) {
    await this.getById(userId, chatId);
    const where = cursor
      ? and(eq(messages.chatId, chatId), lt(messages.createdAt, new Date(cursor)))
      : eq(messages.chatId, chatId);
    const rows = await this.db
      .select()
      .from(messages)
      .where(where)
      .orderBy(desc(messages.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: items.reverse(), // chronological order
      cursor: hasMore ? items[0]!.createdAt.toISOString() : null,
    };
  }

  async send(userId: string, chatId: string, body: string, mediaUrl: string | null) {
    const chat = await this.getById(userId, chatId);
    const [msg] = await this.db
      .insert(messages)
      .values({ chatId, senderId: userId, body, mediaUrl })
      .returning();

    const recipientId = chat.buyerId === userId ? chat.sellerId : chat.buyerId;
    await this.db.execute(sql`
      UPDATE chats
      SET
        last_message_at = NOW(),
        unread_counts = jsonb_set(
          coalesce(unread_counts, '{}'::jsonb),
          ${sql.raw(`'{${recipientId}}'`)},
          to_jsonb(coalesce((unread_counts->>${recipientId})::int, 0) + 1),
          true
        )
      WHERE id = ${chatId}
    `);

    return { message: msg!, recipientId };
  }

  async markRead(userId: string, chatId: string) {
    const chat = await this.getById(userId, chatId);
    const readAt = new Date();
    await this.db.execute(sql`
      UPDATE chats
      SET unread_counts = jsonb_set(coalesce(unread_counts, '{}'::jsonb), ${sql.raw(`'{${userId}}'`)}, '0'::jsonb, true)
      WHERE id = ${chatId}
    `);
    await this.db
      .update(messages)
      .set({ readAt })
      .where(and(eq(messages.chatId, chatId), sql`${messages.senderId} != ${userId}`, sql`${messages.readAt} IS NULL`));
    const otherId = chat.buyerId === userId ? chat.sellerId : chat.buyerId;
    return { ok: true as const, otherId, readAt };
  }
}
