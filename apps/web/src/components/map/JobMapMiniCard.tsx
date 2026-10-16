'use client';

import Link from 'next/link';
import { MapPin, DollarSign, X } from 'lucide-react';
import type { MapMarkerData } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface JobMapMiniCardProps {
  marker: MapMarkerData;
  onClose: () => void;
  className?: string;
}

export function JobMapMiniCard({ marker, onClose, className }: JobMapMiniCardProps) {
  return (
    <div
      className={cn(
        'card p-4 shadow-[var(--shadow-card-hover)] border border-[var(--color-border)] transition-opacity duration-200',
        className
      )}
      role="dialog"
      aria-label={`${marker.title} preview`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-[var(--color-secondary)] text-sm sm:text-base leading-snug line-clamp-2">
            {marker.title}
          </h3>
          {marker.company && (
            <p className="text-xs text-[var(--color-muted)] mt-0.5 truncate">{marker.company}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[var(--color-muted)] hover:bg-gray-200 shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <p className="flex items-center gap-2 text-sm text-[var(--color-success)] font-semibold">
          <DollarSign className="w-4 h-4 shrink-0" />
          {marker.salary}
        </p>
        <p className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <MapPin className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
          <span className="truncate">{marker.location}</span>
        </p>
      </div>

      <Link href={`/job/${marker.jobId}`} className="block">
        <Button size="sm" className="w-full">
          Open details
        </Button>
      </Link>
    </div>
  );
}
