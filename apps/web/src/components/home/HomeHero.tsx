'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/navigation/routes';
import { DEMO_LISTINGS } from '@/data/listings';
import { formatListingPrice } from '@/lib/listings/format';

type SearchMode = 'sotib' | 'ijara' | 'kunlik';

const MODES: { id: SearchMode; label: string }[] = [
  { id: 'sotib', label: 'Sotib olish' },
  { id: 'ijara', label: 'Ijaraga olish' },
  { id: 'kunlik', label: 'Kunlik' },
];

const ROOMS = ['1', '2', '3', '4', '5+'];

const POPULAR_DISTRICTS = ['Yunusobod', 'Chilonzor', 'Mirzo Ulugʻbek', 'Qibray'];

const fieldClass =
  'flex flex-col gap-1 rounded-2xl bg-[var(--color-background)] px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[var(--color-brand-green)]/30';
const fieldLabelClass = 'text-xs font-semibold text-[var(--color-muted)]';
const fieldInputClass =
  'w-full min-w-0 border-0 bg-transparent p-0 text-[15px] font-semibold text-[var(--color-secondary)] outline-none';

/** Home hero: search-first, with one featured TOP listing on the photo. */
export function HomeHero() {
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>('sotib');
  const [type, setType] = useState('kvartira');
  const [room, setRoom] = useState('3');
  const [maxPrice, setMaxPrice] = useState('');

  const featured = useMemo(
    () => DEMO_LISTINGS.find((l) => l.isTop && !l.seeking && l.images.length > 0) ?? DEMO_LISTINGS[0],
    []
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const base = mode === 'sotib' ? ROUTES.uyJoy.sale : ROUTES.uyJoy.rent;
    const params = new URLSearchParams();
    if (mode === 'kunlik') params.set('muddat', 'kunlik');
    if (type) params.set('tur', type);
    if (room) params.set('xona', room);
    if (maxPrice.trim()) params.set('narx', `0-${maxPrice.replace(/\D/g, '')}`);
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base);
  };

  return (
    <section className="grid items-stretch gap-8 lg:grid-cols-2">
      <div className="flex flex-col justify-center gap-6 py-2">
        <span className="inline-flex h-8 items-center gap-2 self-start rounded-full bg-[var(--color-primary-light)] px-3.5 text-[13px] font-semibold text-[var(--color-brand-green)]">
          <span className="h-[7px] w-[7px] rounded-full bg-[var(--color-brand-green)]" aria-hidden />
          Sotuv · Ijara · Kunlik ijara
        </span>
        <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-[var(--color-secondary)]">
          Oʻzingizga mos uyni
          <br />
          <span className="text-[var(--color-brand-green)]">bir qidiruvda</span> toping
        </h1>
        <p className="max-w-[480px] text-lg text-[var(--color-muted)]">
          Kvartira, hovli, ofis yoki bir kecha uchun studiya — egasi bilan bevosita bogʻlaning.
        </p>

        <form
          onSubmit={submit}
          className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[0_24px_48px_-32px_rgb(18_63_38/0.35)]"
        >
          <div role="tablist" aria-label="Qidiruv turi" className="flex gap-1 p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={mode === m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  'h-10 rounded-xl px-4 text-sm font-semibold transition-colors',
                  mode === m.id
                    ? 'bg-[var(--color-secondary)] text-white'
                    : 'text-[#3A3F47] hover:bg-[var(--color-field)]'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="grid gap-2 p-2 sm:grid-cols-3">
            <label className={fieldClass}>
              <span className={fieldLabelClass}>Hudud</span>
              <select className={fieldInputClass} defaultValue="toshkent">
                <option value="toshkent">Toshkent shahri</option>
                <option value="toshkent-vil">Toshkent viloyati</option>
                <option value="samarqand">Samarqand</option>
              </select>
            </label>
            <label className={fieldClass}>
              <span className={fieldLabelClass}>Mulk turi</span>
              <select className={fieldInputClass} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="kvartira">Kvartira</option>
                <option value="uy">Hovli / dacha</option>
                <option value="tijorat">Tijorat</option>
              </select>
            </label>
            <label className={fieldClass}>
              <span className={fieldLabelClass}>Narx, gacha</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="$ 100 000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={fieldInputClass}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2 px-2 pb-2 pt-1">
            <span className="mr-1 text-[13px] font-semibold text-[var(--color-muted)]">Xonalar</span>
            {ROOMS.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={room === r}
                onClick={() => setRoom(room === r ? '' : r)}
                className={cn(
                  'h-11 min-w-11 rounded-xl px-3 text-sm font-semibold transition-colors',
                  room === r
                    ? 'border-[1.5px] border-[var(--color-brand-green)] bg-[var(--color-primary-light)] text-[var(--color-brand-green)]'
                    : 'border border-[#DADBD5] bg-white text-[var(--color-secondary)] hover:border-[var(--color-brand-green)]/40'
                )}
              >
                {r}
              </button>
            ))}
            <button
              type="submit"
              className="ml-auto inline-flex h-[50px] items-center gap-2 rounded-2xl bg-[var(--color-brand-green)] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[var(--color-brand-green-deep)]"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={2.4} />
              Qidirish
            </button>
          </div>
        </form>

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
      </div>

      <Link
        href={ROUTES.listing(featured.id)}
        className="group relative block min-h-[420px] overflow-hidden rounded-[28px] bg-[#DADBD5] lg:min-h-[560px]"
      >
        <Image
          src="/carousel/uy-joy-hovli.webp"
          alt="Zamonaviy hovli, kechki manzara"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <span className="absolute inset-x-4 bottom-4 flex items-center gap-3.5 rounded-[20px] bg-white/95 p-3 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.45)] sm:inset-x-[18px] sm:bottom-[18px]">
          {featured.images[0] && (
            <span className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[14px]">
              <Image src={featured.images[0]} alt="" fill sizes="76px" className="object-cover" />
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[11px] font-bold tracking-[0.14em] text-[#7A5A12]">TAVSIYA ETAMIZ</span>
            <span className="truncate text-[15px] font-semibold text-[var(--color-secondary)]">{featured.title}</span>
            <span className="tabular text-xl font-extrabold tracking-[-0.02em] text-[var(--color-secondary)]">
              {formatListingPrice(featured)}
              {featured.area ? (
                <span className="text-[13px] font-medium text-[var(--color-muted)]"> · {featured.area} m²</span>
              ) : null}
            </span>
          </span>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[var(--color-brand-green)] text-white">
            <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </span>
        </span>
      </Link>
    </section>
  );
}
