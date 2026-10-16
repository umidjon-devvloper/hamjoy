'use client';

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  label?: string;
  className?: string;
}

export function RefreshButton({ onRefresh, label = 'Refresh', className }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRefreshing}
      aria-label={label}
      className={cn(
        'w-11 h-11 rounded-xl card flex items-center justify-center text-[var(--color-muted)]',
        'hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 transition-colors',
        'active:scale-95 touch-manipulation disabled:opacity-60',
        className
      )}
    >
      <RefreshCw className={cn('w-5 h-5', isRefreshing && 'animate-spin')} aria-hidden />
    </button>
  );
}
