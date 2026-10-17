import React from 'react';
import { cn } from '@/lib/utils';

/** Marks sample data so demo listings are never mistaken for real ones. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      title="Namuna eʼlonlar — haqiqiy eʼlonlar tez orada qoʻshiladi"
      className={cn(
        'inline-flex shrink-0 items-center h-6 rounded-md bg-[var(--color-accent-light)] px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#7A5A12]',
        className
      )}
    >
      Demo
    </span>
  );
}
