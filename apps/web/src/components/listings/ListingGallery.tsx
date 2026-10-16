'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const arrow =
  'absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-gold)]/70';

/** Listing detail gallery: main photo with arrows (and ←/→ keys) plus a thumbnail strip. */
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
      <div className="flex aspect-[16/7] flex-col items-center justify-center gap-2 rounded-3xl bg-gray-100 text-[var(--color-muted)]">
        <ImageOff className="h-10 w-10" />
        <span className="text-sm font-medium">Rasm qoʻshilmagan</span>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gray-100 sm:aspect-[16/10]">
        <Image
          key={images[index]}
          src={images[index]}
          alt={`${title} — ${index + 1}-rasm`}
          fill
          loading="eager"
          sizes="(min-width: 1024px) 720px, 100vw"
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

      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}-rasmni koʻrish`}
              aria-current={i === index ? 'true' : undefined}
              className={cn(
                'relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-gold)]/70 sm:h-20 sm:w-28',
                i === index ? 'border-[var(--color-brand-green)]' : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <Image src={src} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
