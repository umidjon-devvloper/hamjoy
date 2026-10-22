'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Archive, Clock } from 'lucide-react';
import { joymeeReviews, type UserHistoryRow } from '@/lib/joymee/reviews';
import { isRestBackendEnabled } from '@/lib/api/config';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'active' | 'sold' | 'archived';

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  active:   { label: 'Faol',    cls: 'bg-[var(--color-primary-light)] text-[var(--color-brand-green)]' },
  sold:     { label: 'Sotildi', cls: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]' },
  archived: { label: 'Arxiv',   cls: 'bg-[#EEEFEA] text-[var(--color-muted)]' },
  draft:    { label: 'Qoralama', cls: 'bg-[#EEEFEA] text-[var(--color-muted)]' },
};

const VERTICAL_LABEL: Record<string, string> = {
  'uy-joy': 'Uy-joy',
  ish: 'Ish',
  avto: 'Avto',
  bepul: 'Bepul',
};

function Count({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[var(--color-background)] px-3 py-2">
      <Icon className="h-4 w-4 text-[var(--color-brand-green)]" />
      <span className="text-xs text-[var(--color-muted)]">{label}</span>
      <span className="text-sm font-bold tabular-nums text-[var(--color-secondary)]">{value}</span>
    </div>
  );
}

/**
 * Foydalanuvchi e'lonlar tarixi — faol / sotildi / arxiv tabi bilan. Omma
 * uchun yopiq emas: har qanday mehmon ko'ra oladi (/users/:id/history
 * endpointi public).
 */
export function UserHistoryPanel({ userId }: { userId: string }) {
  const [rows, setRows] = useState<UserHistoryRow[]>([]);
  const [tab, setTab] = useState<Tab>('all');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isRestBackendEnabled() || !userId) return;
    void joymeeReviews.history(userId).then((r) => {
      setRows(r);
      setLoaded(true);
    });
  }, [userId]);

  if (!isRestBackendEnabled()) return null;

  const counts = {
    all: rows.length,
    active: rows.filter((r) => r.status === 'active').length,
    sold: rows.filter((r) => r.status === 'sold').length,
    archived: rows.filter((r) => r.status === 'archived').length,
  };
  const filtered = tab === 'all' ? rows : rows.filter((r) => r.status === tab);

  return (
    <section className="card rounded-[22px] p-5 sm:p-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-[-0.02em] text-[var(--color-secondary)]">
          Eʼlonlar tarixi
        </h2>
        <div className="hidden gap-2 sm:flex">
          <Count icon={Clock} label="Faol" value={counts.active} />
          <Count icon={CheckCircle2} label="Sotildi" value={counts.sold} />
          <Count icon={Archive} label="Arxiv" value={counts.archived} />
        </div>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'active', 'sold', 'archived'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
              tab === t
                ? 'bg-[var(--color-brand-green)] text-white'
                : 'bg-[var(--color-background)] text-[var(--color-muted)] hover:text-[var(--color-secondary)]',
            )}
          >
            {t === 'all' ? 'Hammasi' : STATUS_LABEL[t].label}
            <span className="ml-1 opacity-70">{counts[t]}</span>
          </button>
        ))}
      </div>

      {!loaded ? (
        <p className="text-sm text-[var(--color-muted)]">Yuklanmoqda…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">Bu bo'limda hali eʼlon yoʻq.</p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {filtered.map((r) => {
            const s = STATUS_LABEL[r.status] ?? STATUS_LABEL.archived;
            const price =
              r.priceAmount && r.priceCurrency
                ? `${Number(r.priceAmount).toLocaleString('uz-UZ')} ${r.priceCurrency}`
                : null;
            return (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <Link
                  href={r.vertical === 'ish' ? `/job/${r.id}` : `/listing/${r.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--color-secondary)]">
                      {r.title}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {VERTICAL_LABEL[r.vertical] ?? r.vertical}
                      {price ? ` · ${price}` : ''} ·{' '}
                      {new Date(r.createdAt).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                </Link>
                <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold', s.cls)}>
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
