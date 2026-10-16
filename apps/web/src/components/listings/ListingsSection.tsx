'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ListingDeal } from '@/types/listing';
import { DEMO_LISTINGS } from '@/data/listings';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';
import { ListingCard } from './ListingCard';
import { DemoBadge } from './DemoBadge';
import { useUserListings } from '@/lib/listings/user-listings';
import { useListingModeration } from '@/lib/listings/moderation';

type DealFilter = 'all' | ListingDeal | 'olish';

const FILTERS: { id: DealFilter; label: string }[] = [
  { id: 'all', label: 'Barchasi' },
  { id: 'sotuv', label: 'Sotuv' },
  { id: 'ijara', label: 'Ijara' },
  { id: 'olish', label: 'Soʻrovlar' },
];

/** Home page: latest Uy-joy listings under the section cards. */
export function ListingsSection() {
  const [filter, setFilter] = useState<DealFilter>('all');
  const userListings = useUserListings();
  const { isVisible } = useListingModeration();
  // Listings posted from this browser come first, then the demo ones.
  const listings = [...userListings, ...DEMO_LISTINGS].filter((l) =>
    !isVisible(l.id)
      ? false
      : filter === 'all'
        ? true
        : filter === 'olish'
          ? l.seeking
          : !l.seeking && l.deal === filter,
  );

  return (
    <section aria-labelledby="home-listings-heading" className="mt-10 sm:mt-14">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2
              id="home-listings-heading"
              className="text-2xl font-bold tracking-tight text-[var(--color-secondary)]"
            >
              Yangi uy-joy eʼlonlari
            </h2>
            <DemoBadge />
          </div>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Sotuv va ijara eʼlonlari — rasmlarni varaqlang, yoqqanini saqlab qoʻying.
          </p>
        </div>

        <div
          role="group"
          aria-label="Eʼlon turi"
          className="inline-flex self-start rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 sm:self-auto"
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'min-h-9 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-gold)]/70',
                filter === f.id
                  ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-secondary)]',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing, i) => (
          <ListingCard key={listing.id} listing={listing} eager={i < 2} />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {(filter === 'all' || filter === 'sotuv') && (
          <Link
            href={ROUTES.uyJoy.sale}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-secondary)] transition-colors hover:border-[var(--color-brand-green)]/40 hover:text-[var(--color-brand-green)]"
          >
            Barcha sotuv eʼlonlari <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        {(filter === 'all' || filter === 'ijara') && (
          <Link
            href={ROUTES.uyJoy.rent}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-secondary)] transition-colors hover:border-[var(--color-brand-green)]/40 hover:text-[var(--color-brand-green)]"
          >
            Barcha ijara eʼlonlari <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </section>
  );
}
