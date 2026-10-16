'use client';

import { useState } from 'react';
import { MapPin, Globe2 } from 'lucide-react';
import { staticTileForCoords } from '@/lib/map/tiles';
import { cn } from '@/lib/utils';

interface JobCardMiniMapProps {
  lat?: number;
  lng?: number;
  isRemote?: boolean;
  /** Region / city label shown as a chip, e.g. "Toshkent" */
  region?: string;
  /** Distance in km — rendered as a badge when present (nearby results) */
  distanceKm?: number;
  zoom?: number;
  className?: string;
}

/**
 * A tiny real map for a job card — a single OSM raster tile plus a CSS-positioned
 * pin. No map engine, so it's cheap to render dozens on a list. Falls back to a
 * styled gradient for remote jobs, missing coordinates, or a failed tile load.
 */
export function JobCardMiniMap({
  lat,
  lng,
  isRemote,
  region,
  distanceKm,
  zoom = 12,
  className,
}: JobCardMiniMapProps) {
  const [tileFailed, setTileFailed] = useState(false);
  const hasCoords = typeof lat === 'number' && typeof lng === 'number';
  const showMap = hasCoords && !isRemote && !tileFailed;
  const tile = showMap ? staticTileForCoords(lat as number, lng as number, zoom) : null;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50',
        className
      )}
      role="img"
      aria-label={
        isRemote ? 'Masofaviy ish' : region ? `Joylashuv: ${region}` : 'Joylashuv xaritasi'
      }
    >
      {tile ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tile.url}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden
            onError={() => setTileFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span
            className="absolute z-10 -translate-x-1/2 -translate-y-full drop-shadow"
            style={{ top: tile.pin.top, left: tile.pin.left }}
            aria-hidden
          >
            <MapPin className="h-5 w-5 text-[var(--color-primary)]" fill="currentColor" />
          </span>
        </>
      ) : (
        // Remote / no-coords / failed-tile fallback.
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, var(--color-border) 1px, transparent 0)',
              backgroundSize: '14px 14px',
            }}
          />
          <Globe2 className="relative h-7 w-7 text-[var(--color-primary)]/70" />
        </div>
      )}

      {/* Region / remote chip */}
      <span className="absolute bottom-1 left-1 right-1 z-10 truncate rounded-md bg-white/85 px-1.5 py-0.5 text-center text-[10px] font-semibold text-[var(--color-secondary)] backdrop-blur">
        {isRemote ? 'Masofaviy' : region ?? 'Joylashuv'}
      </span>

      {typeof distanceKm === 'number' && (
        <span className="absolute top-1 left-1 z-10 rounded-md bg-[var(--color-primary)] px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
          {distanceKm < 1 ? '<1' : Math.round(distanceKm)} km
        </span>
      )}
    </div>
  );
}
