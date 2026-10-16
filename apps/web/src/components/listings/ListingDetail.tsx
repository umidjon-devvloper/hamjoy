import React from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, MapPin } from 'lucide-react';
import type { PropertyListing } from '@/types/listing';
import { ListingGallery } from './ListingGallery';
import { ListingContact } from './ListingContact';
import { ListingCard } from './ListingCard';
import { DemoBadge } from './DemoBadge';
import {
  getListingIntent,
  formatListingDate,
  formatListingPrice,
  PROPERTY_TYPE_LABELS,
} from '@/lib/listings/format';
import { ROUTES } from '@/lib/navigation/routes';

/** Listing page body — shared by demo listings (server) and listings posted in this browser (client). */
export function ListingDetail({
  listing,
  similar,
  isDemo,
  ownerActions,
}: {
  listing: PropertyListing;
  similar: PropertyListing[];
  isDemo: boolean;
  /** Extra controls under the contact block (e.g. delete for the owner). */
  ownerActions?: React.ReactNode;
}) {
  const intent = getListingIntent(listing);
  const dealHref = listing.seeking
    ? ROUTES.uyJoy.buy
    : listing.deal === 'sotuv'
      ? ROUTES.uyJoy.sale
      : ROUTES.uyJoy.rent;

  const details: [string, string][] = [
    ['Eʼlon turi', intent.label],
    ['Mulk turi', PROPERTY_TYPE_LABELS[listing.type]],
    ...(listing.rooms ? [['Xonalar', `${listing.rooms}`] as [string, string]] : []),
    ...(listing.area ? [['Maydon', `${listing.area} m²`] as [string, string]] : []),
    ...(listing.landArea ? [['Yer maydoni', `${listing.landArea} sotix`] as [string, string]] : []),
    ...(listing.floor && listing.totalFloors
      ? [['Qavat', `${listing.floor} / ${listing.totalFloors}`] as [string, string]]
      : listing.totalFloors
        ? [['Qavatlar', `${listing.totalFloors}`] as [string, string]]
        : []),
    ['Hudud', `${listing.district}, ${listing.region}`],
  ];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <nav aria-label="Yoʻl" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-[var(--color-muted)]">
        <Link href={ROUTES.home} className="hover:text-[var(--color-brand-green)]">Bosh sahifa</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={dealHref} className="hover:text-[var(--color-brand-green)]">
          Uy-joy · {intent.badge}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="truncate text-[var(--color-secondary)]" aria-current="page">{listing.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <ListingGallery images={listing.images} title={listing.title} />

          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-[var(--color-secondary)]">Maʼlumotlar</h2>
            <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {details.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-[var(--color-border)] pb-2 text-sm">
                  <dt className="text-[var(--color-muted)]">{label}</dt>
                  <dd className="text-right font-semibold text-[var(--color-secondary)]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="mb-3 text-lg font-bold text-[var(--color-secondary)]">Tavsif</h2>
            <p className="leading-relaxed text-[var(--color-secondary)]/85">{listing.description}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {listing.features.map((f) => (
                <li key={f} className="rounded-full bg-[var(--color-brand-green)]/10 px-3 py-1 text-sm font-medium text-[var(--color-brand-green)]">
                  {f}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5 sm:p-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-lg bg-[var(--color-brand-green)] px-2 py-0.5 text-xs font-bold text-white">
                {intent.badge}
              </span>
              {isDemo && <DemoBadge />}
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-[var(--color-secondary)]">
              {formatListingPrice(listing)}
            </p>
            <h1 className="mt-2 text-lg font-semibold text-[var(--color-secondary)]">{listing.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
              <MapPin className="h-4 w-4 shrink-0" /> {listing.district}, {listing.region}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
              <Calendar className="h-4 w-4 shrink-0" />
              <time dateTime={listing.postedAt}>{formatListingDate(listing.postedAt)}</time>
            </p>
            <hr className="my-5 border-[var(--color-border)]" />
            <ListingContact listingId={listing.id} title={listing.title} seller={listing.seller} />
            {isDemo && (
              <p className="mt-4 text-xs text-[var(--color-muted)]">
                Bu namuna eʼlon: telefon raqami hech kimga ulanmaydi.
              </p>
            )}
            {ownerActions}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-10" aria-labelledby="similar-heading">
          <h2 id="similar-heading" className="mb-4 text-xl font-bold text-[var(--color-secondary)]">
            Oʻxshash eʼlonlar
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
