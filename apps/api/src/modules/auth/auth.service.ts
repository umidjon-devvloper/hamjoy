import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { profiles, users } from '../../db/schema';
import { OtpService } from './otp.service';
import { TokenService } from './token.service';

export const normalizePhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998')) return '+' + digits;
  if (digits.length === 9) return '+998' + digits;
  return '+' + digits;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: DbClient,
    private readonly otp: OtpService,
    private readonly tokens: TokenService,
  ) {}

  async otpSend(rawPhone: string) {
    const phone = normalizePhone(rawPhone);
    const res = await this.otp.send(phone);
    return { sent: true as const, phone, expiresInSec: res.expiresInSec };
  }

  async otpVerify(rawPhone: string, code: string, device?: string | null) {
    const phone = normalizePhone(rawPhone);
    await this.otp.verify(phone, code);

    let [user] = await this.db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (!user) {
      [user] = await this.db.insert(users).values({ phone }).returning();
      await this.db.insert(profiles).values({ userId: user!.id, fullName: 'Yangi foydalanuvchi' });
    }

    const { access, refresh } = await this.tokens.issue({ id: user!.id, role: user!.role }, device);
    return {
      access,
      refresh,
      user: { id: user!.id, phone: user!.phone, email: user!.email, role: user!.role, status: user!.status, createdAt: user!.createdAt.toISOString() },
    };
  }

  async refresh(refresh: string) {
    return this.tokens.rotate(refresh);
  }

  async logout(refresh: string) {
    await this.tokens.revoke(refresh);
    return { ok: true as const };
  }
}
