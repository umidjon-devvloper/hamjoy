import { describe, expect, it } from 'vitest';
import { formatUserError } from '@/lib/errors/format-user-error';

describe('formatUserError', () => {
  it('returns fallback for unknown errors', () => {
    expect(formatUserError(null, 'Fallback')).toBe('Fallback');
  });

  it('returns Error message when present', () => {
    expect(formatUserError(new Error('Boom'), 'Fallback')).toBe('Boom');
  });
});
