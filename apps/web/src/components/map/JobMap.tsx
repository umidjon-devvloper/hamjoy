'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigation, MapPin } from 'lucide-react';
import type { MapCoordinates, MapMarkerData } from '@/types';
import { resolveMapImplementation } from '@/lib/map/providers';
import { getMapProviderMeta } from '@/lib/map/providers';
import { PlaceholderMapCanvas } from './PlaceholderMapCanvas';
import { JobMapMarker } from './JobMapMarker';
import { JobMapMiniCard } from './JobMapMiniCard';
import { cn } from '@/lib/utils';

export interface JobMapProps {
  markers: MapMarkerData[];
  jobCount?: number;
  title?: string;
  className?: string;
  initialSelectedJobId?: string | null;
  /** Picker mode for create-job flow */
  mode?: 'browse' | 'picker';
  pickerCoordinates?: MapCoordinates;
  onPickerSelect?: (coords: MapCoordinates) => void;
  pickerPoints?: Array<MapCoordinates & { top: string; left: string }>;
  showHeader?: boolean;
  showLegend?: boolean;
  showProviderBadge?: boolean;
}

export function JobMap({
  markers,
  jobCount,
  title = 'Jobs Near You',
  className,
  initialSelectedJobId = null,
  mode = 'browse',
  onPickerSelect,
  pickerPoints,
  showHeader = true,
  showLegend = true,
  showProviderBadge = true,
}: JobMapProps) {
  const provider = resolveMapImplementation();
  const providerMeta = getMapProviderMeta(provider);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(initialSelectedJobId);

  const selectedMarker = useMemo(
    () => markers.find((m) => m.jobId === selectedJobId) ?? null,
    [markers, selectedJobId]
  );

  const count = jobCount ?? markers.length;

  const handleMarkerSelect = useCallback((jobId: string) => {
    setSelectedJobId((current) => (current === jobId ? null : jobId));
  }, []);

  const handleCloseCard = useCallback(() => {
    setSelectedJobId(null);
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      setSelectedJobId(null);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [selectedJobId]);

  /**
   * Future: branch on provider === 'google' | 'yandex' | 'leaflet'
   * and render provider-specific map runtimes with the same marker/card API.
   */
  const renderMapSurface = () => {
    if (provider !== 'placeholder' && provider !== 'leaflet') {
      // Leaflet also not wired yet — placeholder until SDK integration
    }

    return (
      <PlaceholderMapCanvas showProviderBadge={showProviderBadge} className="absolute inset-0">
        {mode === 'browse' &&
          markers.map((marker) => (
            <JobMapMarker
              key={marker.id}
              marker={marker}
              isSelected={selectedJobId === marker.jobId}
              onSelect={handleMarkerSelect}
            />
          ))}

        {mode === 'picker' &&
          pickerPoints?.map((point, index) => (
            <button
              key={index}
              type="button"
              className="absolute z-10 -translate-x-1/2 -translate-y-full text-[var(--color-primary)] hover:scale-110 transition-transform"
              style={{ top: point.top, left: point.left }}
              onClick={() => onPickerSelect?.({ lat: point.lat, lng: point.lng })}
              aria-label={`Select location ${index + 1}`}
            >
              <MapPin className="w-8 h-8 drop-shadow" />
            </button>
          ))}

        {mode === 'picker' && markers.length > 0 && (
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-full text-[var(--color-success)] pointer-events-none"
            style={{ top: markers[0].position.top, left: markers[0].position.left }}
            aria-hidden
          >
            <MapPin className="w-9 h-9 drop-shadow-lg" fill="currentColor" />
          </div>
        )}
      </PlaceholderMapCanvas>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-card)] min-h-[320px]',
        className
      )}
    >
      {renderMapSurface()}

      {showHeader && mode === 'browse' && (
        <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none">
          <div className="card flex items-center gap-3 p-3 shadow-[var(--shadow-card-hover)] pointer-events-auto">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-[var(--color-secondary)] flex-1 min-w-0 truncate">
              {title}
            </span>
            <span className="text-xs font-bold text-[var(--color-success)] bg-[var(--color-success-light)] px-2.5 py-1 rounded-full shrink-0">
              {count} found
            </span>
          </div>
        </div>
      )}

      {selectedMarker && mode === 'browse' && (
        <div className="absolute bottom-20 sm:bottom-4 left-4 right-4 z-30 sm:left-auto sm:right-4 sm:w-[min(100%,320px)]">
          <JobMapMiniCard marker={selectedMarker} onClose={handleCloseCard} />
        </div>
      )}

      {showLegend && mode === 'browse' && (
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
          <div className="card p-3 flex flex-wrap gap-3 justify-center text-xs text-[var(--color-muted)] pointer-events-auto">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[var(--color-primary)]" />
              Selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-white border border-[var(--color-border)]" />
              On-site
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-white border border-[var(--color-accent)]/40" />
              Remote
            </span>
            {provider === 'placeholder' && (
              <span className="text-[10px] w-full text-center text-[var(--color-muted)]">
                {providerMeta.description}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
