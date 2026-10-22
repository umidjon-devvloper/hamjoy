import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, avg, count, desc, eq, sql } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { listings, reviews } from '../../db/schema';
import type { AuthUser } from '../../common/current-user.decorator';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(DB) private readonly db: DbClient,
    private readonly notifications: NotificationsService,
  ) {}

  async create(user: AuthUser, dto: {
    toUserId: string;
    listingId?: string;
    rating: number;
    comment?: string;
  }) {
    if (dto.toUserId === user.id) {
      throw new BadRequestException({ code: 'self_review', message: "O'zingizga baho qo'ya olmaysiz" });
    }
    try {
      const [row] = await this.db
        .insert(reviews)
        .values({
          fromUserId: user.id,
          toUserId: dto.toUserId,
          listingId: dto.listingId ?? null,
          rating: dto.rating,
          comment: dto.comment ?? null,
        })
        .returning();
      // Fire-and-forget: a failed notification should not fail the review.
      void this.notifications
        .create(dto.toUserId, 'review_received', {
          reviewId: row!.id,
          fromUserId: user.id,
          listingId: dto.listingId ?? null,
          rating: dto.rating,
          preview: dto.comment ?? null,
        })
        .catch(() => {});
      return row!;
    } catch (err) {
      // Unique index on (from,to,listing) — guard the message so UIs can
      // show something meaningful instead of a Postgres error.
      if ((err as { code?: string }).code === '23505') {
        throw new BadRequestException({
          code: 'already_reviewed',
          message: "Siz allaqachon baho qoldirgansiz",
        });
      }
      throw err;
    }
  }

  async listForUser(toUserId: string) {
    return this.db
      .select()
      .from(reviews)
      .where(eq(reviews.toUserId, toUserId))
      .orderBy(desc(reviews.createdAt))
      .limit(50);
  }

  async statsForUser(toUserId: string) {
    const [row] = await this.db
      .select({ avg: avg(reviews.rating), count: count() })
      .from(reviews)
      .where(eq(reviews.toUserId, toUserId));
    return {
      avg: row?.avg ? Number(row.avg) : 0,
      count: Number(row?.count ?? 0),
    };
  }

  /**
   * Public user history — their sold or still-active listings. Powers the
   * "istoriyalari tursin" requirement from the spec.
   */
  async userHistory(userId: string) {
    return this.db
      .select({
        id: listings.id,
        title: listings.title,
        type: listings.type,
        vertical: listings.vertical,
        status: listings.status,
        priceAmount: listings.priceAmount,
        priceCurrency: listings.priceCurrency,
        createdAt: listings.createdAt,
      })
      .from(listings)
      .where(
        and(
          eq(listings.userId, userId),
          sql`${listings.status} IN ('active','sold','archived')`,
        ),
      )
      .orderBy(desc(listings.createdAt))
      .limit(50);
  }
}
