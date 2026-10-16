'use client';

import { ErrorState } from '@/components/ui/ErrorState';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <ErrorState
        title="Authentication error"
        description={error.message || 'Could not load the auth page.'}
        onRetry={reset}
      />
    </div>
  );
}
