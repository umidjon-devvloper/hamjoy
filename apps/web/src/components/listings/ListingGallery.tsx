'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImageOff, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

const arrow =
  'absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-green)]/50';

/**
 * Listing detail gallery. Desktop: a mosaic — the current photo large, the next two on the right
 * (click to bring forward). Phones: one photo with arrows. ←/→ keys step through photos.
 */
export function ListingGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  const go = useCallback((step: number) => setIndex((i) => (i + step + count) % count), [count]);

  useEffect(() => {
    if (count < 2) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [count, go]);

  if (count === 0) {
    return (
      <div className="flex aspect-[16/7] flex-col items-center justify-center gap-2 rounded-[26px] bg-[var(--color-field)] text-[var(--color-muted)]">
        <ImageOff className="h-10 w-10" />
        <span className="text-sm font-medium">Rasm qoʻshilmagan</span>
      </div>
    );
  }

  const side = [1, 2].map((k) => (index + k) % count).filter((i, k, arr) => i !== index && arr.indexOf(i) === k);

  return (
    <div className={cn('grid gap-2.5', side.length > 0 && 'lg:grid-cols-[2fr_1fr]')}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[26px] bg-[var(--color-field)] sm:aspect-[16/10] lg:aspect-auto lg:h-[490px]">
        <Image
          key={images[index]}
          src={images[index]}
          alt={`${title} — ${index + 1}-rasm`}
          fill
          loading="eager"
          sizes="(min-width: 1024px) 860px, 100vw"
          className="object-cover"
        />
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Oldingi rasm" className={cn(arrow, 'left-3')}>
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Keyingi rasm" className={cn(arrow, 'right-3')}>
              <ChevronRight className="h-6 w-6" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-semibold text-white">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {side.length > 0 && (
        <div className="hidden grid-rows-2 gap-2.5 lg:grid">
          {side.map((i, k) => (
            <button
              key={images[i]}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}-rasmni koʻrish`}
              className={cn(
                'relative overflow-hidden rounded-[26px] bg-[var(--color-field)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-green)]/50',
                side.length === 1 && 'row-span-2'
              )}
            >
              <Image src={images[i]} alt="" fill sizes="430px" className="object-cover transition-transform duration-500 hover:scale-[1.03]" />
              {k === side.length - 1 && (
                <span className="absolute bottom-3.5 right-3.5 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[var(--color-secondary)] shadow-[0_8px_20px_-8px_rgb(0_0_0/0.4)]">
                  <LayoutGrid className="h-4 w-4" aria-hidden />
                  Barcha rasmlar · {count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
