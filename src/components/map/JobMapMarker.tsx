'use client';

import { MapPin } from 'lucide-react';
import type { MapMarkerData } from '@/types';
import { cn } from '@/lib/utils';

interface JobMapMarkerProps {
  marker: MapMarkerData;
  isSelected: boolean;
  onSelect: (jobId: string) => void;
}

export function JobMapMarker({ marker, isSelected, onSelect }: JobMapMarkerProps) {
  return (
    <button
      type="button"
      className="absolute z-10 -translate-x-1/2 -translate-y-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-2xl"
      style={{ top: marker.position.top, left: marker.position.left }}
      onClick={() => onSelect(marker.jobId)}
      aria-label={`${marker.title} — ${marker.location}`}
      aria-pressed={isSelected}
    >
      <div
        className={cn(
          'w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110',
          isSelected
            ? 'bg-[var(--color-primary)] text-white shadow-blue-500/30 scale-110'
            : marker.isRemote
              ? 'bg-white text-[var(--color-accent)] border border-[var(--color-border)]'
              : 'bg-white text-[var(--color-primary)] border border-[var(--color-border)]'
        )}
      >
        <MapPin className="w-5 h-5" fill={isSelected ? 'currentColor' : 'none'} />
      </div>

      {!isSelected && (
        <span className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 card px-2 py-1 text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none max-w-[120px] truncate">
          {marker.title}
        </span>
      )}
    </button>
  );
}
