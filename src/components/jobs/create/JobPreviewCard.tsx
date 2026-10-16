'use client';

import type { JobListItem } from '@/types';
import { Bookmark, MapPin, Clock } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface JobPreviewCardProps {
  job: JobListItem;
  className?: string;
}

export function JobPreviewCard({ job, className }: JobPreviewCardProps) {
  return (
    <article
      className={cn(
        'card p-4 sm:p-5 relative overflow-hidden border-[var(--color-primary)]/20 bg-gradient-to-br from-white to-[var(--color-primary-light)]/20',
        className
      )}
    >
      <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary-light)] px-2 py-0.5 rounded-md">
        Ko'rinish
      </span>

      <div className="flex justify-between items-start gap-3 mb-3.5">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-[var(--color-border)] shrink-0">
            <Image src={job.logo} alt="" width={32} height={32} className="object-contain" aria-hidden />
          </div>
          <div className="min-w-0 pr-16">
            <h3 className="font-semibold text-[var(--color-secondary)] text-base sm:text-lg truncate">
              {job.title || 'E\'lon sarlavhasi'}
            </h3>
            <p className="text-[var(--color-muted)] text-sm truncate">{job.company}</p>
          </div>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-gray-300 shrink-0"
          aria-hidden
        >
          <Bookmark className="w-5 h-5" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-muted)] mb-3.5">
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
          {job.location || 'Joylashuv'}
        </span>
        <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
        <span className="font-semibold text-[var(--color-success)]">{job.salary || 'Maosh'}</span>
        <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
        <span className="inline-flex items-center gap-1 text-xs">
          <Clock className="w-3.5 h-3.5" />
          {job.postedAt}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 bg-gray-50 rounded-lg text-xs font-medium text-[var(--color-muted)] border border-[var(--color-border)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
