import { getApiBaseUrl } from './config';
import { apiTokenStore } from './token';
import type { ApiErrorBody } from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly body?: ApiErrorBody;

  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function buildUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiError('NEXT_PUBLIC_API_URL is not set', 0);
  }
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Thin fetch wrapper for future Django REST integration.
 * Services will call this instead of Firebase/mock when getAppDataMode() === 'rest'.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildUrl(path);
  const headers = new Headers(init?.headers);

  const token = apiTokenStore.get();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    let body: ApiErrorBody | undefined;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = undefined;
    }
    const detail =
      typeof body?.detail === 'string' ? body.detail : response.statusText || 'Request failed';
    throw new ApiError(detail, response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
