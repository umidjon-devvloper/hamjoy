import type {
  AuthSession,
  LoginCredentials,
  RegisterCredentials,
  User,
  UserProfileUpdate,
} from '@/types';
import { DEFAULT_DEMO_USER_ID } from '@/data/constants';
import { users as seedUsers } from '@/data/users';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/types';
import { isBackendEnabled } from '@/lib/backend/config';
import { isRestBackendEnabled } from '@/lib/api/config';
import { isAuthOptional } from '@/lib/auth/config';
import {
  clearAuthSessionCookies,
  syncAuthSessionCookies,
} from '@/lib/auth/session-cookie';
import { getAuthRepository } from '@/services/auth';
import { authStore } from '@/services/auth/auth.store';
import { profileStore } from '@/services/profile.store';
import { firebaseProfilesRepository } from '@/lib/firebase/repositories/profiles.repository';

function mergeSeedUser(seed: (typeof seedUsers)[number]): User {
  const stored = profileStore.getById(seed.id);
  return {
    ...seed,
    phone: stored?.phone ?? seed.phone,
    profileRole: stored?.profileRole ?? seed.profileRole ?? 'both',
    language: stored?.language ?? seed.language ?? 'en',
    notifications: stored?.notifications ?? seed.notifications ?? { ...DEFAULT_NOTIFICATION_SETTINGS },
    name: stored?.name ?? seed.name,
    avatarUrl: stored?.avatarUrl ?? seed.avatarUrl,
    title: stored?.title ?? seed.title,
    blocked: stored?.blocked ?? seed.blocked ?? false,
  };
}

export const authService = {
  getRepository() {
    return getAuthRepository();
  },

  getSession(): AuthSession | null {
    return authStore.getSession();
  },

  async hydrateSession(): Promise<AuthSession | null> {
    const session = await getAuthRepository().getSession();
    authStore.setSession(session);
    if (session) {
      const user = await this.getUserById(session.userId);
      if (user) syncAuthSessionCookies(user.role);
    } else {
      clearAuthSessionCookies();
    }
    return session;
  },

  isAuthenticated(): boolean {
    return Boolean(authStore.getSession());
  },

  getOptionalUserId(): string | null {
    const sessionUserId = authStore.getSession()?.userId;
    if (sessionUserId) return sessionUserId;
    if (isAuthOptional()) return DEFAULT_DEMO_USER_ID;
    return isBackendEnabled() || isRestBackendEnabled() ? null : DEFAULT_DEMO_USER_ID;
  },

  getCurrentUserId(): string {
    const sessionUserId = authStore.getSession()?.userId;
    if (sessionUserId) return sessionUserId;
    if (isAuthOptional()) return DEFAULT_DEMO_USER_ID;
    if (isBackendEnabled() || isRestBackendEnabled()) {
      throw new Error('Authentication required');
    }
    return DEFAULT_DEMO_USER_ID;
  },

  getCurrentUser(): User {
    const sessionUserId = authStore.getSession()?.userId;
    if (sessionUserId) {
      return this.getUserByIdSync(sessionUserId) ?? mergeSeedUser(seedUsers[0]);
    }
    if (isBackendEnabled() || isRestBackendEnabled()) {
      return mergeSeedUser(seedUsers[0]);
    }
    return mergeSeedUser(seedUsers[0]);
  },

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const session = await getAuthRepository().signInWithEmail(credentials);
    authStore.setSession(session);
    const user = await this.getUserById(session.userId);
    if (user) syncAuthSessionCookies(user.role);
    return session;
  },

  async register(credentials: RegisterCredentials): Promise<AuthSession> {
    const session = await getAuthRepository().signUpWithEmail(credentials);
    authStore.setSession(session);
    const user = await this.getUserById(session.userId);
    if (user) syncAuthSessionCookies(user.role);
    return session;
  },

  async logout(): Promise<void> {
    await getAuthRepository().signOut();
    authStore.setSession(null);
    clearAuthSessionCookies();
  },

  async getUserById(userId: string): Promise<User | undefined> {
    if (isRestBackendEnabled()) {
      const { restProfilesRepository } = await import(
        '@/lib/rest/repositories/profiles.repository'
      );
      return restProfilesRepository.getById(userId);
    }
    if (isBackendEnabled()) {
      const profile = await firebaseProfilesRepository.getById(userId);
      if (profile) return profile;
    }
    const seed = seedUsers.find((u) => u.id === userId);
    if (seed) return mergeSeedUser(seed);
    return profileStore.getById(userId);
  },

  getUserByIdSync(userId: string): User | undefined {
    const seed = seedUsers.find((u) => u.id === userId);
    if (seed) return mergeSeedUser(seed);
    return profileStore.getById(userId);
  },


  async updateProfile(userId: string, patch: UserProfileUpdate): Promise<User | undefined> {
    if (isRestBackendEnabled()) {
      const { restProfilesRepository } = await import(
        '@/lib/rest/repositories/profiles.repository'
      );
      return restProfilesRepository.update(userId, patch);
    }
    if (isBackendEnabled()) {
      return firebaseProfilesRepository.update(userId, patch);
    }

    const existing = this.getUserByIdSync(userId);
    if (!existing) return undefined;

    if (seedUsers.some((u) => u.id === userId)) {
      return profileStore.save({
        ...existing,
        ...patch,
        notifications: {
          ...existing.notifications,
          ...patch.notifications,
        },
      });
    }

    return profileStore.update(userId, patch);
  },
};
