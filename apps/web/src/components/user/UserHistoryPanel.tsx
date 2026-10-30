'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Archive, Clock, Zap } from 'lucide-react';
import { joymeeReviews, type UserHistoryRow } from '@/lib/joymee/reviews';
import { joymeeListingsRepository } from '@/lib/joymee/listings.repository';
import { isRestBackendEnabled } from '@/lib/api/config';
import { appToast } from '@/lib/feedback/toast';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

type Tab = 'all' | 'active' | 'sold' | 'archived';

const STATUS_CLS: Record<string, string> = {
  active:   'bg-[var(--color-primary-light)] text-[var(--color-brand-green)]',
  sold:     'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
  archived: 'bg-[#EEEFEA] text-[var(--color-muted)]',
  draft:    'bg-[#EEEFEA] text-[var(--color-muted)]',
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
  const { t } = useI18n();

  const load = () => {
    void joymeeReviews.myListings().then((r) => {
      setRows(r);
      setLoaded(true);
    }).catch(() => {
      setLoaded(true);
    });
  };

  useEffect(() => {
    if (!isRestBackendEnabled() || !userId) return;
    load();
  }, [userId]);

  const activate = async (id: string) => {
    try {
      await joymeeListingsRepository.publish(id);
      appToast.success(t.listings_activated);
      load();
    } catch (err) {
      appToast.error(err, t.listings_activate_failed);
    }
  };

  if (!isRestBackendEnabled()) return null;

  const statusLabel: Record<string, string> = {
    active: t.listings_active,
    sold: t.listings_sold,
    archived: t.listings_archived,
    draft: t.listings_draft,
  };

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
          {t.listings_history}
        </h2>
        <div className="hidden gap-2 sm:flex">
          <Count icon={Clock} label={t.listings_active} value={counts.active} />
          <Count icon={CheckCircle2} label={t.listings_sold} value={counts.sold} />
          <Count icon={Archive} label={t.listings_archived} value={counts.archived} />
        </div>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'active', 'sold', 'archived'] as Tab[]).map((tb) => (
          <button
            key={tb}
            type="button"
            onClick={() => setTab(tb)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
              tab === tb
                ? 'bg-[var(--color-brand-green)] text-white'
                : 'bg-[var(--color-background)] text-[var(--color-muted)] hover:text-[var(--color-secondary)]',
            )}
          >
            {tb === 'all' ? t.listings_all : statusLabel[tb]}
            <span className="ml-1 opacity-70">{counts[tb]}</span>
          </button>
        ))}
      </div>

      {!loaded ? (
        <p className="text-sm text-[var(--color-muted)]">{t.loading}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">{t.listings_none}</p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {filtered.map((r) => {
            const sCls = STATUS_CLS[r.status] ?? STATUS_CLS.archived;
            const sLabel = statusLabel[r.status] ?? statusLabel.archived;
            const price =
              r.priceAmount && r.priceCurrency
                ? `${Number(r.priceAmount).toLocaleString('uz-UZ')} ${r.priceCurrency}`
                : null;
            return (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <Link
                  href={r.vertical === 'ish' ? `/job/${r.id}` : `/uy-joy/elon/${r.id}`}
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
                <div className="flex shrink-0 items-center gap-2">
                  {(r.status === 'draft' || r.status === 'archived') && (
                    <button
                      type="button"
                      onClick={() => activate(r.id)}
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-light)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-brand-green)] hover:brightness-95"
                    >
                      <Zap className="h-3 w-3" />
                      {t.listings_activate}
                    </button>
                  )}
                  <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold', sCls)}>
                    {sLabel}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
