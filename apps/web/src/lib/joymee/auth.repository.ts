import type { AuthRepository } from '@/lib/auth/repository';
import type { AuthSession, AuthUser } from '@/types';
import { getJoymeeClient, joymeeTokens } from './client';

const unsupported = (name: string) => () => {
  throw new Error(`${name} is not supported in REST (OTP) mode. Use otpSend/otpVerify.`);
};

export const joymeeAuthRepository: AuthRepository = {
  // Email+password flows are not available on Joymee backend — use OTP instead.
  signInWithEmail: unsupported('signInWithEmail'),
  signUpWithEmail: unsupported('signUpWithEmail'),

  async otpSend(phone: string) {
    const res = await getJoymeeClient().auth.otpSend(phone);
    return { expiresInSec: res.expiresInSec, devCode: (res as any).devCode as string | undefined };
  },

  async otpVerify(phone: string, code: string): Promise<AuthSession> {
    const res = await getJoymeeClient().auth.otpVerify(phone, code);
    await joymeeTokens.setTokens(res.access, res.refresh);
    return {
      userId: res.user.id,
      email: res.user.email ?? '',
      provider: 'rest',
      isMock: false,
      createdAt: res.user.createdAt,
    };
  },

  async signOut() {
    const refresh = await joymeeTokens.getRefresh();
    if (refresh) {
      try {
        await getJoymeeClient().auth.logout();
      } catch {
        // ignore network — we still clear locally
      }
    }
    await joymeeTokens.clear();
  },

  async getSession(): Promise<AuthSession | null> {
    const access = await joymeeTokens.getAccess();
    if (!access) return null;
    try {
      const me = await getJoymeeClient().users.me();
      return {
        userId: me.user.id,
        email: me.user.email ?? '',
        provider: 'rest',
        isMock: false,
        createdAt: me.user.createdAt,
      };
    } catch {
      await joymeeTokens.clear();
      return null;
    }
  },

  async getAuthUser(): Promise<AuthUser | null> {
    const session = await this.getSession();
    if (!session) return null;
    return { id: session.userId, email: session.email, emailVerified: true };
  },
};
