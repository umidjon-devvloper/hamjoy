'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { List, Map as MapIcon } from 'lucide-react';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';

const VIEWS = [
  { href: ROUTES.jobs, label: 'Roʻyxat', icon: List },
  { href: ROUTES.map, label: 'Xarita', icon: MapIcon },
];

/** Ish mode: list ↔ map, both under the persistent navbar. */
export function JobsViewToggle({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Koʻrinish"
      className={cn(
        'inline-flex rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1',
        className
      )}
    >
      {VIEWS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-gold)]/70',
              active
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-[var(--color-muted)] hover:text-[var(--color-secondary)]'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
