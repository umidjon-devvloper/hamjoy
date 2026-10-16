const ERROR_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /authentication required/i, message: 'Please sign in to continue.' },
  { pattern: /blocked/i, message: 'This account has been blocked. Contact support.' },
  { pattern: /network|failed to fetch|offline/i, message: 'Network error. Check your connection and try again.' },
  { pattern: /permission|insufficient/i, message: 'You do not have permission to perform this action.' },
  { pattern: /not found/i, message: 'The requested item could not be found.' },
  { pattern: /already exists/i, message: 'An account with this email already exists.' },
];

export function formatUserError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const trimmed = message.trim();
  if (!trimmed) return fallback;

  for (const { pattern, message: friendly } of ERROR_PATTERNS) {
    if (pattern.test(trimmed)) return friendly;
  }

  return trimmed;
}
