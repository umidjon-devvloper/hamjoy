import { describe, expect, it, vi } from 'vitest';
import { getAppDataMode } from '@/lib/data-source';

describe('getAppDataMode', () => {
  it('defaults to mock without env', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_API_KEY', '');
    expect(getAppDataMode()).toBe('mock');
    vi.unstubAllEnvs();
  });
});
