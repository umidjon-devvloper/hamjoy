/**
 * Data backend switch — today everything uses local services (mock + localStorage).
 * Set NEXT_PUBLIC_API_URL when Django REST API is ready; repositories will migrate later.
 */
export type DataBackend = 'local' | 'rest';

export function getDataBackend(): DataBackend {
  return process.env.NEXT_PUBLIC_API_URL?.trim() ? 'rest' : 'local';
}

export function getApiBaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim();
  return url ? url.replace(/\/$/, '') : null;
}

export function isRestBackendEnabled(): boolean {
  return getDataBackend() === 'rest';
}
