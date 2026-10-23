import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { aliasedTable, and, desc, eq } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { profiles, reports, userBlocks } from '../../db/schema';
import type { AuthUser } from '../../common/current-user.decorator';

export type ReportTarget = 'user' | 'listing' | 'message';

@Injectable()
export class ModerationService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  async submitReport(
    user: AuthUser,
    dto: { targetType: ReportTarget; targetId: string; reason: string },
  ) {
    if (dto.targetType === 'user' && dto.targetId === user.id) {
      throw new BadRequestException({ code: 'self_report', message: "O'zingiz haqida shikoyat qila olmaysiz" });
    }
    const [row] = await this.db
      .insert(reports)
      .values({
        reporterId: user.id,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason.trim(),
      })
      .returning();
    return row!;
  }

  async block(user: AuthUser, blockedId: string) {
    if (blockedId === user.id) {
      throw new BadRequestException({ code: 'self_block', message: "O'zingizni bloklay olmaysiz" });
    }
    await this.db
      .insert(userBlocks)
      .values({ blockerId: user.id, blockedId })
      .onConflictDoNothing();
    return { ok: true as const };
  }

  async unblock(user: AuthUser, blockedId: string) {
    await this.db
      .delete(userBlocks)
      .where(and(eq(userBlocks.blockerId, user.id), eq(userBlocks.blockedId, blockedId)));
    return { ok: true as const };
  }

  async myBlocks(userId: string) {
    const target = aliasedTable(profiles, 'blocked_profile');
    return this.db
      .select({
        blockedId: userBlocks.blockedId,
        createdAt: userBlocks.createdAt,
        name: target.fullName,
      })
      .from(userBlocks)
      .leftJoin(target, eq(target.userId, userBlocks.blockedId))
      .where(eq(userBlocks.blockerId, userId))
      .orderBy(desc(userBlocks.createdAt))
      .limit(200);
  }

  /** True when a has blocked b, or b has blocked a — either direction stops contact. */
  async anyBlock(a: string, b: string): Promise<boolean> {
    const [row] = await this.db
      .select({ blockerId: userBlocks.blockerId })
      .from(userBlocks)
      .where(
        and(
          // (blocker=a AND blocked=b) OR (blocker=b AND blocked=a) — expressed as two selects below for clarity.
          eq(userBlocks.blockerId, a),
          eq(userBlocks.blockedId, b),
        ),
      )
      .limit(1);
    if (row) return true;
    const [row2] = await this.db
      .select({ blockerId: userBlocks.blockerId })
      .from(userBlocks)
      .where(and(eq(userBlocks.blockerId, b), eq(userBlocks.blockedId, a)))
      .limit(1);
    return !!row2;
  }

  /** Admin: list reports with the latest open first. */
  async listReports(status?: 'open' | 'resolved' | 'dismissed') {
    const where = status ? eq(reports.status, status) : undefined;
    const rows = await this.db
      .select()
      .from(reports)
      .where(where ?? eq(reports.status, reports.status))
      .orderBy(desc(reports.createdAt))
      .limit(200);
    return rows;
  }

  /** Admin: close a report with a decision. */
  async decideReport(id: string, decision: 'resolved' | 'dismissed') {
    await this.db.update(reports).set({ status: decision }).where(eq(reports.id, id));
    return { ok: true as const, status: decision };
  }
}
