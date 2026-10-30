import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getApi, tokens } from './api';
import { registerPushToken } from './push';

interface MeUser {
  id: string;
  phone: string | null;
  email: string | null;
  role: 'user' | 'moderator' | 'admin';
}

interface MeProfile {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
}

interface AuthContextValue {
  me: { user: MeUser; profile: MeProfile | null } | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  otpSend: (phone: string) => Promise<{ expiresInSec: number; devCode?: string }>;
  otpVerify: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<AuthContextValue['me']>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const refresh = useCallback(async () => {
    const token = await tokens.getAccess();
    if (!token) {
      setMe(null);
      return;
    }
    try {
      const data = await getApi().users.me();
      setMe({
        user: {
          id: data.user.id,
          phone: data.user.phone,
          email: data.user.email,
          role: data.user.role,
        },
        profile: data.profile
          ? { userId: data.profile.userId, fullName: data.profile.fullName, avatarUrl: data.profile.avatarUrl }
          : null,
      });
    } catch {
      await tokens.clear();
      setMe(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refresh();
      setIsHydrated(true);
    })();
  }, [refresh]);

  const otpSend = useCallback(async (phone: string) => {
    const res = await getApi().auth.otpSend(phone);
    return { expiresInSec: res.expiresInSec, devCode: res.devCode };
  }, []);

  const otpVerify = useCallback(
    async (phone: string, code: string) => {
      const res = await getApi().auth.otpVerify(phone, code);
      await tokens.setTokens(res.access, res.refresh);
      await refresh();
      // Register the device for background pushes once signed in. The push
      // helper swallows its own errors (missing permission, simulator, offline).
      void registerPushToken().catch(() => {});
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    try {
      await getApi().auth.logout();
    } catch {
      /* ignore */
    }
    await tokens.clear();
    setMe(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      me,
      isAuthenticated: me != null,
      isHydrated,
      otpSend,
      otpVerify,
      logout,
      refresh,
    }),
    [me, isHydrated, otpSend, otpVerify, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>');
  return ctx;
}
