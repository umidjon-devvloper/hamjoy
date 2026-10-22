'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Trash2, Star } from 'lucide-react';
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

interface AdminReview {
  id: string;
  toUserId: string;
  fromUserId: string;
  listingId: string | null;
  rating: number;
  comment: string | null;
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

  const remove = async (id: string) => {
    if (!confirm("Rostdan ham o'chirmoqchimisiz?")) return;
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

  return (
    <>
      <AdminPageHeader title="Sharhlar" subtitle="Reytinglar va izohlarni moderatsiya qilish" />
      <Panel>
        {!isRestBackendEnabled() ? (
          <div className="p-6 text-center text-sm text-slate-500">
            Haqiqiy backend yoqilmagan — sharhlar demo rejimda chiqmaydi.
          </div>
        ) : (
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
                ) : rows.length === 0 ? (
                  <EmptyRow colSpan={6} text="Hali sharh yoʻq" />
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className={tdClass}>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                          <Star className="h-4 w-4 fill-amber-400" strokeWidth={0} />
                          {r.rating}
                        </span>
                      </td>
                      <td className={`${tdClass} max-w-[320px] truncate`}>
                        {r.comment ?? <span className="text-slate-400">(izohsiz)</span>}
                      </td>
                      <td className={tdClass}>
                        <div className="flex min-w-0 items-center gap-1 text-sm">
                          <Link
                            href={`/u/${r.fromUserId}`}
                            className="truncate text-slate-700 hover:text-emerald-700"
                          >
                            {r.fromUserName ?? r.fromUserId.slice(0, 8)}
                          </Link>
                          <span className="shrink-0 text-slate-400">→</span>
                          <Link
                            href={`/u/${r.toUserId}`}
                            className="truncate font-semibold text-slate-900 hover:text-emerald-700"
                          >
                            {r.toUserName ?? r.toUserId.slice(0, 8)}
                          </Link>
                        </div>
                      </td>
                      <td className={`${tdClass} max-w-[240px] truncate`}>
                        {r.listingId ? (
                          <Link
                            href={`/listing/${r.listingId}`}
                            className="text-sm text-slate-700 hover:text-emerald-700"
                          >
                            {r.listingTitle ?? r.listingId.slice(0, 8)}
                          </Link>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className={tdClass}>
                        {new Date(r.createdAt).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <button
                          type="button"
                          onClick={() => remove(r.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          O'chirish
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
