'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, Clock, MapPin, Phone, Star } from 'lucide-react';
import type { JobListItem } from '@/types';
import { SCHEDULE_TYPE_LABELS, WORK_TYPE_LABELS } from '@/types';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { appToast } from '@/lib/feedback/toast';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';
import { JobCardMiniMap } from '@/components/map/JobCardMiniMap';
import { Skeleton } from '@/components/ui/LoadingState';

const MAX_TAGS = 3;

/**
 * Vertical job card, styled like the Uy-joy listing cards: a map "cover" where the photo would be,
 * then salary, title, company, tags and a location/time footer. Same actions as JobCard
 * (save, reveal-then-call phone); the whole card opens the job.
 */
export function JobGridCard({ job, featured }: { job: JobListItem; featured?: boolean }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showPhone, setShowPhone] = useState(false);
  const isSaved = isFavorite(job.id);
  const showFeatured = featured ?? job.isFeatured;
  const tags = job.tags.slice(0, MAX_TAGS);
  const hiddenTags = job.tags.length - tags.length;

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

  const handlePhone = () => {
    // First tap reveals the number; a second tap places a call.
    if (!showPhone) setShowPhone(true);
    else if (job.contactPhone) window.location.href = `tel:${job.contactPhone.replace(/[^\d+]/g, '')}`;
  };

  return (
    <article
      className={cn(
        'card card-hover group relative flex flex-col overflow-hidden',
        showFeatured && 'border-[var(--color-primary)]/25'
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <JobCardMiniMap
          lat={job.lat}
          lng={job.lng}
          isRemote={job.isRemote}
          region={job.region}
          distanceKm={job.distanceKm}
          zoom={13}
          className="h-full w-full rounded-none border-0 transition-transform duration-500 group-hover:scale-[1.03]"
        />

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex gap-1.5">
          <span className="rounded-lg bg-[var(--color-primary)] px-2 py-1 text-xs font-bold text-white shadow-sm">
            {job.isRemote ? WORK_TYPE_LABELS.remote : SCHEDULE_TYPE_LABELS[job.scheduleType]}
          </span>
          {showFeatured && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-brand-gold)] px-2 py-1 text-xs font-bold text-gray-900 shadow-sm">
              <Star className="h-3 w-3" fill="currentColor" />
              TOP
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          aria-pressed={isSaved}
          aria-label={isSaved ? 'Saqlanganlardan olib tashlash' : 'Saqlash'}
          className={cn(
            'absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-gold)]/70',
            isSaved ? 'bg-[var(--color-primary)] text-white' : 'bg-white/90 text-gray-700 hover:bg-white hover:text-[var(--color-primary)]'
          )}
        >
          <Bookmark className="h-5 w-5" fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-lg font-extrabold tracking-tight text-[var(--color-success)]">{job.salary}</p>
        <div className="mt-1.5 flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-gray-50">
            <Image src={job.logo} alt="" width={24} height={24} className="object-contain" aria-hidden unoptimized />
          </span>
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-[15px] font-semibold text-[var(--color-secondary)]">
              {/* Stretched link: the whole card opens the job; buttons sit above it (z-10). */}
              <Link
                href={ROUTES.job(job.id)}
                className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-3xl focus-visible:after:ring-2 focus-visible:after:ring-[var(--color-brand-gold)]/70"
              >
                {job.title}
              </Link>
            </h3>
            <p className="truncate text-sm text-gray-600">{job.company}</p>
          </div>
        </div>

        <div className="mb-3.5 mt-2.5 flex flex-wrap items-center gap-1.5">
          {job.contactPhone && (
            <button
              type="button"
              onClick={handlePhone}
              aria-label={showPhone ? `Qoʻngʻiroq qilish: ${job.contactPhone}` : 'Telefon raqamini koʻrsatish'}
              className="relative z-10 inline-flex items-center gap-1 rounded-lg bg-[var(--color-success-light)] px-2 py-1 text-xs font-bold text-[var(--color-success)] transition-colors hover:bg-[var(--color-success)]/15"
            >
              <Phone className="h-3 w-3" />
              {showPhone ? job.contactPhone : 'Telefon'}
            </button>
          )}
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-[var(--color-border)] bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600"
            >
              {tag}
            </span>
          ))}
          {hiddenTags > 0 && <span className="text-xs font-medium text-gray-500">+{hiddenTags}</span>}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--color-border)] pt-3 text-xs text-gray-600">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{job.location}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {job.postedAt}
          </span>
        </div>
      </div>
    </article>
  );
}

/** Same grid as the cards, so the page doesn't jump when jobs load. */
export function JobGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card overflow-hidden">
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
