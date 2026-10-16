import type { AuthProviderId } from '@/types';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { isRestBackendEnabled } from '@/lib/api/config';

/**
 * Auth provider configuration.
 * REST API takes priority when NEXT_PUBLIC_API_URL is set.
 */
export function getActiveAuthProvider(): AuthProviderId {
  if (isRestBackendEnabled()) return 'rest';
  if (
    (process.env.NEXT_PUBLIC_AUTH_PROVIDER as AuthProviderId | undefined) === 'firebase' &&
    isFirebaseConfigured()
  ) {
    return 'firebase';
  }
  return 'mock';
}

export const AUTH_PROVIDER: AuthProviderId = getActiveAuthProvider();

export function isMockAuthEnabled(): boolean {
  return getActiveAuthProvider() === 'mock';
}

/**
 * Auth is intentionally OFF during early development: nobody is ever asked to
 * sign in or register, and everyone browses as the demo user. Flip it back on
 * later by setting NEXT_PUBLIC_ENABLE_AUTH=true.
 */
export function isAuthOptional(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_AUTH !== 'true';
}
