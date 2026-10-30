'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navigation, X } from 'lucide-react';
import type { PropertyListing } from '@/types/listing';
import type { MapCoordinates } from '@/types';
import { boundsAround } from '@/lib/map/distance';
import { tileGridForBounds, projectWithinBounds, fitZoomForBounds } from '@/lib/map/tiles';
import { MAP_TILE_ATTRIBUTION } from '@/lib/map/config';
import { formatListingPrice } from '@/lib/listings/format';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';

interface ListingsTileMapProps {
  listings: PropertyListing[];
  center: MapCoordinates;
  radiusKm?: number;
  userLocation?: MapCoordinates | null;
  tileUrl?: string;
  className?: string;
}

export function ListingsTileMap({
  listings,
  center,
  radiusKm = 14,
  userLocation,
  tileUrl,
  className,
}: ListingsTileMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { grid, bounds, zoom } = useMemo(() => {
    const b = boundsAround(center, radiusKm * 1.3);
    const z = fitZoomForBounds(b, 5);
    return { grid: tileGridForBounds(b, z, tileUrl), bounds: b, zoom: z };
  }, [center, radiusKm, tileUrl]);

  const pins = useMemo(() => {
    const raw = listings
      .filter((l) => typeof l.lat === 'number' && typeof l.lng === 'number')
      .map((l) => ({ listing: l, pos: projectWithinBounds(l.lat!, l.lng!, bounds, zoom) }))
      .filter((p) => p.pos.inView);

    const adjusted = raw.map((p) => ({
      ...p,
      x: parseFloat(p.pos.left),
      y: parseFloat(p.pos.top),
      offsetY: 0,
    }));

    for (let i = 0; i < adjusted.length; i++) {
      for (let j = i + 1; j < adjusted.length; j++) {
        const dx = Math.abs(adjusted[i].x - adjusted[j].x);
        const dy = Math.abs((adjusted[i].y + adjusted[i].offsetY) - (adjusted[j].y + adjusted[j].offsetY));
        if (dx < 6 && dy < 3.5) {
          adjusted[j].offsetY += 3.5 - dy;
        }
      }
    }

    return adjusted;
  }, [listings, bounds, zoom]);

  const userPos = userLocation
    ? projectWithinBounds(userLocation.lat, userLocation.lng, bounds, zoom)
    : null;

  const selected = listings.find((l) => l.id === selectedId) ?? null;

  const handlePinClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId((cur) => (cur === id ? null : id));
  }, []);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-slate-100',
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
      </div>

      {/* Listing pins — yellow/gold like Joymee */}
      {pins.map(({ listing: l, pos, offsetY }) => {
        const isSel = selectedId === l.id;
        return (
          <button
            key={l.id}
            type="button"
            onClick={(e) => handlePinClick(e, l.id)}
            className={cn(
              'absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-md transition-transform hover:scale-110 focus:outline-none',
              isSel
                ? 'z-20 scale-110 bg-[var(--color-secondary)] text-white'
                : 'bg-amber-400 text-[var(--color-secondary)]'
            )}
            style={{ top: `calc(${pos.top} + ${offsetY}%)`, left: pos.left }}
            aria-label={l.title}
          >
            {formatListingPrice(l)}
            {/* Pin triangle */}
            <span
              className={cn(
                'absolute left-1/2 top-full -translate-x-1/2 border-x-[5px] border-t-[6px] border-x-transparent',
                isSel ? 'border-t-[var(--color-secondary)]' : 'border-t-amber-400'
              )}
            />
          </button>
        );
      })}

      {/* User location */}
      {userPos?.inView && (
        <span
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ top: userPos.top, left: userPos.left }}
          aria-label="Sizning joylashuvingiz"
        >
          <span className="relative flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand-green)]/50 opacity-60" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-[var(--color-brand-green)] ring-2 ring-white" />
          </span>
        </span>
      )}

      {/* Attribution */}
      <span className="absolute bottom-1 left-1 z-10 rounded bg-white/80 px-1.5 py-0.5 text-[9px] text-[var(--color-muted)] backdrop-blur">
        {tileUrl ? '© Google Maps' : MAP_TILE_ATTRIBUTION}
      </span>

      {/* Count badge */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--color-secondary)] shadow backdrop-blur">
        <Navigation className="h-3.5 w-3.5 text-[var(--color-brand-green)]" />
        {pins.length} ta eʼlon
      </div>

      {/* Selected listing card */}
      {selected && (
        <div className="absolute bottom-4 left-3 right-3 z-30 sm:left-auto sm:right-4 sm:w-80">
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-white hover:bg-black/60"
              aria-label="Yopish"
            >
              <X className="h-4 w-4" />
            </button>
            {selected.images[0] && (
              <Image
                src={selected.images[0]}
                alt={selected.title}
                width={320}
                height={150}
                className="h-[150px] w-full object-cover"
              />
            )}
            <div className="p-3">
              <p className="text-lg font-extrabold tracking-tight text-[var(--color-secondary)]">
                {formatListingPrice(selected)}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-[var(--color-secondary)]">{selected.title}</p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                {[selected.rooms && `${selected.rooms} xona`, selected.area && `${selected.area} m²`, selected.district]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <Link
                href={ROUTES.listing(selected.id)}
                className="mt-3 block rounded-xl bg-[var(--color-brand-green)] py-2 text-center text-sm font-semibold text-white transition-colors hover:brightness-95"
              >
                Batafsil
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
