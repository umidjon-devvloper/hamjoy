import { createClient, type JoymeeClient, type TokenStore } from '@joymee/sdk';

const ACCESS_KEY = 'joymee:access';
const REFRESH_KEY = 'joymee:refresh';

const safeGet = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage full or blocked — ignore */
  }
};

export const joymeeTokens: TokenStore = {
  getAccess: () => safeGet(ACCESS_KEY),
  getRefresh: () => safeGet(REFRESH_KEY),
  setTokens: (access, refresh) => {
    safeSet(ACCESS_KEY, access);
    safeSet(REFRESH_KEY, refresh);
  },
  clear: () => {
    safeSet(ACCESS_KEY, null);
    safeSet(REFRESH_KEY, null);
  },
};

let singleton: JoymeeClient | null = null;

export function getJoymeeClient(): JoymeeClient {
  if (!singleton) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:4000';
    singleton = createClient({
      baseUrl,
      tokens: joymeeTokens,
      onUnauthorized: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('joymee:unauthorized'));
        }
      },
    });
  }
  return singleton;
}

export function hasJoymeeSession(): boolean {
  return safeGet(ACCESS_KEY) !== null;
}
