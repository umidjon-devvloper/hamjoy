'use client';

import type { MapMarkerData } from '@/types';
import { JobMap } from './JobMap';

export interface MapPreviewProps {
  markers: MapMarkerData[];
  jobCount: number;
  title?: string;
  className?: string;
}

/** Backward-compatible wrapper around JobMap */
export function MapPreview({ markers, jobCount, title, className }: MapPreviewProps) {
  return (
    <JobMap
      markers={markers}
      jobCount={jobCount}
      title={title}
      className={className}
      showHeader
      showLegend
    />
  );
}
