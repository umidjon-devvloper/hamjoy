import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import type { AuthRepository } from '@/lib/auth/repository';
import type { AuthSession, LoginCredentials, RegisterCredentials } from '@/types';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/types';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { firebaseProfilesRepository } from '@/lib/firebase/repositories/profiles.repository';

export const firebaseAuthRepository: AuthRepository = {
  async signInWithEmail({ email, password }: LoginCredentials): Promise<AuthSession> {
    const { user } = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);

    const profile = await firebaseProfilesRepository.getById(user.uid);
    if (profile?.blocked) {
      await signOut(getFirebaseAuth());
      throw new Error('This account has been blocked. Contact support.');
    }

    return {
      userId: user.uid,
      email: user.email ?? email,
      provider: 'firebase',
      isMock: false,
      createdAt: user.metadata.creationTime ?? new Date().toISOString(),
    };
  },

  async signUpWithEmail({
    name,
    email,
    password,
    profileRole,
  }: RegisterCredentials): Promise<AuthSession> {
    const { user } = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);

    await firebaseProfilesRepository.upsert({
      id: user.uid,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
      role: profileRole === 'poster' ? 'poster' : 'seeker',
      profileRole,
      language: 'en',
      notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
      badge: 'Member',
    });

    return {
      userId: user.uid,
      email: email.trim().toLowerCase(),
      provider: 'firebase',
      isMock: false,
      createdAt: user.metadata.creationTime ?? new Date().toISOString(),
    };
  },

  async signOut(): Promise<void> {
    await signOut(getFirebaseAuth());
  },

  async getSession(): Promise<AuthSession | null> {
    const auth = getFirebaseAuth();
    if (auth.currentUser) {
      const user = auth.currentUser;
      return {
        userId: user.uid,
        email: user.email ?? '',
        provider: 'firebase',
        isMock: false,
        createdAt: user.metadata.creationTime ?? new Date().toISOString(),
      };
    }

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (!user) {
          resolve(null);
          return;
        }
        resolve({
          userId: user.uid,
          email: user.email ?? '',
          provider: 'firebase',
          isMock: false,
          createdAt: user.metadata.creationTime ?? new Date().toISOString(),
        });
      });
    });
  },

  async getAuthUser() {
    const session = await this.getSession();
    if (!session) return null;
    return { id: session.userId, email: session.email, emailVerified: true };
  },

  onAuthStateChanged(callback) {
    return onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) {
        callback(null);
        return;
      }
      callback({
        userId: user.uid,
        email: user.email ?? '',
        provider: 'firebase',
        isMock: false,
        createdAt: user.metadata.creationTime ?? new Date().toISOString(),
      });
    });
  },
};
