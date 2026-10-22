import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { notifications } from '../../db/schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DB) private readonly db: DbClient,
    private readonly gateway: NotificationsGateway,
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
    return row!;
  }
}
