'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

export type Slide = {
  id: number | string;
  title: string;
  subtitle?: string;
  price?: string | number;
  image: string;
  /** Optional gradient classes: "from-… via-… to-…" */
  tone?: string;
  /** Photo fills the whole slide (behind a dark scrim) instead of the tilted card. */
  cover?: boolean;
  /** Tailwind object-position for a cover photo, e.g. "object-right" to keep its subject on narrow screens. */
  coverPosition?: string;
};

const TONES = [
  'from-slate-900 via-teal-900 to-emerald-700',
  'from-cyan-950 via-teal-800 to-slate-800',
  'from-emerald-950 via-teal-800 to-cyan-800',
  'from-slate-800 via-emerald-900 to-teal-700',
];

function fmtPrice(p?: string | number) {
  if (p == null || p === '') return '';
  return Math.round(Number(p)).toLocaleString('ru-RU');
}

const REDUCED = '(prefers-reduced-motion: reduce)';
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(REDUCED);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(REDUCED).matches,
    () => false
  );
}

const arrowClass =
  'absolute top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur transition duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/40 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';

/** "Tavsiya etamiz" hero carousel: autoplay, pause on hover/focus, swipe, a11y. */
export function Carousel({
  slides,
  onSlideClick,
  interval = 3000,
  eyebrow = 'Tavsiya etamiz',
  currency = 'soʻm',
}: {
  slides: Slide[];
  onSlideClick?: (id: Slide['id']) => void;
  interval?: number;
  eyebrow?: string;
  currency?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const touchX = useRef<number | null>(null);
  const n = slides.length;

  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);
  const next = useCallback(() => setIndex((i) => (i + 1) % n), [n]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + n) % n), [n]);

  // Restarts whenever the index changes, so manual navigation resets the timer.
  useEffect(() => {
    if (paused || reduceMotion || n <= 1) return;
    const t = setTimeout(next, interval);
    return () => clearTimeout(t);
  }, [index, paused, reduceMotion, n, interval, next]);

  if (n === 0) return null;
  const current = index % n;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={eyebrow}
      className="fade-up relative mb-8 select-none overflow-hidden rounded-3xl font-[family-name:var(--font-inter),Inter,system-ui,-apple-system,sans-serif] font-medium"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx > 50) prev();
        else if (dx < -50) next();
        touchX.current = null;
      }}
    >
      {/* Track */}
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSlideClick?.(s.id)}
            aria-hidden={i !== current}
            tabIndex={i === current ? 0 : -1}
            className={`relative h-48 w-full shrink-0 bg-gradient-to-r text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white/70 sm:h-64 ${s.cover ? 'bg-slate-900' : s.tone || TONES[i % TONES.length]}`}
          >
            {s.cover && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image}
                  alt={s.title}
                  draggable={false}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className={`absolute inset-0 h-full w-full object-cover ${s.coverPosition ?? 'object-[center_45%]'}`}
                />
                <span className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
              </>
            )}

            <span className="relative z-10 flex h-full max-w-[60%] flex-col justify-center px-6 sm:px-10">
              <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-teal-300 sm:text-sm">
                {eyebrow}
              </span>
              <span
                role="heading"
                aria-level={2}
                className="line-clamp-2 text-2xl font-black leading-tight text-white sm:text-4xl"
              >
                {s.title}
              </span>
              {s.subtitle && (
                <span className="mt-1 text-xs text-teal-100/90 sm:text-sm">{s.subtitle}</span>
              )}
              {s.price != null && s.price !== '' && (
                <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-xl bg-[var(--brand-primary,#0F766E)] px-3 py-1 text-lg font-black text-[var(--brand-on,#FFFFFF)] sm:text-2xl">
                  {fmtPrice(s.price)} <span className="text-xs sm:text-sm">{currency}</span>
                </span>
              )}
            </span>

            {!s.cover && (
              <>
                {/* Image */}
                <span className="absolute right-0 top-0 flex h-full w-1/2 items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.title}
                    draggable={false}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="h-[78%] w-[78%] rotate-3 rounded-2xl object-cover shadow-2xl"
                  />
                </span>
                <span className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
              </>
            )}
          </button>
        ))}
      </div>

      {/* Arrows */}
      {n > 1 && (
        <>
          <button type="button" onClick={prev} aria-label="Oldingi" className={`${arrowClass} left-3`}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden>
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" onClick={next} aria-label="Keyingi" className={`${arrowClass} right-3`}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden>
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {n > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`${i + 1}-slayd`}
              aria-current={i === current ? 'true' : undefined}
              className={`h-1.5 rounded-full transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
