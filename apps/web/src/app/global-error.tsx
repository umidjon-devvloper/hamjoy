'use client';

import '@/app/globals.css';
import { ErrorState } from '@/components/ui/ErrorState';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <ErrorState
            title="Application error"
            description={error.message || 'An unexpected error occurred.'}
            onRetry={reset}
          />
          <div className="mt-4 text-center">
            <Link href="/home">
              <Button variant="ghost">Go to Home</Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
