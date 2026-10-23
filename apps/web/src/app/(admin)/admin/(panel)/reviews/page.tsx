'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, Star, Trash2 } from 'lucide-react';
import {
  AdminPageHeader,
  EmptyRow,
  Panel,
  tableClass,
  tdClass,
  thClass,
} from '@/components/admin/ui';
import { appToast } from '@/lib/feedback/toast';
import { joymeeTokens } from '@/lib/joymee/client';
import { isRestBackendEnabled } from '@/lib/api/config';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'visible' | 'hidden';

interface AdminReview {
  id: string;
  toUserId: string;
  fromUserId: string;
  listingId: string | null;
  rating: number;
  comment: string | null;
  hidden: boolean;
  createdAt: string;
  fromUserName: string | null;
  toUserName: string | null;
  listingTitle: string | null;
}

const base = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';

async function authHeader(): Promise<Record<string, string>> {
  const token = await joymeeTokens.getAccess();
  return token ? { authorization: `Bearer ${token}` } : {};
}

export default function AdminReviewsPage() {
  const [rows, setRows] = useState<AdminReview[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>('all');

  const load = async () => {
    if (!isRestBackendEnabled()) {
      setLoaded(true);
      return;
    }
    try {
      const res = await fetch(`${base()}/admin/reviews`, { headers: await authHeader() });
      if (!res.ok) {
        setRows([]);
        setLoaded(true);
        return;
      }
      setRows((await res.json()) as AdminReview[]);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(
    () => ({
      all: rows.length,
      visible: rows.filter((r) => !r.hidden).length,
      hidden: rows.filter((r) => r.hidden).length,
    }),
    [rows],
  );
  const filtered = rows.filter((r) =>
    tab === 'all' ? true : tab === 'visible' ? !r.hidden : r.hidden,
  );

  const toggleHidden = async (r: AdminReview) => {
    const action = r.hidden ? 'unhide' : 'hide';
    try {
      const res = await fetch(`${base()}/admin/reviews/${r.id}/${action}`, {
        method: 'POST',
        headers: await authHeader(),
      });
      if (!res.ok) throw new Error(await res.text());
      appToast.success(r.hidden ? "Ko'rsatildi" : 'Yashirildi');
      void load();
    } catch (err) {
      appToast.error(err, 'Amal bajarilmadi');
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Rostdan ham o'chirmoqchimisiz? Yashirish — qaytib bo'ladigan amal.")) return;
    try {
      const res = await fetch(`${base()}/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: await authHeader(),
      });
      if (!res.ok) throw new Error(await res.text());
      appToast.success("O'chirildi");
      void load();
    } catch (err) {
      appToast.error(err, "O'chirib bo'lmadi");
    }
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'all', label: 'Hammasi' },
    { id: 'visible', label: "Ko'rinadigan" },
    { id: 'hidden', label: 'Yashirin' },
  ];

  return (
    <>
      <AdminPageHeader
        title="Sharhlar"
        subtitle="Yashiring foydalanuvchi uchun qaytmaydigan tarzda; o'chirish esa butunlay yo'q qiladi"
      />
      <Panel>
        {!isRestBackendEnabled() ? (
          <div className="p-6 text-center text-sm text-slate-500">
            Haqiqiy backend yoqilmagan — sharhlar demo rejimda chiqmaydi.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 p-4">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                    tab === t.id
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900',
                  )}
                >
                  {t.label} <span className="ml-1 opacity-70">{counts[t.id]}</span>
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Baho</th>
                    <th className={thClass}>Izoh</th>
                    <th className={thClass}>Kimdan → Kimga</th>
                    <th className={thClass}>Eʼlon</th>
                    <th className={thClass}>Sana</th>
                    <th className={thClass}></th>
                  </tr>
                </thead>
                <tbody>
                  {!loaded ? (
                    <EmptyRow colSpan={6} text="Yuklanmoqda…" />
                  ) : filtered.length === 0 ? (
                    <EmptyRow colSpan={6} text="Bu bo'limda sharh yo'q" />
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className={cn('hover:bg-slate-50', r.hidden && 'bg-slate-50/60')}>
                        <td className={tdClass}>
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                            <Star className="h-4 w-4 fill-amber-400" strokeWidth={0} />
                            {r.rating}
                          </span>
                        </td>
                        <td className={`${tdClass} max-w-[320px]`}>
                          <div className={cn('truncate', r.hidden && 'text-slate-400 line-through')}>
                            {r.comment ?? <span className="text-slate-400">(izohsiz)</span>}
                          </div>
                          {r.hidden ? (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                              <EyeOff className="h-3 w-3" />
                              Yashirin
                            </span>
                          ) : null}
                        </td>
                        <td className={tdClass}>
                          <div className="flex min-w-0 items-center gap-1 text-sm">
                            <Link href={`/u/${r.fromUserId}`} className="truncate text-slate-700 hover:text-emerald-700">
                              {r.fromUserName ?? r.fromUserId.slice(0, 8)}
                            </Link>
                            <span className="shrink-0 text-slate-400">→</span>
                            <Link href={`/u/${r.toUserId}`} className="truncate font-semibold text-slate-900 hover:text-emerald-700">
                              {r.toUserName ?? r.toUserId.slice(0, 8)}
                            </Link>
                          </div>
                        </td>
                        <td className={`${tdClass} max-w-[240px] truncate`}>
                          {r.listingId ? (
                            <Link href={`/listing/${r.listingId}`} className="text-sm text-slate-700 hover:text-emerald-700">
                              {r.listingTitle ?? r.listingId.slice(0, 8)}
                            </Link>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className={tdClass}>{new Date(r.createdAt).toLocaleDateString('uz-UZ')}</td>
                        <td className={`${tdClass} text-right`}>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => toggleHidden(r)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              {r.hidden ? (
                                <>
                                  <Eye className="h-3.5 w-3.5" />
                                  Ko'rsatish
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-3.5 w-3.5" />
                                  Yashirish
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(r.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              O'chirish
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>
    </>
  );
}
