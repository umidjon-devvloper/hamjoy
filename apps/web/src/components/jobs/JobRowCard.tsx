'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, MapPin } from 'lucide-react';
import type { JobListItem } from '@/types';
import { SCHEDULE_TYPE_LABELS, WORK_TYPE_LABELS } from '@/types';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { appToast } from '@/lib/feedback/toast';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/LoadingState';

const MONO_TINTS = [
  'bg-[var(--color-primary-light)] text-[var(--color-brand-green)]',
  'bg-[var(--color-accent-light)] text-[#7A5A12]',
  'bg-[#EEF0F3] text-[#2C3440]',
];

/** Two letters for the company tile — jobs have no photos and logos are tiny. */
function monogram(company: string) {
  const words = company.trim().split(/\s+/);
  return (words.length > 1 ? words[0][0] + words[1][0] : company.slice(0, 2)).toUpperCase();
}

function tint(company: string) {
  let h = 0;
  for (const ch of company) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return MONO_TINTS[h % MONO_TINTS.length];
}

/** Horizontal job row: company tile, title and chips, salary + save + apply on the right. */
export function JobRowCard({ job, isNew }: { job: JobListItem; isNew?: boolean }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(job.id);

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push(ROUTES.login);
      return;
    }
    try {
      appToast.favoriteToggled(await toggleFavorite(job.id));
    } catch (err) {
      appToast.error(err, 'Saqlanganlarni yangilab boʻlmadi');
    }
  };

  const chips = [
    job.isRemote ? WORK_TYPE_LABELS.remote : SCHEDULE_TYPE_LABELS[job.scheduleType],
    ...job.tags.slice(0, 2),
  ];

  return (
    <article className="card card-hover relative flex flex-wrap gap-[18px] rounded-[22px] p-5">
      <span
        aria-hidden
        className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold tracking-[-0.02em]', tint(job.company))}
      >
        {monogram(job.company)}
      </span>
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[var(--color-muted)]">{job.company}</span>
          {(isNew || job.isFeatured) && (
            <span className="flex h-[22px] items-center rounded-md bg-[var(--color-brand-gold-soft)] px-2 text-[11px] font-bold tracking-[0.06em] text-[#3D2E07]">
              {job.isFeatured ? 'TOP' : 'YANGI'}
            </span>
          )}
        </div>
        <h3 className="text-[19px] font-bold tracking-[-0.015em] text-[var(--color-secondary)]">
          <Link
            href={ROUTES.job(job.id)}
            className="after:absolute after:inset-0 after:rounded-[22px] after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[var(--color-brand-green)]/40"
          >
            {job.title}
          </Link>
        </h3>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          <li className="flex h-7 items-center gap-1.5 rounded-lg bg-[var(--color-field)] px-2.5 text-[13px] font-medium">
            <MapPin className="h-[13px] w-[13px]" aria-hidden />
            {job.location}
          </li>
          {chips.map((c) => (
            <li key={c} className="flex h-7 items-center rounded-lg bg-[var(--color-field)] px-2.5 text-[13px] font-medium">
              {c}
            </li>
          ))}
        </ul>
      </div>
      <div className="ml-auto flex flex-[0_1_220px] flex-col items-end justify-between gap-3">
        <div className="flex flex-col items-end">
          <span className="tabular text-xl font-extrabold tracking-[-0.02em] text-[var(--color-brand-green)]">{job.salary}</span>
          <span className="text-[13px] text-[var(--color-muted)]">{job.postedAt}</span>
        </div>
        <div className="relative z-10 flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            aria-pressed={saved}
            aria-label={saved ? 'Saqlanganlardan olib tashlash' : 'Saqlash'}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl border transition-colors',
              saved
                ? 'border-[var(--color-brand-green)] bg-[var(--color-primary-light)] text-[var(--color-brand-green)]'
                : 'border-[#DADBD5] bg-white text-[var(--color-secondary)] hover:text-[var(--color-brand-green)]'
            )}
          >
            <Bookmark className="h-[18px] w-[18px]" fill={saved ? 'currentColor' : 'none'} />
          </button>
          <Link
            href={ROUTES.job(job.id)}
            className="flex h-11 items-center rounded-xl bg-[var(--color-brand-green)] px-[18px] text-sm font-bold text-white transition-colors hover:bg-[var(--color-brand-green-deep)]"
          >
            Ariza berish
          </Link>
        </div>
      </div>
    </article>
  );
}

export function JobRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3.5" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card flex gap-4 rounded-[22px] p-5">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
