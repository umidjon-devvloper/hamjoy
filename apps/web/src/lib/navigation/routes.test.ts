import { describe, expect, it } from 'vitest';
import { isRouteActive, ROUTES } from '@/lib/navigation/routes';

describe('isRouteActive', () => {
  it('matches home only on exact path', () => {
    expect(isRouteActive('/home', ROUTES.home)).toBe(true);
    expect(isRouteActive('/job/1', ROUTES.home)).toBe(false);
  });

  it('matches nested chat routes', () => {
    expect(isRouteActive('/chat/abc', ROUTES.chat)).toBe(true);
  });
});
