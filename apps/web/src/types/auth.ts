export type AuthProviderId = 'mock' | 'firebase' | 'rest';

export interface AuthSession {
  userId: string;
  email: string;
  provider: AuthProviderId;
  /** True when using development mock auth — never use in production */
  isMock: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  profileRole: import('./user').ProfileRole;
}

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
}
