'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DEMO_LISTINGS } from '@/data/listings';
import { filterListings, type ListingSearchParams, type ListingSection } from '@/lib/listings/format';
import { useUserListings } from '@/lib/listings/user-listings';
import { useListingModeration } from '@/lib/listings/moderation';
import { isRestBackendEnabled } from '@/lib/api/config';
import { apiListingToProperty } from '@/lib/listings/api-mapping';
import { ROUTES } from '@/lib/navigation/routes';
import { ListingCard } from './ListingCard';
import type { PropertyListing } from '@/types/listing';

/** Listing grid for /uy-joy/[bolim]: API data merged with demo listings. */
export function ListingResults({
  section,
  params,
  resetHref,
}: {
  section: ListingSection;
  params: ListingSearchParams;
  resetHref: string;
}) {
  const userListings = useUserListings();
  const { isVisible } = useListingModeration();
  const [apiListings, setApiListings] = useState<PropertyListing[]>([]);

  useEffect(() => {
    if (!isRestBackendEnabled()) return;
    import('@/lib/joymee/client').then(({ getJoymeeClient }) =>
      getJoymeeClient().listings.search({ vertical: 'uy-joy', limit: 50 })
    ).then((res) => {
      setApiListings(res.items.map((item: any) => apiListingToProperty(item)));
    }).catch(() => {});
  }, []);

  const demoIds = new Set(DEMO_LISTINGS.map((d) => d.id));
  const apiIds = new Set(apiListings.map((a) => a.id));
  const allListings = [
    ...apiListings,
    ...userListings.filter((l) => !apiIds.has(l.id)),
    ...DEMO_LISTINGS.filter((d) => !apiIds.has(d.id)),
  ];
  const results = filterListings(allListings.filter((l) => isVisible(l.id)), section, params);
  const hasFilters = Object.keys(params).length > 0;

  if (results.length === 0) {
    return (
      <div className="card px-6 py-12 text-center">
        <p className="font-semibold text-[var(--color-secondary)]">
          {hasFilters ? 'Bu filtr boʻyicha eʼlon topilmadi' : 'Hozircha eʼlon yoʻq'}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {hasFilters && (
            <Link href={resetHref} className="text-sm font-semibold text-[var(--color-brand-green)] hover:underline">
              Filtrlarni tozalash
            </Link>
          )}
          <Link
            href={section === 'olish' ? `${ROUTES.createListing}&bitim=olish` : ROUTES.createListing}
            className="text-sm font-semibold text-[var(--color-brand-green)] hover:underline"
          >
            {section === 'olish' ? 'Soʻrov joylash' : 'Eʼlon joylash'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-[var(--color-muted)]">
        <span className="tabular font-bold text-[var(--color-secondary)]">{results.length}</span> ta eʼlon
      </p>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((l, i) => (
          <ListingCard key={l.id} listing={l} eager={i < 2} />
        ))}
      </div>
    </>
  );
}
