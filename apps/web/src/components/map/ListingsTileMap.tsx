'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navigation, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { PropertyListing } from '@/types/listing';
import type { MapCoordinates } from '@/types';
import { formatListingPrice } from '@/lib/listings/format';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

interface ListingsTileMapProps {
  listings: PropertyListing[];
  center: MapCoordinates;
  radiusKm?: number;
  userLocation?: MapCoordinates | null;
  tileUrl?: string;
  className?: string;
}

function createPriceIcon(price: string, isSelected: boolean) {
  const bg = isSelected ? 'var(--color-secondary)' : '#fbbf24';
  const color = isSelected ? '#fff' : 'var(--color-secondary)';
  const scale = isSelected ? 'transform: scale(1.15);' : '';
  const shadow = isSelected
    ? '0 4px 12px rgba(0,0,0,.35)'
    : '0 2px 8px rgba(0,0,0,.2)';
  return L.divIcon({
    className: '',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    html: `<div style="
      position: absolute; bottom: 0; left: 50%;
      transform: translateX(-50%) ${scale};
      transform-origin: bottom center;
      display: flex; flex-direction: column; align-items: center;
      cursor: pointer; filter: drop-shadow(${shadow});
    ">
      <div style="
        background: ${bg}; color: ${color};
        padding: 5px 12px; border-radius: 20px;
        font-size: 13px; font-weight: 700; letter-spacing: -0.2px;
        white-space: nowrap; line-height: 1.2;
      ">${price}</div>
      <div style="
        width: 0; height: 0;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-top: 8px solid ${bg};
        margin-top: -1px;
      "></div>
    </div>`,
  });
}

function createUserIcon() {
  return L.divIcon({
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    html: `<span style="
      display: flex; width: 16px; height: 16px;
      border-radius: 50%; background: var(--color-brand-green);
      box-shadow: 0 0 0 2px white, 0 0 8px rgba(30,181,58,.5);
    "></span>`,
  });
}

function RecenterMap({ center }: { center: MapCoordinates }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center.lat, center.lng, map]);
  return null;
}

function CountBadge({ count }: { count: number }) {
  return (
    <div className="absolute left-3 top-3 z-[1000] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--color-secondary)] shadow backdrop-blur">
      <Navigation className="h-3.5 w-3.5 text-[var(--color-brand-green)]" />
      {count} ta eʼlon
    </div>
  );
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

  const pins = useMemo(
    () => listings.filter((l) => typeof l.lat === 'number' && typeof l.lng === 'number'),
    [listings],
  );

  const selected = listings.find((l) => l.id === selectedId) ?? null;

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedId((cur) => (cur === id ? null : id));
  }, []);

  const tileSource = tileUrl ?? 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
  const attribution = tileUrl ? '&copy; Google Maps' : '&copy; Google Maps';

  const zoom = radiusKm <= 5 ? 14 : radiusKm <= 10 ? 13 : radiusKm <= 20 ? 12 : 11;

  return (
    <div className={cn('relative overflow-hidden bg-slate-100', className)}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="absolute inset-0 z-0"
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer url={tileSource} attribution={attribution} maxZoom={19} />
        <RecenterMap center={center} />

        {pins.map((l) => {
          const isSel = selectedId === l.id;
          return (
            <Marker
              key={l.id}
              position={[l.lat!, l.lng!]}
              icon={createPriceIcon(formatListingPrice(l), isSel)}
              eventHandlers={{ click: () => handleMarkerClick(l.id) }}
            />
          );
        })}

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserIcon()}
            interactive={false}
          />
        )}
      </MapContainer>

      <CountBadge count={pins.length} />

      {selected && (
        <div className="absolute bottom-4 left-3 right-3 z-[1000] sm:left-auto sm:right-4 sm:w-80">
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
