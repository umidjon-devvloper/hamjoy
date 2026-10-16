'use client';

import { ErrorState } from '@/components/ui/ErrorState';

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <ErrorState
        title="Failed to load page"
        description={error.message || 'Something went wrong while loading this page.'}
        onRetry={reset}
      />
    </div>
  );
}
