import type {
  Chat,
  Listing,
  ListingSearchQuery,
  Message,
  Paginated,
  Profile,
  User,
} from '@joymee/types';
import { ApiError } from './errors';

export interface TokenStore {
  getAccess(): string | null | Promise<string | null>;
  getRefresh(): string | null | Promise<string | null>;
  setTokens(access: string, refresh: string): void | Promise<void>;
  clear(): void | Promise<void>;
}

export interface ClientOptions {
  baseUrl: string;
  tokens?: TokenStore;
  fetch?: typeof fetch;
  onUnauthorized?: () => void;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, unknown>;
  signal?: AbortSignal;
  auth?: boolean;
}

export class JoymeeClient {
  private readonly fetchImpl: typeof fetch;
  private refreshInFlight: Promise<string | null> | null = null;

  constructor(private readonly opts: ClientOptions) {
    this.fetchImpl = opts.fetch ?? fetch.bind(globalThis);
  }

  private url(path: string, query?: Record<string, unknown>): string {
    const url = new URL(path.replace(/^\//, ''), this.opts.baseUrl.endsWith('/') ? this.opts.baseUrl : this.opts.baseUrl + '/');
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue;
        url.searchParams.set(k, String(v));
      }
    }
    return url.toString();
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, query, signal, auth = true } = options;
    const headers: Record<string, string> = { 'content-type': 'application/json' };

    if (auth && this.opts.tokens) {
      const access = await this.opts.tokens.getAccess();
      if (access) headers['authorization'] = `Bearer ${access}`;
    }

    const res = await this.fetchImpl(this.url(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });

    if (res.status === 401 && auth && this.opts.tokens && !this.refreshInFlight) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        headers['authorization'] = `Bearer ${refreshed}`;
        const retry = await this.fetchImpl(this.url(path, query), {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
          signal,
        });
        return this.parse<T>(retry);
      }
      this.opts.onUnauthorized?.();
    }

    return this.parse<T>(res);
  }

  private async parse<T>(res: Response): Promise<T> {
    const text = await res.text();
    const data = text ? (JSON.parse(text) as unknown) : null;
    if (!res.ok) {
      const err = (data ?? {}) as { code?: string; message?: string; details?: unknown };
      throw new ApiError(res.status, err.code ?? 'unknown', err.message ?? res.statusText, err.details);
    }
    return data as T;
  }

  private async tryRefresh(): Promise<string | null> {
    if (!this.opts.tokens) return null;
    this.refreshInFlight ??= (async () => {
      const refresh = await this.opts.tokens!.getRefresh();
      if (!refresh) return null;
      const res = await this.fetchImpl(this.url('auth/refresh'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) {
        await this.opts.tokens!.clear();
        return null;
      }
      const { access, refresh: newRefresh } = (await res.json()) as { access: string; refresh: string };
      await this.opts.tokens!.setTokens(access, newRefresh);
      return access;
    })();
    try {
      return await this.refreshInFlight;
    } finally {
      this.refreshInFlight = null;
    }
  }

  readonly auth = {
    otpSend: (phone: string) => this.request<{ sent: true; expiresInSec: number; devCode?: string }>('auth/otp/send', { method: 'POST', body: { phone }, auth: false }),
    otpVerify: (phone: string, code: string) => this.request<{ access: string; refresh: string; user: User }>('auth/otp/verify', { method: 'POST', body: { phone, code }, auth: false }),
    logout: () => this.request<{ ok: true }>('auth/logout', { method: 'POST' }),
  };

  readonly users = {
    me: () => this.request<{ user: User; profile: Profile }>('users/me'),
    updateProfile: (patch: Partial<Profile>) => this.request<Profile>('users/me', { method: 'PATCH', body: patch }),
  };

  readonly listings = {
    search: (q: ListingSearchQuery) => this.request<Paginated<Listing>>('listings/search', { query: q as Record<string, unknown>, auth: false }),
    get: (id: string) => this.request<Listing>(`listings/${id}`, { auth: false }),
    create: (data: Partial<Listing>) => this.request<Listing>('listings', { method: 'POST', body: data }),
    update: (id: string, patch: Partial<Listing>) => this.request<Listing>(`listings/${id}`, { method: 'PATCH', body: patch }),
    publish: (id: string) => this.request<Listing>(`listings/${id}/publish`, { method: 'POST' }),
    remove: (id: string) => this.request<{ ok: true }>(`listings/${id}`, { method: 'DELETE' }),
  };

  readonly chats = {
    list: () => this.request<Array<Chat & { listing: { id: string; title: string; status: string } | null; unread: number }>>('chats'),
    start: (listingId: string) => this.request<Chat>('chats', { method: 'POST', body: { listingId } }),
    messages: (chatId: string, cursor?: string, limit?: number) =>
      this.request<{ items: Message[]; cursor: string | null }>(`chats/${chatId}/messages`, {
        query: { cursor, limit },
      }),
    send: (chatId: string, body: string, mediaUrl?: string | null) =>
      this.request<Message>(`chats/${chatId}/messages`, { method: 'POST', body: { body, mediaUrl } }),
    read: (chatId: string) => this.request<{ ok: true }>(`chats/${chatId}/read`, { method: 'POST' }),
  };

  /** Base URL for the Socket.io client (same origin as REST). */
  get wsBaseUrl(): string {
    return this.opts.baseUrl;
  }
}

export function createClient(opts: ClientOptions): JoymeeClient {
  return new JoymeeClient(opts);
}
