'use client';

import { MapPin } from 'lucide-react';
import type { MapCoordinates } from '@/types';
import { pickerDemoPoints } from '@/lib/map/coordinates';
import { mapService } from '@/services/map.service';
import { JobMap } from '@/components/map/JobMap';
import { cn } from '@/lib/utils';

interface MapLocationPickerProps {
  lat?: number;
  lng?: number;
  disabled?: boolean;
  onSelect: (lat: number, lng: number) => void;
}

export function MapLocationPicker({ lat, lng, disabled, onSelect }: MapLocationPickerProps) {
  const hasSelection = lat !== undefined && lng !== undefined;
  const pickerPoints = pickerDemoPoints();

  const markers = hasSelection
    ? [mapService.getPickerMarker({ lat: lat!, lng: lng! })]
    : [];

  return (
    <div className={cn(disabled && 'pointer-events-none opacity-60')}>
      <p className="mb-1.5 text-sm font-medium text-[var(--color-secondary)]">
        Xaritadagi joylashuv
      </p>

      {disabled ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-gray-50 p-6 text-center">
          <MapPin className="mx-auto mb-2 h-8 w-8 text-[var(--color-muted)]" />
          <p className="text-sm text-[var(--color-muted)]">
            Masofaviy ish uchun xaritada nuqta tanlash shart emas.
          </p>
        </div>
      ) : (
        <>
          <JobMap
            markers={markers}
            mode="picker"
            onPickerSelect={(coords: MapCoordinates) => onSelect(coords.lat, coords.lng)}
            pickerPoints={pickerPoints}
            showHeader={false}
            showLegend={false}
            showProviderBadge
            className="aspect-[16/10] min-h-0 sm:aspect-[2/1]"
          />
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            {hasSelection ? (
              <>
                Tanlandi: {lat!.toFixed(4)}, {lng!.toFixed(4)}. Hozircha demo koordinatalar
                ishlatiladi.
              </>
            ) : (
              <>Joylashuvni belgilash uchun xaritadagi nuqtalardan birini tanlang.</>
            )}
          </p>
        </>
      )}
    </div>
  );
}
