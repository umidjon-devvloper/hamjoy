import { Inject, Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { deviceTokens } from '../../db/schema';

export type DevicePlatform = 'ios' | 'android' | 'web';

export interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Push adapter. The dev build just logs; a real build swaps in FCM / APNs
 * (and / or Expo Push) by implementing `deliver`. Keeping it isolated here
 * means the rest of the API never cares which transport is live.
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger('PushService');

  constructor(@Inject(DB) private readonly db: DbClient) {}

  async registerToken(userId: string, platform: DevicePlatform, token: string) {
    const t = token.trim();
    if (!t) return { ok: false as const };
    // ON CONFLICT (token) rebinds the token to the current user — handy when a
    // device is signed into another account first.
    await this.db
      .insert(deviceTokens)
      .values({ userId, platform, token: t })
      .onConflictDoUpdate({
        target: deviceTokens.token,
        set: { userId, platform },
      });
    return { ok: true as const };
  }

  async removeToken(userId: string, token: string) {
    await this.db
      .delete(deviceTokens)
      .where(and(eq(deviceTokens.token, token), eq(deviceTokens.userId, userId)));
    return { ok: true as const };
  }

  async sendToUser(userId: string, msg: PushMessage) {
    const rows = await this.db
      .select()
      .from(deviceTokens)
      .where(eq(deviceTokens.userId, userId));
    if (rows.length === 0) return;
    await Promise.all(rows.map((r) => this.deliver(r.platform as DevicePlatform, r.token, msg).catch((err) => {
      this.logger.warn(`push failed for ${r.platform}/${r.token.slice(0, 12)}…: ${(err as Error).message}`);
    })));
  }

  /**
   * The one method a real build swaps. For dev we log — a tester can see what
   * would be sent without wiring up Firebase or Apple credentials.
   */
  private async deliver(platform: DevicePlatform, token: string, msg: PushMessage): Promise<void> {
    this.logger.log(
      `push → ${platform} ${token.slice(0, 12)}…  "${msg.title}" / "${msg.body}" data=${JSON.stringify(msg.data ?? {})}`,
    );
  }
}
