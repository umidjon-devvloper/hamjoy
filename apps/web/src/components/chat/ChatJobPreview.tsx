'use client';

import Link from 'next/link';
import { ChevronRight, MapPin, DollarSign } from 'lucide-react';
import type { ChatHeaderInfo } from '@/types';

interface ChatJobPreviewProps {
  job: NonNullable<ChatHeaderInfo['job']>;
}

export function ChatJobPreview({ job }: ChatJobPreviewProps) {
  return (
    <Link
      href={`/job/${job.id}`}
      className="flex items-center gap-3 p-3 bg-[var(--color-primary-light)]/40 border border-[var(--color-primary)]/15 rounded-xl hover:bg-[var(--color-primary-light)]/60 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-secondary)] truncate">{job.title}</p>
        <p className="text-xs text-[var(--color-muted)] truncate">{job.company}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-[var(--color-muted)]">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[var(--color-primary)]" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1 text-[var(--color-success)] font-medium">
            <DollarSign className="w-3 h-3" />
            {job.salary}
          </span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
    </Link>
  );
}
