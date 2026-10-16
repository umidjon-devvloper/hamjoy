'use client';

import { ErrorState } from '@/components/ui/ErrorState';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
      <ErrorState
        title="Admin panel error"
        description={error.message || 'Something went wrong in the admin panel.'}
        onRetry={reset}
      />
    </div>
  );
}
