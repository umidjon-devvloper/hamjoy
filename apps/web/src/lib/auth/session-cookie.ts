/** Lightweight cookies read by Next.js proxy for route protection. */
export const AUTH_SESSION_COOKIE = 'jm-session';
export const AUTH_ROLE_COOKIE = 'jm-role';

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function setCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function clearCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function syncAuthSessionCookies(role: 'admin' | 'seeker' | 'poster' | string): void {
  setCookie(AUTH_SESSION_COOKIE, '1');
  setCookie(AUTH_ROLE_COOKIE, role);
}

export function clearAuthSessionCookies(): void {
  clearCookie(AUTH_SESSION_COOKIE);
  clearCookie(AUTH_ROLE_COOKIE);
}
