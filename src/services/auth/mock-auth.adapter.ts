import type { AuthSession, LoginCredentials, RegisterCredentials } from '@/types';
import type { AuthRepository } from '@/lib/auth/repository';
import { users as seedUsers } from '@/data/users';
import { profileStore } from '@/services/profile.store';
import { authStore } from './auth.store';

/**
 * Development-only mock auth.
 * Passwords are NOT verified or stored — this must never ship as production auth.
 */
const DEMO_EMAIL_TO_USER_ID: Record<string, string> = {
  'alex@example.com': 'user-alex',
  'demo@jobmarket.app': 'user-alex',
  'admin@jobmarket.app': 'user-admin',
};

function createMockSession(userId: string, email: string): AuthSession {
  return {
    userId,
    email: email.trim().toLowerCase(),
    provider: 'mock',
    isMock: true,
    createdAt: new Date().toISOString(),
  };
}

export const mockAuthRepository: AuthRepository = {
  async signInWithEmail({ email }: LoginCredentials): Promise<AuthSession> {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      throw new Error('Email is required');
    }

    const demoUserId = DEMO_EMAIL_TO_USER_ID[normalized];
    if (demoUserId) {
      const user = seedUsers.find((u) => u.id === demoUserId) ?? profileStore.getById(demoUserId);
      if (user?.blocked) throw new Error('This account has been blocked. Contact support.');
      const session = createMockSession(demoUserId, normalized);
      authStore.setSession(session);
      return session;
    }

    const localProfile = profileStore.getByEmail(normalized);
    if (localProfile) {
      if (localProfile.blocked) throw new Error('This account has been blocked. Contact support.');
      const session = createMockSession(localProfile.id, normalized);
      authStore.setSession(session);
      return session;
    }

    const seedUser = seedUsers.find((u) => u.email.toLowerCase() === normalized);
    if (seedUser) {
      const merged = profileStore.getById(seedUser.id);
      if (merged?.blocked || seedUser.blocked) {
        throw new Error('This account has been blocked. Contact support.');
      }
      const session = createMockSession(seedUser.id, normalized);
      authStore.setSession(session);
      return session;
    }

    throw new Error('No account found for this email. Register first or use demo@jobmarket.app');
  },

  async signUpWithEmail({
    name,
    email,
    profileRole,
  }: RegisterCredentials): Promise<AuthSession> {
    const normalized = email.trim().toLowerCase();
    if (!name.trim()) throw new Error('Name is required');
    if (!normalized) throw new Error('Email is required');

    if (
      profileStore.getByEmail(normalized) ||
      seedUsers.some((u) => u.email.toLowerCase() === normalized)
    ) {
      throw new Error('An account with this email already exists');
    }

    const userId = `user-local-${Date.now()}`;
    profileStore.createLocalProfile({
      id: userId,
      name,
      email: normalized,
      profileRole,
    });

    const session = createMockSession(userId, normalized);
    authStore.setSession(session);
    return session;
  },

  async signOut(): Promise<void> {
    authStore.setSession(null);
  },

  async getSession(): Promise<AuthSession | null> {
    return authStore.getSession();
  },

  async getAuthUser() {
    const session = await this.getSession();
    if (!session) return null;
    return {
      id: session.userId,
      email: session.email,
      emailVerified: false,
    };
  },

  onAuthStateChanged(callback) {
    const handler = () => callback(authStore.getSession());
    queueMicrotask(handler);
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },
};
