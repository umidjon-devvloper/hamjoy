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
  const visible = [...userListings, ...DEMO_LISTINGS].filter((l) => isVisible(l.id));
  const matches = (f: DealFilter) => (l: (typeof visible)[number]) =>
    f === 'all' ? !l.seeking : f === 'olish' ? Boolean(l.seeking) : !l.seeking && l.deal === f;
  const listings = visible.filter(matches(filter));

  return (
    <section aria-labelledby="home-listings-heading" className="mt-12 sm:mt-14">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2
              id="home-listings-heading"
              className="text-[28px] font-extrabold tracking-[-0.025em] text-[var(--color-secondary)]"
            >
              Yangi eʼlonlar
            </h2>
            <DemoBadge />
          </div>
          <p className="mt-1 text-[var(--color-muted)]">
            Rasmlarni varaqlang, yoqqanini yurakcha bilan saqlab qoʻying.
          </p>
        </div>

        <div
          role="group"
          aria-label="Eʼlon turi"
          className="inline-flex flex-wrap self-start gap-1 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 sm:self-auto"
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'inline-flex h-[38px] items-center gap-1.5 rounded-[10px] px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-green)]/50',
                  active ? 'bg-[var(--color-brand-green)] text-white' : 'text-[#3A3F47] hover:bg-[var(--color-field)]',
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'tabular rounded-full px-[7px] py-px text-xs font-semibold',
                    active ? 'bg-white/20 text-white' : 'bg-[var(--color-field)] text-[var(--color-muted)]',
                  )}
                >
                  {visible.filter(matches(f.id)).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing, i) => (
          <ListingCard key={listing.id} listing={listing} eager={i < 2} />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {(filter === 'all' || filter === 'sotuv') && (
          <Link
            href={ROUTES.uyJoy.sale}
            className="inline-flex min-h-12 items-center gap-2 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-secondary)] transition-colors hover:border-[var(--color-brand-green)]/40 hover:bg-[var(--color-primary-light)] hover:text-[var(--color-brand-green)]"
          >
            Barcha sotuv eʼlonlari <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        {(filter === 'all' || filter === 'ijara') && (
          <Link
            href={ROUTES.uyJoy.rent}
            className="inline-flex min-h-12 items-center gap-2 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-secondary)] transition-colors hover:border-[var(--color-brand-green)]/40 hover:bg-[var(--color-primary-light)] hover:text-[var(--color-brand-green)]"
          >
            Barcha ijara eʼlonlari <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </section>
  );
}
