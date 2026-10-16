'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ROUTES } from '@/lib/navigation/routes';

/** Sidebar of the job pages: posting here means a vacancy (Uy-joy posting lives in the platform navbar). */
export function PostListingButton() {
  return (
    <Link
      href={ROUTES.createJob}
      className="flex w-full items-center gap-3 rounded-2xl bg-[var(--color-accent)] px-4 py-3.5 text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
        <Plus className="h-6 w-6" strokeWidth={2.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-bold leading-tight">Ish joylash</span>
        <span className="block text-xs font-medium text-white/80">Vakansiya eʼloni</span>
      </span>
    </Link>
  );
}
