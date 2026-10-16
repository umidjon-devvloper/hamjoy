'use client';

import React from 'react';
import Link from 'next/link';
import { EyeOff } from 'lucide-react';
import { useListingModeration } from '@/lib/listings/moderation';
import { ROUTES } from '@/lib/navigation/routes';

/** Hides a listing the admin removed or sent back to review; everything else renders as-is. */
export function ListingVisibilityGate({ id, children }: { id: string; children: React.ReactNode }) {
  const { isVisible } = useListingModeration();
  if (isVisible(id)) return <>{children}</>;
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-16 text-center">
      <EyeOff className="mb-4 h-12 w-12 text-[var(--color-muted)]" />
      <h1 className="text-xl font-bold text-[var(--color-secondary)]">Eʼlon hozircha mavjud emas</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">U moderator tomonidan oʻchirilgan yoki tekshiruvda.</p>
      <Link href={ROUTES.home} className="mt-6 rounded-xl bg-[var(--color-secondary)] px-5 py-3 text-sm font-semibold text-white">
        Bosh sahifaga
      </Link>
    </main>
  );
}
