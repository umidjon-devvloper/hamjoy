import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { sessions } from '../../db/schema';
import { env } from '../../env';
import type { AuthUser } from '../../common/current-user.decorator';

const toMs = (ttl: string): number => {
  const m = /^(\d+)([smhd])$/.exec(ttl);
  if (!m) return 0;
  const n = Number(m[1]);
  switch (m[2]) {
    case 's': return n * 1000;
    case 'm': return n * 60_000;
    case 'h': return n * 3600_000;
    case 'd': return n * 86400_000;
    default: return 0;
  }
};

@Injectable()
export class TokenService {
  constructor(@Inject(DB) private readonly db: DbClient, private readonly jwt: JwtService) {}

  private hash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async issue(user: AuthUser, device?: string | null): Promise<{ access: string; refresh: string }> {
    const access = await this.jwt.signAsync(
      { sub: user.id, role: user.role },
      { secret: env.JWT_ACCESS_SECRET, expiresIn: env.JWT_ACCESS_TTL },
    );
    const refresh = crypto.randomBytes(48).toString('base64url');
    const expiresAt = new Date(Date.now() + toMs(env.JWT_REFRESH_TTL));

    await this.db.insert(sessions).values({
      userId: user.id,
      refreshTokenHash: this.hash(refresh),
      device: device ?? null,
      expiresAt,
    });

    return { access, refresh };
  }

  async rotate(refresh: string): Promise<{ access: string; refresh: string; userId: string; role: AuthUser['role'] }> {
    const hash = this.hash(refresh);
    const [session] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshTokenHash, hash))
      .limit(1);

    if (!session || session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException({ code: 'refresh_invalid', message: 'Refresh token yaroqsiz' });
    }

    await this.db.delete(sessions).where(eq(sessions.id, session.id));

    const { users } = await import('../../db/schema');
    const [u] = await this.db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (!u) throw new UnauthorizedException({ code: 'user_gone', message: 'Foydalanuvchi topilmadi' });

    const next = await this.issue({ id: u.id, role: u.role }, session.device);
    return { ...next, userId: u.id, role: u.role };
  }

  async revoke(refresh: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.refreshTokenHash, this.hash(refresh)));
  }
}
