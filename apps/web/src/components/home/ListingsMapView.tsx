'use client';

import { useEffect, useState } from 'react';
import { LocateFixed, Loader2 } from 'lucide-react';
import { ListingsTileMap } from '@/components/map/ListingsTileMap';
import { DEMO_LISTINGS } from '@/data/listings';
import { useUserListings } from '@/lib/listings/user-listings';
import { isRestBackendEnabled } from '@/lib/api/config';
import { apiListingToProperty } from '@/lib/listings/api-mapping';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useGoogleTiles } from '@/hooks/useGoogleTiles';
import { DEFAULT_MAP_CENTER } from '@/lib/map/config';
import { cn } from '@/lib/utils';
import type { PropertyListing } from '@/types/listing';

export function ListingsMapView() {
  const { coords, status, request } = useGeolocation();
  const googleTileUrl = useGoogleTiles();
  const userListings = useUserListings();
  const [apiListings, setApiListings] = useState<PropertyListing[]>([]);

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

  const center = coords ?? DEFAULT_MAP_CENTER;

  return (
    <div className="relative h-full">
      <ListingsTileMap
        listings={allListings}
        center={center}
        radiusKm={coords ? 14 : 20}
        userLocation={coords}
        tileUrl={googleTileUrl}
        className="absolute inset-0"
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
    </div>
  );
}
