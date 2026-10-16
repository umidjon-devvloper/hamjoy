const API_TOKEN_STORAGE_KEY = 'jobmarket:api-token';

export const apiTokenStore = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(API_TOKEN_STORAGE_KEY);
  },

  set(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (!token) {
      localStorage.removeItem(API_TOKEN_STORAGE_KEY);
      return;
    }
    localStorage.setItem(API_TOKEN_STORAGE_KEY, token);
  },
};
