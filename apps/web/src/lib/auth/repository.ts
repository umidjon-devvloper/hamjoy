import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from '@/types';

/**
 * Auth repository contract for Firebase Auth, Supabase Auth, or custom backends.
 * The mock adapter implements this for local development only.
 */
export interface AuthRepository {
  signInWithEmail(credentials: LoginCredentials): Promise<AuthSession>;
  signUpWithEmail(credentials: RegisterCredentials): Promise<AuthSession>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  getAuthUser(): Promise<AuthUser | null>;
  onAuthStateChanged?(callback: (session: AuthSession | null) => void): () => void;
}
