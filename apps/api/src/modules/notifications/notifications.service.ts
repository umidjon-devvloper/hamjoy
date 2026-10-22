import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { notifications } from '../../db/schema';
import { NotificationsGateway } from './notifications.gateway';
import { PushService } from './push.service';

/** User-visible title + body for a push, derived from the stored type/payload. */
function pushCopy(type: string, payload: Record<string, unknown>): { title: string; body: string } | null {
  switch (type) {
    case 'review_received': {
      const rating = typeof payload.rating === 'number' ? payload.rating : 0;
      const preview = typeof payload.preview === 'string' ? payload.preview.trim() : '';
      return { title: 'Yangi baho', body: preview ? `${rating} yulduz · "${preview}"` : `${rating} yulduz` };
    }
    case 'listing_sold':
      return { title: "E'lon sotildi", body: typeof payload.title === 'string' ? (payload.title as string) : "Qiziqtirgan e'lon sotildi" };
    case 'new_message':
      return { title: 'Yangi xabar', body: typeof payload.body === 'string' ? (payload.body as string) : 'Chatni oching' };
    case 'application_received':
      return { title: 'Yangi ariza', body: 'Sizning e\'loningizga yangi ariza keldi' };
    default:
      return null;
  }
}

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DB) private readonly db: DbClient,
    private readonly gateway: NotificationsGateway,
    private readonly push: PushService,
  ) {}

  async list(userId: string) {
    return this.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(100);
  }

  async unreadCount(userId: string): Promise<number> {
    const [row] = await this.db
      .select({ n: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    return Number(row?.n ?? 0);
  }

  async markAllRead(userId: string): Promise<{ ok: true }> {
    await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    return { ok: true };
  }

  async markRead(userId: string, id: string): Promise<{ ok: true }> {
    await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    return { ok: true };
  }

  /** Internal — called by other services (e.g. reviews) to drop a row for a user. */
  async create(userId: string, type: string, payload: Record<string, unknown>) {
    const [row] = await this.db
      .insert(notifications)
      .values({ userId, type, payload })
      .returning();
    // Real-time push; failure to emit must not fail the write.
    try {
      this.gateway.push(userId, {
        id: row!.id,
        type: row!.type,
        payload: (row!.payload as Record<string, unknown>) ?? {},
        createdAt: row!.createdAt,
      });
    } catch {
      /* no-op */
    }
    // Background push to registered devices — fire-and-forget.
    const copy = pushCopy(type, payload);
    if (copy) {
      void this.push
        .sendToUser(userId, {
          title: copy.title,
          body: copy.body,
          data: { type, notificationId: row!.id },
        })
        .catch(() => {});
    }
    return row!;
  }
}
