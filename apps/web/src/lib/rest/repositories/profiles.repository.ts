import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  User,
  UserProfileUpdate,
} from '@/types';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/types';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { apiFetch } from '@/lib/api/http-client';
import { apiTokenStore } from '@/lib/api/token';
import type { AuthRepository } from '@/lib/auth/repository';

interface TokenPair {
  access: string;
  refresh: string;
}

interface AuthMeResponse {
  id: string;
  email: string;
  name: string;
  role: User['role'];
  profile_role: User['profileRole'];
  phone?: string;
  title?: string;
  avatar_url?: string;
  language?: User['language'];
  blocked?: boolean;
}

function mapProfile(data: AuthMeResponse): User {
  return {
    id: String(data.id),
    email: data.email,
    name: data.name,
    role: data.role,
    profileRole: data.profile_role,
    phone: data.phone,
    title: data.title,
    avatarUrl: data.avatar_url ?? '',
    language: data.language ?? 'en',
    notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
    blocked: data.blocked ?? false,
  };
}

export const restAuthRepository: AuthRepository = {
  async signInWithEmail(credentials: LoginCredentials): Promise<AuthSession> {
    const tokens = await apiFetch<TokenPair>(API_ENDPOINTS.authLogin, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    apiTokenStore.set(tokens.access);
    const me = await apiFetch<AuthMeResponse>(API_ENDPOINTS.authMe);
    return {
      userId: String(me.id),
      email: me.email,
      provider: 'rest',
      isMock: false,
      createdAt: new Date().toISOString(),
    };
  },

  async signUpWithEmail(credentials: RegisterCredentials): Promise<AuthSession> {
    await apiFetch(API_ENDPOINTS.authRegister, {
      method: 'POST',
      body: JSON.stringify({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        profile_role: credentials.profileRole,
      }),
    });
    return this.signInWithEmail({
      email: credentials.email,
      password: credentials.password,
    });
  },

  async signOut(): Promise<void> {
    try {
      await apiFetch(API_ENDPOINTS.authLogout, { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    apiTokenStore.set(null);
  },

  async getSession(): Promise<AuthSession | null> {
    const token = apiTokenStore.get();
    if (!token) return null;
    try {
      const me = await apiFetch<AuthMeResponse>(API_ENDPOINTS.authMe);
      return {
        userId: String(me.id),
        email: me.email,
        provider: 'rest',
        isMock: false,
        createdAt: new Date().toISOString(),
      };
    } catch {
      apiTokenStore.set(null);
      return null;
    }
  },

  async getAuthUser(): Promise<AuthUser | null> {
    const session = await this.getSession();
    if (!session) return null;
    return { id: session.userId, email: session.email, emailVerified: true };
  },
};

export const restProfilesRepository = {
  async getById(userId: string): Promise<User | undefined> {
    const me = await apiFetch<AuthMeResponse>(API_ENDPOINTS.authMe);
    if (String(me.id) !== userId) return undefined;
    return mapProfile(me);
  },

  async update(userId: string, patch: UserProfileUpdate): Promise<User | undefined> {
    const updated = await apiFetch<AuthMeResponse>(API_ENDPOINTS.profile, {
      method: 'PATCH',
      body: JSON.stringify({
        name: patch.name,
        phone: patch.phone,
        title: patch.title,
        avatar_url: patch.avatarUrl,
        profile_role: patch.profileRole,
        language: patch.language,
      }),
    });
    if (String(updated.id) !== userId) return undefined;
    return mapProfile(updated);
  },
};
