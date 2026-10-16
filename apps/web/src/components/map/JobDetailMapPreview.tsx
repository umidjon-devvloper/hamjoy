'use client';

import type { MapMarkerData } from '@/types';
import { JobMap } from './JobMap';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MapPin } from 'lucide-react';

interface JobDetailMapPreviewProps {
  marker?: MapMarkerData;
  isRemote?: boolean;
  locationLabel?: string;
}

export function JobDetailMapPreview({
  marker,
  isRemote,
  locationLabel,
}: JobDetailMapPreviewProps) {
  if (isRemote) {
    return null;
  }

  if (!marker) {
    return (
      <section className="card p-5 sm:p-6">
        <SectionHeader title="Location" />
        <p className="text-sm text-[var(--color-muted)]">
          {locationLabel ?? 'Location details are not available for this listing.'}
        </p>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title="Location on map" />
      <JobMap
        markers={[marker]}
        jobCount={1}
        title={marker.location}
        className="min-h-[220px] sm:min-h-[260px]"
        initialSelectedJobId={marker.jobId}
        showHeader={false}
        showLegend={false}
        showProviderBadge
      />
      <p className="text-xs text-[var(--color-muted)] mt-2 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
        {locationLabel ?? marker.location}
      </p>
    </section>
  );
}
