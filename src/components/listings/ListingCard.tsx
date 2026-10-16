'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BedDouble, Building2, Camera, ChevronLeft, ChevronRight, Layers, MapPin, Maximize2, SearchCheck } from 'lucide-react';
import type { PropertyListing } from '@/types/listing';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/navigation/routes';
import { formatListingDate, formatListingPrice, getListingIntent, PROPERTY_TYPE_LABELS } from '@/lib/listings/format';
import { SaveListingButton } from './SaveListingButton';

const arrowButton =
  'absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md backdrop-blur transition-opacity hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-gold)]/70 disabled:pointer-events-none disabled:opacity-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100';

export function ListingCard({
  listing,
  eager = false,
}: {
  listing: PropertyListing;
  /** Load the cover eagerly (first row above the fold). */
  eager?: boolean;
}) {
  const href = ROUTES.listing(listing.id);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = listing.images.length;
  const intent = getListingIntent(listing);

  // Photos swipe natively (scroll-snap); arrows and dots drive the same scroller.
  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <article className="card card-hover group relative flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden
          className="relative z-[1] block h-full"
        >
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {count === 0 && (
              // Buyer requests often have no photos — show what they are looking for instead.
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[var(--color-primary-light)] to-white text-[var(--color-primary)]">
                {listing.seeking ? <SearchCheck className="h-10 w-10" /> : <Building2 className="h-10 w-10" />}
                <span className="text-sm font-semibold">{PROPERTY_TYPE_LABELS[listing.type]}</span>
              </div>
            )}
            {listing.images.map((src, i) => (
              <div key={src} className="relative h-full w-full shrink-0 snap-center">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 280px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  loading={eager && i === 0 ? 'eager' : 'lazy'}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex gap-1.5">
          <span
            className={cn(
              'rounded-lg px-2 py-1 text-xs font-bold text-white shadow-sm',
              intent.seeking
                ? 'bg-[var(--color-accent)]'
                : listing.deal === 'sotuv'
                  ? 'bg-[var(--color-brand-green)]'
                  : 'bg-[var(--color-primary)]'
            )}
          >
            {intent.badge}
          </span>
          {listing.isTop && (
            <span className="rounded-lg bg-[var(--color-brand-gold)] px-2 py-1 text-xs font-bold text-gray-900 shadow-sm">
              TOP
            </span>
          )}
        </div>

        <SaveListingButton listingId={listing.id} className="absolute right-3 top-3 z-10" />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label="Oldingi rasm"
              className={cn(arrowButton, 'left-2')}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={index >= count - 1}
              aria-label="Keyingi rasm"
              className={cn(arrowButton, 'right-2')}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-2.5 z-10 flex justify-center gap-1.5" aria-hidden>
              {listing.images.map((src, i) => (
                <span
                  key={src}
                  className={cn(
                    'h-1.5 rounded-full bg-white shadow transition-all',
                    i === index ? 'w-4' : 'w-1.5 opacity-60'
                  )}
                />
              ))}
            </div>
            <span className="pointer-events-none absolute bottom-2 right-2.5 z-10 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white">
              <Camera className="h-3 w-3" />
              {index + 1}/{count}
            </span>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-lg font-extrabold tracking-tight text-[var(--color-secondary)]">
          {formatListingPrice(listing)}
        </p>
        <h3 className="mt-0.5 line-clamp-1 text-[15px] font-semibold text-[var(--color-secondary)]">
          {/* Stretched link: the whole text area opens the listing. */}
          <Link
            href={href}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-3xl focus-visible:after:ring-2 focus-visible:after:ring-[var(--color-brand-gold)]/70"
          >
            {listing.title}
          </Link>
        </h3>

        <ul className="mb-3.5 mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--color-muted)]">
          {listing.rooms ? (
            <li className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" /> {listing.rooms} xona
            </li>
          ) : null}
          {listing.area ? (
            <li className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" /> {listing.area} m²
            </li>
          ) : null}
          {listing.floor && listing.totalFloors ? (
            <li className="flex items-center gap-1">
              <Layers className="h-4 w-4" /> {listing.floor}/{listing.totalFloors} qavat
            </li>
          ) : listing.landArea ? (
            <li className="flex items-center gap-1">
              <Layers className="h-4 w-4" /> {listing.landArea} sotix
            </li>
          ) : null}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-muted)]">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{listing.district}</span>
          </span>
          <time dateTime={listing.postedAt} className="shrink-0">
            {formatListingDate(listing.postedAt)}
          </time>
        </div>
      </div>
    </article>
  );
}
