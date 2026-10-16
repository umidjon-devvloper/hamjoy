import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_SESSION_COOKIE } from '@/lib/auth/session-cookie';

const PROTECTED_PREFIXES = [
  '/create',
  '/favorites',
  '/profile',
  '/my-jobs',
  '/chat',
  '/settings',
] as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth disabled during early development: no route is gated, and the marketing
  // landing is skipped so visitors land straight on the jobs feed. Re-enable by
  // setting NEXT_PUBLIC_ENABLE_AUTH=true.
  if (process.env.NEXT_PUBLIC_ENABLE_AUTH !== 'true') {
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/home';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const hasSession = request.cookies.get(AUTH_SESSION_COOKIE)?.value === '1';
  // /admin has its own staff login (src/lib/admin/access.ts), so site sessions don't gate it.

  if (isProtectedPath(pathname) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/create',
    '/favorites',
    '/profile/:path*',
    '/my-jobs',
    '/chat/:path*',
    '/settings',
  ],
};
