'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, ImageOff, RotateCcw, Trash2 } from 'lucide-react';
import {
  ActionButton,
  AdminPageHeader,
  Badge,
  EmptyRow,
  Pagination,
  Panel,
  SearchField,
  tableClass,
  Tabs,
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

type Tab = 'all' | ListingModerationStatus;
const STATUS_TONE: Record<ListingModerationStatus, BadgeTone> = { active: 'green', pending: 'orange', removed: 'red' };
const STATUS_TOAST: Record<ListingModerationStatus, string> = {
  active: 'faollashtirildi',
  pending: 'tekshiruvga qaytarildi',
  removed: 'oʻchirildi',
};

export default function AdminListingsPage() {
  const can = useCan();
  const userListings = useUserListings();
  const { statusOf, setStatus } = useListingModeration();
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <Tabs<Tab>
            value={tab}
            onChange={(t) => {
              setTab(t);
              setSelected(new Set());
            }}
            tabs={[
              { id: 'all', label: 'Barchasi', count: all.length },
              { id: 'active', label: 'Faol', count: count('active') },
              { id: 'pending', label: 'Tekshiruvda', count: count('pending') },
              { id: 'removed', label: 'Oʻchirilgan', count: count('removed') },
            ]}
          />
          <SearchField value={query} onChange={setQuery} placeholder="Sarlavha yoki hudud" />
        </div>

        {selected.size > 0 && (canModerate || canDelete) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-blue-50/60 px-4 py-2.5 text-sm">
            <span className="font-semibold text-slate-700">{selected.size} ta tanlandi:</span>
            {canModerate && (
              <>
                <button type="button" onClick={() => apply([...selected], 'active')} className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700">
                  Tasdiqlash
                </button>
                <button type="button" onClick={() => apply([...selected], 'pending')} className="rounded-lg bg-amber-500 px-3 py-1.5 font-semibold text-white hover:bg-amber-600">
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
                    aria-label="Sahifadagi barchasini tanlash"
                    checked={allOnPageSelected}
                    onChange={() =>
                      setSelected((prev) => {
                        const next = new Set(prev);
                        pageIds.forEach((id) => (allOnPageSelected ? next.delete(id) : next.add(id)));
                        return next;
                      })
                    }
                    className="h-4 w-4 accent-blue-600"
                  />
                </th>
                <th className={thClass}>#</th>
                <th className={thClass}>Rasm</th>
                <th className={thClass}>Sarlavha</th>
                <th className={thClass}>Joylashuv</th>
                <th className={thClass}>Narxi</th>
                <th className={thClass}>Holat</th>
                <th className={`${thClass} text-right`}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <EmptyRow colSpan={8} text="Eʼlon topilmadi" />
              ) : (
                rows.map((l, i) => {
                  const status = statusOf(l.id);
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/60">
                      <td className={tdClass}>
                        <input type="checkbox" aria-label={`${l.title} — tanlash`} checked={selected.has(l.id)} onChange={() => toggle(l.id)} className="h-4 w-4 accent-blue-600" />
                      </td>
                      <td className={tdClass}>{offset + i + 1}</td>
                      <td className={tdClass}>
                        <span className="relative flex h-10 w-14 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                          {l.images[0] ? <Image src={l.images[0]} alt="" fill sizes="56px" className="object-cover" /> : <ImageOff className="h-4 w-4" />}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <span className="block max-w-xs truncate font-semibold text-slate-900">{l.title}</span>
                        <span className="text-xs text-slate-500">
                          {getListingIntent(l).badge}
                          {l.ownerId ? ' · foydalanuvchi joylagan' : ' · demo'}
                        </span>
                      </td>
                      <td className={tdClass}>
                        {l.district}, {l.region}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap font-semibold text-slate-900`}>{formatListingPrice(l)}</td>
                      <td className={tdClass}>
                        <Badge tone={STATUS_TONE[status]}>{LISTING_STATUS_LABELS[status]}</Badge>
                      </td>
                      <td className={tdClass}>
                        <span className="flex justify-end gap-0.5">
                          <Link href={ROUTES.listing(l.id)} target="_blank" title="Saytda koʻrish" aria-label="Saytda koʻrish" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          {canModerate && status !== 'active' && <ActionButton icon={CheckCircle2} label="Tasdiqlash" tone="green" onClick={() => apply([l.id], 'active')} />}
                          {canModerate && status === 'active' && <ActionButton icon={RotateCcw} label="Tekshiruvga qaytarish" tone="blue" onClick={() => apply([l.id], 'pending')} />}
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
    </>
  );
}
