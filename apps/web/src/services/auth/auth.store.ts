import type { AuthSession } from '@/types';
import { AUTH_SESSION_STORAGE_KEY } from '@/data/constants';

export const authStore = {
  getSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  },

  setSession(session: AuthSession | null): void {
    if (typeof window === 'undefined') return;
    if (!session) {
      localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      return;
    }
    localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  },
};
