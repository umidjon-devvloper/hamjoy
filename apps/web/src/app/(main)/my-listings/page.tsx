'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil, CheckCircle2, RotateCcw, Trash2, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/context/AuthContext';
import { joymeeReviews, type UserHistoryRow } from '@/lib/joymee/reviews';
import { joymeeListingsRepository } from '@/lib/joymee/listings.repository';
import { isRestBackendEnabled } from '@/lib/api/config';
import { appToast } from '@/lib/feedback/toast';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'active' | 'sold' | 'archived';

const STATUS: Record<string, { label: string; cls: string }> = {
  active:   { label: 'Faol',     cls: 'bg-[var(--color-primary-light)] text-[var(--color-brand-green)]' },
  sold:     { label: 'Sotildi',  cls: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]' },
  archived: { label: 'Arxiv',    cls: 'bg-[#EEEFEA] text-[var(--color-muted)]' },
  draft:    { label: 'Qoralama', cls: 'bg-[#EEEFEA] text-[var(--color-muted)]' },
};

const VERTICAL_LABEL: Record<string, string> = {
  'uy-joy': 'Uy-joy',
  avto: 'Avto',
  bepul: 'Bepul',
  ish: 'Ish',
};

function Row({
  item,
  onMarkSold,
  onReopen,
  onDelete,
}: {
  item: UserHistoryRow;
  onMarkSold: (id: string) => void;
  onReopen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const s = STATUS[item.status] ?? STATUS.archived;
  const price =
    item.priceAmount && item.priceCurrency
      ? `${Number(item.priceAmount).toLocaleString('uz-UZ')} ${item.priceCurrency}`
      : null;
  const viewHref = item.vertical === 'ish' ? `/job/${item.id}` : `/listing/${item.id}`;
  const editHref =
    item.vertical === 'ish'
      ? `/create?edit=${item.id}`
      : item.vertical === 'uy-joy'
        ? `/create?tur=uy-joy&edit=${item.id}`
        : null; // avto / bepul edit — kelgusi faza

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link href={viewHref} className="truncate text-sm font-semibold text-[var(--color-secondary)] hover:text-[var(--color-brand-green)]">
            {item.title}
          </Link>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold', s.cls)}>{s.label}</span>
        </div>
        <p className="mt-0.5 text-xs text-[var(--color-muted)]">
          {VERTICAL_LABEL[item.vertical] ?? item.vertical}
          {price ? ` · ${price}` : ''} · {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {editHref ? (
          <Link
            href={editHref}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-secondary)] hover:border-[var(--color-brand-green)]/40"
          >
            <Pencil className="h-3.5 w-3.5" /> Tahrir
          </Link>
        ) : null}
        {item.status === 'active' ? (
          <button
            type="button"
            onClick={() => onMarkSold(item.id)}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-light)] px-3 py-1 text-xs font-semibold text-[var(--color-accent)] hover:brightness-95"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Sotildi
          </button>
        ) : null}
        {item.status === 'sold' ? (
          <button
            type="button"
            onClick={() => onReopen(item.id)}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-green)] hover:brightness-95"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Qayta ochish
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="inline-flex items-center gap-1 rounded-full border border-[#F3D2CF] bg-white px-3 py-1 text-xs font-semibold text-[#B42318] hover:bg-[#FBECEB]"
        >
          <Trash2 className="h-3.5 w-3.5" /> O'chirish
        </button>
      </div>
    </li>
  );
}

function MyListingsContent() {
  const { user } = useAuth();
  const [rows, setRows] = useState<UserHistoryRow[]>([]);
  const [tab, setTab] = useState<Tab>('all');
  const [loaded, setLoaded] = useState(false);

  const load = () => {
    if (!user.id) return;
    void joymeeReviews.history(user.id).then((r) => {
      setRows(r);
      setLoaded(true);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  if (!isRestBackendEnabled()) {
    return (
      <div className="page-container">
        <p className="text-center text-sm text-[var(--color-muted)]">
          Haqiqiy backend yoqilmagan — mening eʼlonlarim namuna rejimida ko'rinmaydi.
        </p>
      </div>
    );
  }

  const counts = {
    all: rows.length,
    active: rows.filter((r) => r.status === 'active').length,
    sold: rows.filter((r) => r.status === 'sold').length,
    archived: rows.filter((r) => r.status === 'archived').length,
  };
  const filtered = tab === 'all' ? rows : rows.filter((r) => r.status === tab);

  const markSold = async (id: string) => {
    try {
      await joymeeListingsRepository.markSold(id);
      appToast.success('Sotildi deb belgilandi');
      load();
    } catch (err) {
      appToast.error(err, 'Amal bajarilmadi');
    }
  };
  const reopen = async (id: string) => {
    try {
      await joymeeListingsRepository.reopen(id);
      appToast.success('E\'lon qayta ochildi');
      load();
    } catch (err) {
      appToast.error(err, 'Amal bajarilmadi');
    }
  };
  const remove = async (id: string) => {
    if (!confirm('Rostdan ham o\'chirmoqchimisiz?')) return;
    try {
      await joymeeListingsRepository.remove(id);
      appToast.success('O\'chirildi');
      load();
    } catch (err) {
      appToast.error(err, 'O\'chirib bo\'lmadi');
    }
  };

  return (
    <div className="page-container">
      <Link
        href="/profile"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-brand-green)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Profil
      </Link>

      <PageHeader title="Mening eʼlonlarim" subtitle="Sotildi deb belgilash, qayta ochish, o'chirish" />

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
            {t === 'all' ? 'Hammasi' : STATUS[t].label}
            <span className="ml-1 opacity-70">{counts[t]}</span>
          </button>
        ))}
      </div>

      {!loaded ? (
        <p className="text-sm text-[var(--color-muted)]">Yuklanmoqda…</p>
      ) : filtered.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="mb-3 text-sm text-[var(--color-muted)]">Bu bo'limda hali eʼlon yoʻq.</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-sm font-bold text-white hover:brightness-110"
          >
            Yangi eʼlon joylash
          </Link>
        </div>
      ) : (
        <ul className="card divide-y divide-[var(--color-border)] px-5">
          {filtered.map((r) => (
            <Row key={r.id} item={r} onMarkSold={markSold} onReopen={reopen} onDelete={remove} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MyListingsPage() {
  return (
    <RequireAuth>
      <MyListingsContent />
    </RequireAuth>
  );
}
