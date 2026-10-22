'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Compass } from 'lucide-react';
import { getJoymeeClient } from '@/lib/joymee/client';
import { formatPostedAt } from '@/lib/mappers/job.mapper';
import { NearbyFilter, type NearbyState } from '@/components/platform/NearbyFilter';
import { cn } from '@/lib/utils';

type Vertical = 'uy-joy' | 'ish' | 'avto' | 'bepul';

const TABS: { id: Vertical; label: string }[] = [
  { id: 'uy-joy', label: 'Uy-joy' },
  { id: 'ish', label: 'Ish' },
  { id: 'avto', label: 'Avto' },
  { id: 'bepul', label: 'Bepul' },
];

interface RawListing {
  id: string;
  title: string;
  description: string;
  type: string;
  vertical: string;
  priceAmount?: number | string | null;
  priceCurrency?: string | null;
  createdAt: string;
}

/**
 * "Yaqinimdagi" — one page that queries the real backend by lat/lng/radius
 * across every vertical, so uy-joy and ish listings also benefit from the
 * PostGIS radius search (the per-vertical home pages still use demo data).
 */
export default function NearbyPage() {
  const [vertical, setVertical] = useState<Vertical>('uy-joy');
  const [near, setNear] = useState<NearbyState | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['nearby', vertical, near?.lat, near?.lng, near?.radiusKm],
    enabled: !!near,
    queryFn: async () => {
      const client = getJoymeeClient();
      const res = await client.listings.search({
        vertical,
        limit: 30,
        lat: near!.lat,
        lng: near!.lng,
        radiusKm: near!.radiusKm,
      } as never);
      return res.items as unknown as RawListing[];
    },
  });

  const items = data ?? [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-2">
        <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--color-brand-green)]">
          <Compass className="h-3.5 w-3.5" />
          Yaqinimdagi
        </span>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-[var(--color-secondary)]">
          Atrofimdagi eʼlonlar
        </h1>
        <p className="max-w-[560px] text-[15px] text-[var(--color-muted)]">
          Joylashuvingizni ulashing — tanlagan radiusda uy-joy, ish, avto va bepul
          eʼlonlar bir ro'yxatda chiqadi.
        </p>
      </header>

      <div className="mb-4">
        <NearbyFilter value={near} onChange={setNear} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setVertical(t.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              vertical === t.id
                ? 'bg-[var(--color-brand-green)] text-white'
                : 'bg-[var(--color-background)] text-[var(--color-muted)] hover:text-[var(--color-secondary)]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!near ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <p className="text-[15px] font-semibold text-[var(--color-secondary)]">
            Yaqinimdagi filtrni yoqing
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Brauzer joylashuvni so'ragach, radiusni tanlang.
          </p>
        </div>
      ) : isLoading ? (
        <p className="text-[var(--color-muted)]">Yuklanmoqda…</p>
      ) : error ? (
        <p className="text-[color:var(--color-danger,#c73a7f)]">
          Yuklab bo'lmadi: {(error as Error).message}
        </p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <p className="text-[15px] font-semibold text-[var(--color-secondary)]">
            {near.radiusKm} km radiusda bu bo'limda eʼlon yo'q
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Radiusni kattalashtirib ko'ring yoki boshqa vertikalni tanlang.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-[var(--color-muted)]">
            <span className="font-bold tabular-nums text-[var(--color-secondary)]">{items.length}</span>{' '}
            ta eʼlon · {near.radiusKm} km radius
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((l) => (
              <li key={l.id}>
                <Link
                  href={l.vertical === 'ish' ? `/job/${l.id}` : `/listing/${l.id}`}
                  className="card card-hover block rounded-2xl p-4"
                >
                  <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    <span className="text-[var(--color-brand-green)]">{l.vertical}</span>
                    <span>{formatPostedAt(l.createdAt)}</span>
                  </div>
                  <h3 className="line-clamp-2 text-[16px] font-semibold tracking-[-0.01em] text-[var(--color-secondary)]">
                    {l.title}
                  </h3>
                  {l.priceAmount != null ? (
                    <p className="mt-2 text-lg font-bold text-[var(--color-secondary)]">
                      {Number(l.priceAmount).toLocaleString('uz-UZ')}{' '}
                      <span className="text-sm font-medium text-[var(--color-muted)]">
                        {l.priceCurrency ?? 'UZS'}
                      </span>
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
