'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, ImageOff, RotateCcw, Trash2, X } from 'lucide-react';
import {
  ActionButton,
  AdminPageHeader,
  Badge,
  EmptyRow,
  Pagination,
  Panel,
  SearchField,
  tableClass,
  tdClass,
  thClass,
  usePaged,
} from '@/components/admin/ui';
import { DEMO_LISTINGS } from '@/data/listings';
import { useUserListings } from '@/lib/listings/user-listings';
import { LISTING_STATUS_LABELS, useListingModeration, type ListingModerationStatus } from '@/lib/listings/moderation';
import { formatListingPrice, getListingIntent } from '@/lib/listings/format';
import { useCan, type BadgeTone } from '@/lib/admin/access';
import { appToast } from '@/lib/feedback/toast';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';

type Tab = 'all' | ListingModerationStatus;
const STATUS_TONE: Record<ListingModerationStatus, BadgeTone> = { active: 'green', pending: 'orange', removed: 'red' };
const STATUS_TOAST: Record<ListingModerationStatus, string> = {
  active: 'faollashtirildi',
  pending: 'tekshiruvga qaytarildi',
  removed: 'oʻchirildi',
};

const REJECTION_REASONS = [
  'Narx mos emas',
  'Rasmlar sifatsiz',
  'Maʼlumotlar toʻliq emas',
  'Qoidalarga zid',
  'Takroriy eʼlon',
];

export default function AdminListingsPage() {
  const can = useCan();
  const userListings = useUserListings();
  const { statusOf, setStatus } = useListingModeration();
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);

  const all = useMemo(() => [...userListings, ...DEMO_LISTINGS], [userListings]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (l) =>
        (tab === 'all' || statusOf(l.id) === tab) &&
        (!q || [l.title, l.district, l.region].some((v) => v.toLowerCase().includes(q)))
    );
  }, [all, tab, query, statusOf]);
  const { rows, page, pageCount, setPage, offset } = usePaged(filtered);
  const count = (s: ListingModerationStatus) => all.filter((l) => statusOf(l.id) === s).length;
  const detailListing = detailId ? all.find((l) => l.id === detailId) : null;

  const apply = (ids: string[], status: ListingModerationStatus) => {
    if (status === 'removed' && !window.confirm(`${ids.length} ta eʼlon oʻchirilsinmi? Saytdan yashiriladi.`)) return;
    setStatus(ids, status);
    setSelected(new Set());
    appToast.success(`${ids.length} ta eʼlon ${STATUS_TOAST[status]}`);
  };

  const pageIds = rows.map((l) => l.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const canModerate = can('listings.moderate');
  const canDelete = can('listings.delete');

  return (
    <>
      <AdminPageHeader title="Uy-joy eʼlonlari" subtitle="Uy-joy eʼlonlarini boshqarish va moderatsiya qilish" />

      <div className={cn('grid gap-6', detailListing && 'xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]')}>
        {/* Main list */}
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {([
                { id: 'all' as Tab, label: 'Barchasi', c: all.length },
                { id: 'active' as Tab, label: 'Faol', c: count('active') },
                { id: 'pending' as Tab, label: 'Tekshiruvda', c: count('pending') },
                { id: 'removed' as Tab, label: 'Oʻchirilgan', c: count('removed') },
              ] as const).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { setTab(f.id); setSelected(new Set()); }}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                    tab === f.id
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {f.label} <span className="ml-1 opacity-80">{f.c}</span>
                </button>
              ))}
            </div>
            <SearchField value={query} onChange={setQuery} placeholder="Sarlavha yoki hudud" />
          </div>

          {selected.size > 0 && (canModerate || canDelete) && (
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-[var(--color-primary-light)]/60 px-5 py-2.5 text-sm">
              <span className="font-semibold text-slate-700">{selected.size} ta tanlandi:</span>
              {canModerate && (
                <>
                  <button type="button" onClick={() => apply([...selected], 'active')} className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 font-semibold text-white hover:bg-[var(--color-primary-hover)]">
                    Tasdiqlash
                  </button>
                  <button type="button" onClick={() => apply([...selected], 'pending')} className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 font-semibold text-white hover:brightness-90">
                    Tekshiruvga
                  </button>
                </>
              )}
              {canDelete && (
                <button type="button" onClick={() => apply([...selected], 'removed')} className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700">
                  Oʻchirish
                </button>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={`${thClass} w-10`}>
                    <input
                      type="checkbox"
                      aria-label="Barchasini tanlash"
                      checked={allOnPageSelected}
                      onChange={() =>
                        setSelected((prev) => {
                          const next = new Set(prev);
                          pageIds.forEach((id) => (allOnPageSelected ? next.delete(id) : next.add(id)));
                          return next;
                        })
                      }
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                  </th>
                  <th className={thClass}>Eʼlon</th>
                  <th className={thClass}>Turi</th>
                  <th className={thClass}>Narxi</th>
                  <th className={thClass}>Holat</th>
                  <th className={`${thClass} text-right`}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <EmptyRow colSpan={6} text="Eʼlon topilmadi" />
                ) : (
                  rows.map((l) => {
                    const status = statusOf(l.id);
                    const isSelected = detailId === l.id;
                    return (
                      <tr
                        key={l.id}
                        onClick={() => setDetailId(l.id)}
                        className={cn(
                          'cursor-pointer transition-colors',
                          isSelected ? 'bg-[var(--color-primary-light)]' : 'hover:bg-slate-50/60'
                        )}
                      >
                        <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" aria-label={`${l.title} — tanlash`} checked={selected.has(l.id)} onChange={() => toggle(l.id)} className="h-4 w-4 accent-[var(--color-primary)]" />
                        </td>
                        <td className={tdClass}>
                          <div className="flex items-center gap-3">
                            <span className="relative flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                              {l.images[0] ? <Image src={l.images[0]} alt="" fill sizes="56px" className="object-cover" /> : <ImageOff className="h-4 w-4" />}
                            </span>
                            <span className="max-w-[180px] truncate font-semibold text-slate-900">{l.title}</span>
                          </div>
                        </td>
                        <td className={tdClass}>
                          <Badge tone="green">{getListingIntent(l).badge}</Badge>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap font-semibold text-slate-900`}>{formatListingPrice(l)}</td>
                        <td className={tdClass}>
                          <Badge tone={STATUS_TONE[status]}>{LISTING_STATUS_LABELS[status]}</Badge>
                        </td>
                        <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                          <span className="flex justify-end gap-0.5">
                            {canModerate && status !== 'active' && <ActionButton icon={CheckCircle2} label="Tasdiqlash" tone="green" onClick={() => apply([l.id], 'active')} />}
                            {canModerate && status === 'active' && <ActionButton icon={RotateCcw} label="Tekshiruvga" tone="blue" onClick={() => apply([l.id], 'pending')} />}
                            {canDelete && status !== 'removed' && <ActionButton icon={Trash2} label="Oʻchirish" tone="red" onClick={() => apply([l.id], 'removed')} />}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageCount={pageCount} total={filtered.length} onChange={setPage} unit="ta eʼlon" />
        </Panel>

        {/* Detail side panel */}
        {detailListing && (
          <Panel className="sticky top-20 hidden xl:block">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="font-semibold text-slate-900">Eʼlon tafsilotlari</h3>
              <button type="button" onClick={() => setDetailId(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              {detailListing.images[0] && (
                <div className="relative aspect-[16/10] w-full">
                  <Image src={detailListing.images[0]} alt="" fill sizes="400px" className="object-cover" />
                </div>
              )}
              <div className="space-y-4 p-5">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{detailListing.title}</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    {detailListing.district}, {detailListing.region}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Narxi</p>
                    <p className="font-bold text-slate-900">{formatListingPrice(detailListing)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Turi</p>
                    <p className="font-bold text-slate-900">{getListingIntent(detailListing).badge}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Xonalar</p>
                    <p className="font-bold text-slate-900">{detailListing.rooms}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Maydon</p>
                    <p className="font-bold text-slate-900">{detailListing.area} m²</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Rad etish sabablari</p>
                  <div className="flex flex-wrap gap-1.5">
                    {REJECTION_REASONS.map((r) => (
                      <span key={r} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {canModerate && statusOf(detailListing.id) !== 'active' && (
                    <button
                      type="button"
                      onClick={() => apply([detailListing.id], 'active')}
                      className="flex-1 rounded-xl bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-colors"
                    >
                      Tasdiqlash
                    </button>
                  )}
                  {canDelete && statusOf(detailListing.id) !== 'removed' && (
                    <button
                      type="button"
                      onClick={() => apply([detailListing.id], 'removed')}
                      className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                    >
                      Rad etish
                    </button>
                  )}
                  <Link
                    href={ROUTES.listing(detailListing.id)}
                    target="_blank"
                    className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}
