'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { appToast } from '@/lib/feedback/toast';
import { useSavedListings } from '@/lib/listings/favorites';

/** Heart toggle for a listing. `overlay` sits on a photo; `outline` sits on a white card. */
export function SaveListingButton({
  listingId,
  variant = 'overlay',
  className,
}: {
  listingId: string;
  variant?: 'overlay' | 'outline';
  className?: string;
}) {
  const { isSaved, toggleSaved } = useSavedListings();
  const saved = isSaved(listingId);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? 'Saqlanganlardan olib tashlash' : 'Saqlash'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const nowSaved = toggleSaved(listingId);
        if (nowSaved) appToast.success('Eʼlon saqlandi');
        else appToast.info('Eʼlon saqlanganlardan olib tashlandi');
      }}
      className={cn(
        'flex shrink-0 items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-gold)]/70 active:scale-95',
        variant === 'overlay'
          ? 'h-10 w-10 rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur hover:bg-white hover:text-rose-500'
          : 'h-11 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-secondary)] hover:border-rose-200 hover:bg-rose-50',
        className
      )}
    >
      <Heart
        className={cn('h-5 w-5 transition-colors', saved && 'fill-rose-500 text-rose-500')}
        strokeWidth={2}
      />
      {variant === 'outline' && (saved ? 'Saqlangan' : 'Saqlash')}
    </button>
  );
}
