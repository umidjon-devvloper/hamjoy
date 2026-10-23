'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, X } from 'lucide-react';
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

interface Verification {
  id: string;
  userId: string;
  idDocumentUrl: string;
  selfieUrl: string;
  status: string;
  note: string | null;
  createdAt: string;
  userName: string | null;
}

const base = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';

async function authHeader(): Promise<Record<string, string>> {
  const token = await joymeeTokens.getAccess();
  return token
    ? { authorization: `Bearer ${token}`, 'content-type': 'application/json' }
    : { 'content-type': 'application/json' };
}

export default function AdminVerificationsPage() {
  const [rows, setRows] = useState<Verification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    if (!isRestBackendEnabled()) {
      setLoaded(true);
      return;
    }
    try {
      const res = await fetch(`${base()}/admin/verifications`, { headers: await authHeader() });
      if (res.ok) setRows((await res.json()) as Verification[]);
      else setRows([]);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const decide = async (id: string, decision: 'approve' | 'reject') => {
    const note =
      decision === 'reject'
        ? window.prompt('Rad etish sababini qisqa yozing (ixtiyoriy):') ?? undefined
        : undefined;
    setBusyId(id);
    try {
      const res = await fetch(`${base()}/admin/verifications/${id}/${decision}`, {
        method: 'POST',
        headers: await authHeader(),
        body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error(await res.text());
      appToast.success(decision === 'approve' ? 'Tasdiqlandi' : 'Rad etildi');
      void load();
    } catch (err) {
      appToast.error(err, "Amal bajarilmadi");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Verifikatsiya so'rovlari"
        subtitle="Pasport va selfie — tasdiqlasangiz foydalanuvchiga ✓ belgisi beriladi"
      />
      <Panel>
        {!isRestBackendEnabled() ? (
          <div className="p-6 text-center text-sm text-slate-500">
            Haqiqiy backend yoqilmagan — so'rovlar demo rejimda chiqmaydi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Foydalanuvchi</th>
                  <th className={thClass}>Hujjatlar</th>
                  <th className={thClass}>Yuborilgan</th>
                  <th className={thClass}></th>
                </tr>
              </thead>
              <tbody>
                {!loaded ? (
                  <EmptyRow colSpan={4} text="Yuklanmoqda…" />
                ) : rows.length === 0 ? (
                  <EmptyRow colSpan={4} text="Yangi so'rov yo'q" />
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className={tdClass}>
                        <Link href={`/u/${r.userId}`} className="font-medium text-slate-900 hover:text-emerald-700">
                          {r.userName ?? r.userId.slice(0, 8)}
                        </Link>
                      </td>
                      <td className={tdClass}>
                        <div className="flex gap-3">
                          <a
                            href={r.idDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-emerald-700 underline"
                          >
                            Hujjat
                          </a>
                          <a
                            href={r.selfieUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-emerald-700 underline"
                          >
                            Selfie
                          </a>
                        </div>
                      </td>
                      <td className={tdClass}>
                        {new Date(r.createdAt).toLocaleString('uz-UZ')}
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => decide(r.id, 'approve')}
                            disabled={busyId === r.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Tasdiqlash
                          </button>
                          <button
                            type="button"
                            onClick={() => decide(r.id, 'reject')}
                            disabled={busyId === r.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Rad etish
                          </button>
                        </div>
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
