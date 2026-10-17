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

/** Ish mode: list ↔ map, both under the persistent navbar. `dark` sits on the green hero band. */
export function JobsViewToggle({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  const pathname = usePathname();
  const dark = tone === 'dark';

  return (
    <nav
      aria-label="Koʻrinish"
      className={cn(
        'inline-flex gap-1 rounded-[14px] p-1',
        dark ? 'bg-white/10' : 'border border-[var(--color-border)] bg-[var(--color-surface)]',
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
              'inline-flex min-h-10 items-center gap-1.5 rounded-[10px] px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-green)]/50',
              active
                ? dark
                  ? 'bg-white text-[var(--color-brand-green-deep)]'
                  : 'bg-[var(--color-brand-green)] text-white'
                : dark
                  ? 'text-white hover:bg-white/10'
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
