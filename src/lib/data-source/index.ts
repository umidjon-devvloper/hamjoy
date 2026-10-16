import { getDataSource, isBackendEnabled } from '@/lib/backend/config';
import { getApiBaseUrl, getDataBackend, isRestBackendEnabled } from '@/lib/api/config';

/**
 * How the app loads data today. One place to read env-driven mode — useful for debug UI and Django cutover.
 *
 * mock     → seed data + localStorage (no Firebase)
 * firebase → Firestore repositories via services
 * rest     → Django REST (http-client; not wired to services yet)
 */
export type AppDataMode = 'mock' | 'firebase' | 'rest';

export function getAppDataMode(): AppDataMode {
  if (isRestBackendEnabled()) return 'rest';
  if (isBackendEnabled()) return 'firebase';
  return 'mock';
}

export {
  getDataSource,
  isBackendEnabled,
  getDataBackend,
  isRestBackendEnabled,
  getApiBaseUrl,
};
