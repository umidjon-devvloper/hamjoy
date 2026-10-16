'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this page. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('card flex flex-col items-center text-center px-6 py-14', className)}>
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center mb-5">
        <AlertCircle className="w-8 h-8" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">{title}</h3>
      <p className="text-[var(--color-muted)] text-sm max-w-xs leading-relaxed mb-6">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
