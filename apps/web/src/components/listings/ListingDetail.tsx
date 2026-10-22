import React from 'react';
import Link from 'next/link';
import { BedDouble, Building2, Check, ChevronRight, Layers, MapPin, Maximize2, ShieldCheck, Trees, type LucideIcon } from 'lucide-react';
import type { PropertyListing } from '@/types/listing';
import { cn } from '@/lib/utils';
import { ListingGallery } from './ListingGallery';
import { ListingContact } from './ListingContact';
import { ListingCard } from './ListingCard';
import { DemoBadge } from './DemoBadge';
import {
  getListingIntent,
  formatListingDate,
  formatListingPrice,
  groupDigits,
  PROPERTY_TYPE_LABELS,
} from '@/lib/listings/format';
import { ROUTES } from '@/lib/navigation/routes';

function dealBadgeClass(listing: PropertyListing) {
  if (listing.seeking) return 'border-[1.5px] border-[var(--color-brand-green)] text-[var(--color-brand-green)]';
  if (listing.deal === 'sotuv') return 'bg-[var(--color-brand-green)] text-white';
  if (listing.rentPeriod === 'kun') return 'bg-[var(--color-brand-gold)] text-[var(--color-ink-on-gold)]';
  return 'bg-[#0B0B0C]/80 text-white';
}

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

  const facts: { icon: LucideIcon; label: string; value: string }[] = [
    ...(listing.rooms ? [{ icon: BedDouble, label: 'Xonalar', value: String(listing.rooms) }] : []),
    ...(listing.area ? [{ icon: Maximize2, label: 'Maydon', value: `${listing.area} m²` }] : []),
    ...(listing.floor && listing.totalFloors
      ? [{ icon: Layers, label: 'Qavat', value: `${listing.floor} / ${listing.totalFloors}` }]
      : listing.totalFloors
        ? [{ icon: Layers, label: 'Qavatlar', value: String(listing.totalFloors) }]
        : []),
    ...(listing.landArea ? [{ icon: Trees, label: 'Yer maydoni', value: `${listing.landArea} sotix` }] : []),
    { icon: Building2, label: 'Mulk turi', value: PROPERTY_TYPE_LABELS[listing.type] },
  ];

  const perSquareMeter =
    listing.deal === 'sotuv' && !listing.seeking && listing.area && listing.currency === 'USD'
      ? `≈ $${groupDigits(listing.price / listing.area)} / m²`
      : null;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <nav aria-label="Yoʻl" className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--color-muted)]">
        <Link href={ROUTES.home} className="hover:text-[var(--color-brand-green)]">Bosh sahifa</Link>
        <ChevronRight className="h-4 w-4" aria-hidden />
        <Link href={dealHref} className="hover:text-[var(--color-brand-green)]">
          {intent.badge}
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden />
        <span className="truncate font-medium text-[var(--color-secondary)]" aria-current="page">{listing.title}</span>
      </nav>

      <header className="mb-5 mt-4 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn('flex h-[26px] items-center rounded-lg px-2.5 text-xs font-bold', dealBadgeClass(listing))}>
            {intent.badge}
          </span>
          {listing.isTop && (
            <span className="flex h-[26px] items-center rounded-lg bg-[var(--color-brand-gold-soft)] px-2.5 text-xs font-bold tracking-wide text-[#3D2E07]">
              TOP
            </span>
          )}
          {isDemo && <DemoBadge />}
        </div>
        <h1 className="text-[clamp(1.75rem,3.4vw,2.5rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[var(--color-secondary)]">
          {listing.title}
        </h1>
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[var(--color-muted)]">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          {listing.district}, {listing.region} ·{' '}
          <time dateTime={listing.postedAt}>{formatListingDate(listing.postedAt)}</time>
          <MapsLink district={listing.district} region={listing.region} />
        </p>
      </header>

      <ListingGallery images={listing.images} title={listing.title} />

      <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {facts.slice(0, 4).map(({ icon: Icon, label, value }) => (
              <li key={label} className="card flex flex-col gap-2 rounded-[18px] p-4">
                <Icon className="h-[22px] w-[22px] text-[var(--color-brand-green)]" strokeWidth={1.8} aria-hidden />
                <span className="text-[13px] text-[var(--color-muted)]">{label}</span>
                <span className="text-xl font-extrabold text-[var(--color-secondary)]">{value}</span>
              </li>
            ))}
          </ul>

          <section className="card rounded-[22px] p-6 sm:p-[26px]">
            <h2 className="mb-2.5 text-xl font-bold tracking-[-0.02em] text-[var(--color-secondary)]">Tavsif</h2>
            <p className="max-w-[68ch] text-base leading-[1.65] text-[#23262B]">{listing.description}</p>
            {listing.features.length > 0 && (
              <>
                <h3 className="mb-3 mt-6 text-[15px] font-bold text-[var(--color-secondary)]">Qulayliklar</h3>
                <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {listing.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <span className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-[var(--color-brand-green)]">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        <aside className="space-y-3.5 lg:sticky lg:top-36 lg:self-start">
          <div className="card rounded-3xl p-6 shadow-[0_24px_48px_-36px_rgb(18_63_38/0.45)]">
            <span className="text-[13px] font-semibold text-[var(--color-muted)]">
              {listing.seeking ? 'Byudjet' : 'Narxi'}
            </span>
            <p className="tabular text-[38px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[var(--color-secondary)]">
              {formatListingPrice(listing)}
            </p>
            {perSquareMeter && <p className="tabular text-sm text-[var(--color-muted)]">{perSquareMeter}</p>}
            <div className="mt-5">
              <ListingContact listingId={listing.id} title={listing.title} seller={listing.seller} />
            </div>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-[#EEEFEA] pt-4 text-sm">
              <dt className="text-[var(--color-muted)]">Eʼlon turi</dt>
              <dd className="text-right font-semibold">{intent.label}</dd>
              <dt className="text-[var(--color-muted)]">Joylandi</dt>
              <dd className="text-right font-semibold">{formatListingDate(listing.postedAt)}</dd>
              <dt className="text-[var(--color-muted)]">Hudud</dt>
              <dd className="text-right font-semibold">{listing.district}</dd>
            </dl>
            {isDemo && (
              <p className="mt-4 text-xs text-[var(--color-muted)]">Bu namuna eʼlon: telefon raqami hech kimga ulanmaydi.</p>
            )}
            {ownerActions}
          </div>
          <p className="flex gap-3 rounded-[18px] bg-[var(--color-accent-light)] p-4 text-sm text-[#3D2E07]">
            <ShieldCheck className="mt-px h-5 w-5 shrink-0" aria-hidden />
            Uyni koʻrmasdan va hujjatlarni tekshirmasdan oldindan pul oʻtkazmang.
          </p>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-12" aria-labelledby="similar-heading">
          <h2 id="similar-heading" className="mb-4 text-[26px] font-extrabold tracking-[-0.025em] text-[var(--color-secondary)]">
            Oʻxshash eʼlonlar
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

/**
 * Opens the listing's location in Yandex Maps. Falls back to the browser web
 * version if the native app isn't installed (web just follows the https URL).
 * Deep-linking a specific pin without lat/lng isn't possible, so we send a
 * text query — "Yunusobod, Toshkent shahri" — which lands on the right area.
 */
function MapsLink({ district, region }: { district: string; region: string }) {
  const q = encodeURIComponent(`${district}, ${region}`);
  const url = `https://yandex.uz/maps/?text=${q}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-brand-green)] transition-colors hover:border-[var(--color-brand-green)]/40"
    >
      <MapPin className="h-3 w-3" />
      Yandex xaritada
    </a>
  );
}
