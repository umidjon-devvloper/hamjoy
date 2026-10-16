'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  AuthSession,
  LoginCredentials,
  RegisterCredentials,
  User,
  UserProfileUpdate,
} from '@/types';
import { authService } from '@/services/auth.service';
import { isMockAuthEnabled, isAuthOptional } from '@/lib/auth/config';
import { isAdminUser } from '@/lib/auth/roles';

interface AuthContextValue {
  user: User;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isMockAuth: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: UserProfileUpdate) => Promise<void>;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<User>(() => authService.getCurrentUser());
  const [isHydrated, setIsHydrated] = useState(false);

  const refresh = useCallback(() => {
    const nextSession = authService.getSession();
    setSession(nextSession);
    setUser(authService.getCurrentUser());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const repo = authService.getRepository();

    const applySession = async (nextSession: AuthSession | null) => {
      if (cancelled) return;

      if (nextSession) {
        const nextUser = await authService.getUserById(nextSession.userId);
        setSession(nextSession);
        if (nextUser) setUser(nextUser);
      } else {
        setSession(null);
        setUser(authService.getCurrentUser());
      }
      setIsHydrated(true);
    };

    if (repo.onAuthStateChanged) {
      const unsubscribe = repo.onAuthStateChanged((nextSession) => {
        void applySession(nextSession);
      });
      return () => {
        cancelled = true;
        unsubscribe();
      };
    }

    void authService.hydrateSession().then((nextSession) => applySession(nextSession));

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const nextSession = await authService.login(credentials);
      const nextUser = await authService.getUserById(nextSession.userId);
      setSession(nextSession);
      setUser(nextUser ?? authService.getCurrentUser());
    },
    []
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      const nextSession = await authService.register(credentials);
      const nextUser = await authService.getUserById(nextSession.userId);
      setSession(nextSession);
      setUser(nextUser ?? authService.getCurrentUser());
    },
    []
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(null);
    setUser(authService.getCurrentUser());
  }, []);

  const updateProfile = useCallback(async (patch: UserProfileUpdate) => {
    const userId = authService.getCurrentUserId();
    const updated = await authService.updateProfile(userId, patch);
    if (updated) setUser(updated);
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      // Auth is optional during early dev — treat everyone as signed in (demo
      // user) so no screen ever forces sign-in/registration.
      isAuthenticated: isAuthOptional() || Boolean(session),
      isHydrated,
      isMockAuth: isMockAuthEnabled(),
      isAdmin: isAdminUser(user),
      login,
      register,
      logout,
      updateProfile,
      refresh,
    }),
    [user, session, isHydrated, login, register, logout, updateProfile, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
