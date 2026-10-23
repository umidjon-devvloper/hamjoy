import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { aliasedTable, and, desc, eq, sql } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { profiles, trustVerifications, users } from '../../db/schema';
import type { AuthUser } from '../../common/current-user.decorator';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class VerificationsService {
  constructor(
    @Inject(DB) private readonly db: DbClient,
    private readonly notifications: NotificationsService,
  ) {}

  async submit(user: AuthUser, dto: { idDocumentUrl: string; selfieUrl: string }) {
    const [existing] = await this.db
      .select()
      .from(trustVerifications)
      .where(and(eq(trustVerifications.userId, user.id), eq(trustVerifications.status, 'pending')))
      .limit(1);
    if (existing) {
      throw new BadRequestException({
        code: 'already_pending',
        message: 'Sizda tekshiruvdagi so\'rov allaqachon bor',
      });
    }
    const [row] = await this.db
      .insert(trustVerifications)
      .values({
        userId: user.id,
        idDocumentUrl: dto.idDocumentUrl,
        selfieUrl: dto.selfieUrl,
      })
      .returning();
    return row!;
  }

  async myLatest(userId: string) {
    const [row] = await this.db
      .select()
      .from(trustVerifications)
      .where(eq(trustVerifications.userId, userId))
      .orderBy(desc(trustVerifications.createdAt))
      .limit(1);
    return row ?? null;
  }

  async listPending(limit = 100) {
    const subject = aliasedTable(profiles, 'subject_profile');
    return this.db
      .select({
        id: trustVerifications.id,
        userId: trustVerifications.userId,
        idDocumentUrl: trustVerifications.idDocumentUrl,
        selfieUrl: trustVerifications.selfieUrl,
        status: trustVerifications.status,
        note: trustVerifications.note,
        createdAt: trustVerifications.createdAt,
        userName: subject.fullName,
      })
      .from(trustVerifications)
      .leftJoin(subject, eq(subject.userId, trustVerifications.userId))
      .where(eq(trustVerifications.status, 'pending'))
      .orderBy(desc(trustVerifications.createdAt))
      .limit(Math.min(limit, 200));
  }

  async decide(moderator: AuthUser, id: string, decision: 'approve' | 'reject', note?: string) {
    const [row] = await this.db
      .select()
      .from(trustVerifications)
      .where(eq(trustVerifications.id, id))
      .limit(1);
    if (!row) throw new NotFoundException({ code: 'not_found', message: 'Topilmadi' });
    if (row.status !== 'pending') {
      throw new BadRequestException({
        code: 'already_decided',
        message: 'Bu so\'rov allaqachon ko\'rib chiqilgan',
      });
    }
    const nextStatus = decision === 'approve' ? 'approved' : 'rejected';
    await this.db
      .update(trustVerifications)
      .set({
        status: nextStatus,
        note: note ?? null,
        reviewedBy: moderator.id,
        reviewedAt: new Date(),
      })
      .where(eq(trustVerifications.id, id));
    if (decision === 'approve') {
      await this.db.update(users).set({ trusted: true }).where(eq(users.id, row.userId));
    }
    void this.notifications
      .create(row.userId, decision === 'approve' ? 'trust_approved' : 'trust_rejected', {
        verificationId: row.id,
        note: note ?? null,
      })
      .catch(() => {});
    return { ok: true as const, status: nextStatus };
  }
}

// Pulled out so Nest's barrel-less imports stay flat.
void sql;
