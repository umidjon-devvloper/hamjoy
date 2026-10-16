'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, X } from 'lucide-react';
import type { JobListItem, MapCoordinates } from '@/types';
import { boundsAround } from '@/lib/map/distance';
import { tileGridForBounds, projectWithinBounds, fitZoomForBounds } from '@/lib/map/tiles';
import { MAP_TILE_ATTRIBUTION } from '@/lib/map/config';
import { cn } from '@/lib/utils';

interface JobsTileMapProps {
  jobs: JobListItem[];
  center: MapCoordinates;
  radiusKm?: number;
  userLocation?: MapCoordinates | null;
  className?: string;
}

/**
 * A real OSM-tiled map. Renders a tile grid for the viewport bounds and overlays
 * job pins projected with the exact same Mercator math, so markers sit on the
 * right streets. Lightweight (plain <img> tiles) — no map engine dependency.
 */
export function JobsTileMap({
  jobs,
  center,
  radiusKm = 12,
  userLocation,
  className,
}: JobsTileMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { grid, bounds, zoom } = useMemo(() => {
    const b = boundsAround(center, radiusKm * 1.3);
    const z = fitZoomForBounds(b, 3);
    return { grid: tileGridForBounds(b, z), bounds: b, zoom: z };
  }, [center, radiusKm]);

  const pins = useMemo(
    () =>
      jobs
        .filter((j) => typeof j.lat === 'number' && typeof j.lng === 'number')
        .map((j) => ({ job: j, pos: projectWithinBounds(j.lat as number, j.lng as number, bounds, zoom) }))
        .filter((p) => p.pos.inView),
    [jobs, bounds, zoom]
  );

  const userPos = userLocation
    ? projectWithinBounds(userLocation.lat, userLocation.lng, bounds, zoom)
    : null;

  const selected = jobs.find((j) => j.id === selectedId) ?? null;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-slate-100 shadow-[var(--shadow-card)]',
        className
      )}
    >
      {/* Tile backdrop */}
      <div className="absolute inset-0">
        {grid.tiles.map((t) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${t.left}-${t.top}`}
            src={t.url}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="absolute object-cover"
            style={{ left: t.left, top: t.top, width: t.width, height: t.height }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
      </div>

      {/* Job pins */}
      {pins.map(({ job, pos }) => (
        <button
          key={job.id}
          type="button"
          onClick={() => setSelectedId((cur) => (cur === job.id ? null : job.id))}
          className="absolute z-10 -translate-x-1/2 -translate-y-full transition-transform hover:scale-110 focus:outline-none"
          style={{ top: pos.top, left: pos.left }}
          aria-label={job.title}
        >
          <span
            className={cn(
              'flex items-center justify-center rounded-full shadow-lg ring-2 ring-white',
              selectedId === job.id
                ? 'bg-[var(--color-accent)] w-8 h-8'
                : 'bg-[var(--color-primary)] w-7 h-7'
            )}
          >
            <MapPin className="w-4 h-4 text-white" fill="currentColor" />
          </span>
        </button>
      ))}

      {/* User location */}
      {userPos?.inView && (
        <span
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ top: userPos.top, left: userPos.left }}
          aria-label="Sizning joylashuvingiz"
        >
          <span className="relative flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-600 ring-2 ring-white" />
          </span>
        </span>
      )}

      {/* Attribution */}
      <span className="absolute bottom-1 right-1 z-10 rounded bg-white/80 px-1.5 py-0.5 text-[9px] text-[var(--color-muted)] backdrop-blur">
        {MAP_TILE_ATTRIBUTION}
      </span>

      {/* Count badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--color-secondary)] shadow backdrop-blur">
        <Navigation className="h-3.5 w-3.5 text-[var(--color-primary)]" />
        {pins.length} ta ish ko‘rsatilmoqda
      </div>

      {/* Selected job card */}
      {selected && (
        <div className="absolute bottom-3 left-3 right-3 z-30 sm:left-auto sm:w-80">
          <div className="card relative p-4 shadow-[var(--shadow-card-hover)]">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-[var(--color-muted)] hover:bg-gray-200"
              aria-label="Yopish"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="pr-8 text-sm font-semibold leading-snug text-[var(--color-secondary)] line-clamp-2">
              {selected.title}
            </h3>
            <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">{selected.company}</p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="font-semibold text-[var(--color-success)]">{selected.salary}</span>
              {typeof selected.distanceKm === 'number' && (
                <span className="rounded-md bg-[var(--color-primary-light)] px-2 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
                  {selected.distanceKm < 1 ? '<1' : Math.round(selected.distanceKm)} km
                </span>
              )}
            </div>
            <Link
              href={`/job/${selected.id}`}
              className="mt-3 block rounded-xl bg-[var(--color-primary)] py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark,#1d4ed8)]"
            >
              Batafsil
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
