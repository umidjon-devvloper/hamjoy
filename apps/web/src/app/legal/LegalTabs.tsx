'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/legal/privacy', label: 'Maxfiylik siyosati' },
  { href: '/legal/terms', label: 'Foydalanish shartlari' },
];

export function LegalTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Huquqiy hujjatlar" className="flex self-start rounded-[14px] border border-[var(--color-border)] bg-white p-1">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-10 items-center rounded-[10px] px-4 text-sm font-semibold transition-colors',
              active ? 'bg-[var(--color-brand-green)] text-white' : 'text-[#3A3F47] hover:bg-[var(--color-primary-light)]'
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
