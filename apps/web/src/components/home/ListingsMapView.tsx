'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LocateFixed, Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import { ListingsTileMap } from '@/components/map/ListingsTileMap';
import { DEMO_LISTINGS } from '@/data/listings';
import { useUserListings } from '@/lib/listings/user-listings';
import { isRestBackendEnabled } from '@/lib/api/config';
import { apiListingToProperty } from '@/lib/listings/api-mapping';
import { useGeolocation } from '@/hooks/useGeolocation';
import { DEFAULT_MAP_CENTER } from '@/lib/map/config';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';
import type { PropertyListing, ListingDeal } from '@/types/listing';

const DEAL_TABS: { id: ListingDeal | 'all'; label: string }[] = [
  { id: 'sotuv', label: 'Sotuv' },
  { id: 'ijara', label: 'Ijara' },
  { id: 'all', label: 'Barchasi' },
];

export function ListingsMapView() {
  const router = useRouter();
  const { coords, status, request } = useGeolocation();
  const userListings = useUserListings();
  const [apiListings, setApiListings] = useState<PropertyListing[]>([]);
  const [deal, setDeal] = useState<ListingDeal | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('Toshkent, Oʻzbekiston');

  useEffect(() => {
    if (!isRestBackendEnabled()) return;
    import('@/lib/joymee/client').then(({ getJoymeeClient }) =>
      getJoymeeClient().listings.search({ vertical: 'uy-joy', limit: 50 })
    ).then((res) => {
      setApiListings(res.items.map((item: any) => apiListingToProperty(item)));
    }).catch(() => {});
  }, []);

  const apiIds = new Set(apiListings.map((a) => a.id));
  const allListings = [
    ...apiListings,
    ...userListings.filter((l) => !apiIds.has(l.id)),
    ...DEMO_LISTINGS.filter((d) => !apiIds.has(d.id)),
  ].filter((l) => !l.seeking);

  const filtered = deal === 'all' ? allListings : allListings.filter((l) => l.deal === deal);

  const center = coords ?? DEFAULT_MAP_CENTER;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-white">
      {/* Top bar: back + search + filter */}
      <div className="relative z-20 flex items-center gap-2 bg-white px-3 py-2 shadow-sm sm:px-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="Orqaga"
        >
          <ArrowLeft className="h-5 w-5 text-[var(--color-secondary)]" />
        </button>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Manzilni qidiring..."
            className="h-10 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-4 text-sm text-[var(--color-secondary)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-brand-green)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-green)]"
          />
        </div>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] hover:bg-gray-100"
          aria-label="Filtrlar"
        >
          <SlidersHorizontal className="h-4.5 w-4.5 text-[var(--color-secondary)]" />
        </button>
      </div>

      {/* Deal tabs */}
      <div className="relative z-20 flex items-center border-b border-[var(--color-border)] bg-white">
        {DEAL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setDeal(tab.id)}
            className={cn(
              'flex-1 py-3 text-center text-sm font-semibold transition-colors',
              deal === tab.id
                ? 'border-b-2 border-[var(--color-brand-green)] text-[var(--color-brand-green)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-secondary)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Full-screen map */}
      <div className="relative flex-1">
        <ListingsTileMap
          listings={filtered}
          center={center}
          radiusKm={coords ? 14 : 20}
          userLocation={coords}
          className="h-full w-full"
        />

        {/* "Menga yaqin" button — bottom right */}
        <button
          type="button"
          onClick={request}
          disabled={status === 'loading'}
          className={cn(
            'absolute bottom-6 right-4 z-30 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition-colors',
            coords
              ? 'bg-[var(--color-brand-green)] text-white'
              : 'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary)]/90'
          )}
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          Menga yaqin
        </button>

        {/* Active filter badge */}
        {deal !== 'all' && (
          <button
            type="button"
            onClick={() => setDeal('all')}
            className="absolute right-4 top-4 z-30 flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
          >
            <X className="h-3 w-3" />
            Tozalash
          </button>
        )}
      </div>
    </div>
  );
}
