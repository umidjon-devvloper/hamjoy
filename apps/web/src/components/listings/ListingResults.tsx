'use client';

import React from 'react';
import Link from 'next/link';
import { DEMO_LISTINGS } from '@/data/listings';
import { filterListings, type ListingSearchParams, type ListingSection } from '@/lib/listings/format';
import { useUserListings } from '@/lib/listings/user-listings';
import { useListingModeration } from '@/lib/listings/moderation';
import { ROUTES } from '@/lib/navigation/routes';
import { ListingCard } from './ListingCard';

/** Listing grid for /uy-joy/[bolim]: demo data plus listings posted from this browser. */
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
  const results = filterListings([...userListings, ...DEMO_LISTINGS].filter((l) => isVisible(l.id)), section, params);
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
      <p className="mb-3 text-sm font-medium text-gray-600">{results.length} ta eʼlon</p>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {results.map((l, i) => (
          <ListingCard key={l.id} listing={l} eager={i < 2} />
        ))}
      </div>
    </>
  );
}
