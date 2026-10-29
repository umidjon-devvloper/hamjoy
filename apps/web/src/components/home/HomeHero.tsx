'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/navigation/routes';
import { DEMO_LISTINGS } from '@/data/listings';
import { formatListingPrice } from '@/lib/listings/format';
import type { PropertyListing } from '@/types/listing';

const POPULAR_DISTRICTS = ['Yunusobod', 'Chilonzor', 'Mirzo Ulugʻbek', 'Qibray'];

/**
 * Carousel-first home hero.
 * Compact search bar sits under the navbar, then a full-width featured
 * listings carousel takes the stage — no big headline, no 2-column split.
 */
export function HomeHero() {
  const featured = useMemo<PropertyListing[]>(
    () =>
      DEMO_LISTINGS.filter((l) => !l.seeking && l.images.length > 0)
        .slice(0, 6),
    []
  );

  const [slide, setSlide] = useState(0);
  const slideCount = featured.length;
  const prev = () => setSlide((s) => (s - 1 + slideCount) % slideCount);
  const next = () => setSlide((s) => (s + 1) % slideCount);

  return (
    <section className="flex flex-col gap-6">
      {/* Full-width featured carousel. One slide at a time. */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#DADBD5]">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          {featured.map((f) => (
            <Link
              key={f.id}
              href={ROUTES.listing(f.id)}
              className="group relative block aspect-[16/9] w-full shrink-0 overflow-hidden sm:aspect-[21/9]"
            >
              {f.images[0] ? (
                <Image
                  src={f.images[0]}
                  alt={f.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              ) : null}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 sm:inset-x-6 sm:bottom-6">
                <div className="min-w-0 text-white">
                  <div className="text-[11px] font-bold tracking-[0.18em] text-white/80">
                    TAVSIYA ETAMIZ
                  </div>
                  <div className="mt-1 line-clamp-1 text-xl font-extrabold tracking-[-0.01em] sm:text-2xl">
                    {f.title}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white/90">
                    {formatListingPrice(f)}
                    {f.area ? <span className="font-normal opacity-80"> · {f.area} m²</span> : null}
                  </div>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-green)] text-white shadow-lg">
                  <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Carousel controls */}
        {slideCount > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Oldingi"
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--color-secondary)] shadow-lg transition-colors hover:bg-white sm:flex"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Keyingi"
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--color-secondary)] shadow-lg transition-colors hover:bg-white sm:flex"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </button>
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 sm:bottom-3">
              {featured.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlide(i)}
                  aria-label={`Slayd ${i + 1}`}
                  className={cn(
                    'h-1.5 rounded-full bg-white/60 transition-all',
                    i === slide ? 'w-6 bg-white' : 'w-1.5 hover:bg-white/80'
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {/* Quick district links — kept as a light chip row below the carousel. */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-muted)]">
        <span>Koʻp qidiriladi:</span>
        {POPULAR_DISTRICTS.map((d) => (
          <Link
            key={d}
            href={`${ROUTES.uyJoy.sale}?hudud=${encodeURIComponent(d.toLowerCase())}`}
            className="rounded-full border border-[#DADBD5] px-3 py-1.5 font-medium text-[var(--color-secondary)] transition-colors hover:border-[var(--color-brand-green)]/40 hover:text-[var(--color-brand-green)]"
          >
            {d}
          </Link>
        ))}
      </div>
    </section>
  );
}
