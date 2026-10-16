import React from 'react';
import { cn } from '@/lib/utils';

/** Marks sample data so demo listings are never mistaken for real ones. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      title="Namuna eʼlonlar — haqiqiy eʼlonlar tez orada qoʻshiladi"
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border border-[var(--color-brand-gold)]/50 bg-[var(--color-brand-gold-light)]/40 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#7A5A12]',
        className
      )}
    >
      Demo
    </span>
  );
}
