'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getJoymeeClient } from '@/lib/joymee/client';
import { formatPostedAt } from '@/lib/mappers/job.mapper';

interface Props {
  vertical: 'avto' | 'bepul' | 'ish' | 'uy-joy';
  title: string;
  subtitle: string;
  emptyHint: string;
  accent?: string;
}

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
 * A thin per-vertical feed used by /avto and /bepul so the two new verticals
 * have real pages instead of 404s while their full UIs catch up with uy-joy
 * and ish.
 */
export function VerticalFeed({ vertical, title, subtitle, emptyHint, accent }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['listings', 'vertical', vertical],
    queryFn: async () => {
      const client = getJoymeeClient();
      const res = await client.listings.search({ vertical, limit: 30 } as never);
      return res.items as unknown as RawListing[];
    },
  });

  const items = data ?? [];
  const headingColor = accent ?? 'var(--color-brand-green)';

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-1">
        <span
          className="text-[12px] font-bold uppercase tracking-[0.18em]"
          style={{ color: headingColor }}
        >
          {vertical.toUpperCase()}
        </span>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-[var(--color-secondary)]">
          {title}
        </h1>
        <p className="max-w-[520px] text-[15px] text-[var(--color-muted)]">{subtitle}</p>
      </header>

      {isLoading ? (
        <p className="text-[var(--color-muted)]">Yuklanmoqda…</p>
      ) : error ? (
        <p className="text-[color:var(--color-danger,#c73a7f)]">
          Yuklab boʻlmadi: {(error as Error).message}
        </p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <p className="text-[15px] font-semibold text-[var(--color-secondary)]">Hali e&apos;lon yoʻq</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{emptyHint}</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => (
            <li key={l.id}>
              <Link
                href={`/listing/${l.id}`}
                className="card card-hover block rounded-2xl p-4"
              >
                <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                  <span style={{ color: headingColor }}>{l.type}</span>
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
      )}
    </main>
  );
}
