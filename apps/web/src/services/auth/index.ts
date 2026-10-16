import { isFirebaseConfigured } from '@/lib/firebase/client';
import { getActiveAuthProvider } from '@/lib/auth/config';
import { isRestBackendEnabled } from '@/lib/api/config';
import { mockAuthRepository } from './mock-auth.adapter';
import { firebaseAuthRepository } from './firebase-auth.adapter';
import { restAuthRepository } from '@/lib/rest/repositories/profiles.repository';
import type { AuthRepository } from '@/lib/auth/repository';

export function getAuthRepository(): AuthRepository {
  if (isRestBackendEnabled()) {
    return restAuthRepository;
  }

  const provider = getActiveAuthProvider();

  if (provider === 'firebase' && isFirebaseConfigured()) {
    return firebaseAuthRepository;
  }

  return mockAuthRepository;
}
