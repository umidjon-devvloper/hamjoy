import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { profiles, users } from '../../db/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  async getMe(userId: string) {
    const [row] = await this.db
      .select({ user: users, profile: profiles })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!row) throw new NotFoundException({ code: 'user_not_found', message: 'Topilmadi' });

    return {
      user: {
        id: row.user.id,
        phone: row.user.phone,
        email: row.user.email,
        role: row.user.role,
        status: row.user.status,
        trusted: row.user.trusted,
        createdAt: row.user.createdAt.toISOString(),
      },
      profile: row.profile ?? null,
    };
  }

  async updateMe(userId: string, patch: Partial<{ fullName: string; avatarUrl: string | null; bio: string | null; cityId: number | null }>) {
    const [updated] = await this.db.update(profiles).set(patch).where(eq(profiles.userId, userId)).returning();
    if (!updated) throw new NotFoundException({ code: 'profile_not_found', message: 'Profil topilmadi' });
    return updated;
  }

  /** Admin-only. Grants or revokes the ✓ trust badge. */
  async setTrusted(userId: string, trusted: boolean) {
    const [updated] = await this.db
      .update(users)
      .set({ trusted })
      .where(eq(users.id, userId))
      .returning();
    if (!updated) throw new NotFoundException({ code: 'user_not_found', message: 'Topilmadi' });
    return { id: updated.id, trusted: updated.trusted };
  }
}
