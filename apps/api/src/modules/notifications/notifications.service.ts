import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { notifications } from '../../db/schema';

@Injectable()
export class NotificationsService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

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
}
