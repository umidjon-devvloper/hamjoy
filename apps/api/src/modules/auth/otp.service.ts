import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import type Redis from 'ioredis';
import { REDIS } from '../../redis/redis.module';
import { SmsService } from './sms.service';

const OTP_TTL_SEC = 300; // 5 min
const RESEND_COOLDOWN_SEC = 60;
const MAX_ATTEMPTS = 5;

@Injectable()
export class OtpService {
  constructor(@Inject(REDIS) private readonly redis: Redis, private readonly sms: SmsService) {}

  private key(phone: string): string {
    return `otp:${phone}`;
  }

  private cooldownKey(phone: string): string {
    return `otp:cd:${phone}`;
  }

  private hash(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  async send(phone: string): Promise<{ expiresInSec: number }> {
    const cooldownLeft = await this.redis.ttl(this.cooldownKey(phone));
    if (cooldownLeft > 0) {
      throw new BadRequestException({
        code: 'otp_cooldown',
        message: `Keyingi SMS ${cooldownLeft}s dan keyin yuboriladi`,
      });
    }

    const code = String(crypto.randomInt(100000, 999999));
    await this.redis.set(this.key(phone), JSON.stringify({ hash: this.hash(code), attempts: 0 }), 'EX', OTP_TTL_SEC);
    await this.redis.set(this.cooldownKey(phone), '1', 'EX', RESEND_COOLDOWN_SEC);
    await this.sms.send(phone, `Joymee kodingiz: ${code}`);
    return { expiresInSec: OTP_TTL_SEC };
  }

  async verify(phone: string, code: string): Promise<boolean> {
    const raw = await this.redis.get(this.key(phone));
    if (!raw) {
      throw new BadRequestException({ code: 'otp_expired', message: 'Kod amal qilish muddati tugadi' });
    }

    const data = JSON.parse(raw) as { hash: string; attempts: number };
    if (data.attempts >= MAX_ATTEMPTS) {
      await this.redis.del(this.key(phone));
      throw new BadRequestException({ code: 'otp_too_many_attempts', message: 'Juda ko\'p urinish' });
    }

    const match = this.hash(code) === data.hash;
    if (!match) {
      data.attempts += 1;
      const ttl = await this.redis.ttl(this.key(phone));
      await this.redis.set(this.key(phone), JSON.stringify(data), 'EX', ttl > 0 ? ttl : OTP_TTL_SEC);
      throw new BadRequestException({ code: 'otp_invalid', message: 'Kod noto\'g\'ri' });
    }

    await this.redis.del(this.key(phone));
    await this.redis.del(this.cooldownKey(phone));
    return true;
  }
}
