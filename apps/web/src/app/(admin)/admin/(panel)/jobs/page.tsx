'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, Trash2, XCircle } from 'lucide-react';
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
import { adminService } from '@/services/admin.service';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { useCan, type BadgeTone } from '@/lib/admin/access';
import { appToast } from '@/lib/feedback/toast';
import { ROUTES } from '@/lib/navigation/routes';
import { JOB_STATUS_LABELS, type AdminJobRow, type JobStatus } from '@/types';
import { cn } from '@/lib/utils';

type Tab = 'pending' | 'active' | 'closed';
const STATUS_TONE: Record<JobStatus, BadgeTone> = { active: 'green', pending: 'orange', closed: 'red', draft: 'gray' };

const AUTO_CHECK: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: 'Oʻtdi', tone: 'green' },
  pending: { label: 'Kutilmoqda', tone: 'orange' },
  closed: { label: 'Rad', tone: 'red' },
  draft: { label: 'Qoralama', tone: 'gray' },
};

export default function AdminJobsPage() {
  const can = useCan();
  const jobs = useAsyncQuery(() => adminService.listAllJobs(), [], []);
  const [tab, setTab] = useState<Tab>('pending');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.data.filter(
      (j) =>
        j.status === tab &&
        (!q || [j.title, j.companyName, j.posterName].some((v) => v.toLowerCase().includes(q)))
    );
  }, [jobs.data, tab, query]);
  const { rows, page, pageCount, setPage } = usePaged(filtered);
  const count = (s: JobStatus) => jobs.data.filter((j) => j.status === s).length;

  const run = async (job: AdminJobRow, action: 'approve' | 'close' | 'delete') => {
    if (action === 'delete' && !window.confirm(`"${job.title}" butunlay oʻchirilsinmi?`)) return;
    try {
      if (action === 'approve') await adminService.approveJob(job.id);
      if (action === 'close') await adminService.rejectJob(job.id);
      if (action === 'delete') await adminService.deleteJob(job.id);
      appToast.success({ approve: 'Eʼlon tasdiqlandi', close: 'Eʼlon yopildi', delete: 'Eʼlon oʻchirildi' }[action]);
      jobs.refetch();
    } catch (err) {
      appToast.error(err, 'Amalni bajarib boʻlmadi');
    }
  };

  const canModerate = can('jobs.moderate');

  return (
    <>
      <AdminPageHeader title="Ish eʼlonlari" subtitle="Vakansiyalarni boshqarish va moderatsiya qilish" />
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            {([
              { id: 'pending' as Tab, label: 'Moderatsiyada', c: count('pending') },
              { id: 'active' as Tab, label: 'Faol', c: count('active') },
              { id: 'closed' as Tab, label: 'Rad etilgan', c: count('closed') },
            ] as const).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                  tab === t.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {t.label}
                {t.c > 0 && (
                  <span className={cn(
                    'ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold',
                    tab === t.id ? 'bg-[var(--color-primary)] text-white' : 'bg-slate-200 text-slate-600'
                  )}>
                    {t.c}
                  </span>
                )}
              </button>
            ))}
          </div>
          <SearchField value={query} onChange={setQuery} placeholder="Lavozim yoki kompaniya" />
        </div>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Vakansiya</th>
                <th className={thClass}>Kompaniya</th>
                <th className={thClass}>Maosh</th>
                <th className={thClass}>Yuborildi</th>
                <th className={thClass}>Tekshiruv</th>
                <th className={`${thClass} text-right`}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {jobs.isLoading ? (
                <EmptyRow colSpan={6} text="Yuklanmoqda…" />
              ) : rows.length === 0 ? (
                <EmptyRow colSpan={6} text="Eʼlon topilmadi" />
              ) : (
                rows.map((j) => {
                  const check = AUTO_CHECK[j.status] ?? AUTO_CHECK.draft;
                  return (
                    <tr key={j.id} className="hover:bg-slate-50/60">
                      <td className={tdClass}>
                        <span className="block max-w-[240px] truncate font-semibold text-slate-900">{j.title}</span>
                      </td>
                      <td className={tdClass}>{j.companyName}</td>
                      <td className={`${tdClass} whitespace-nowrap text-slate-600`}>—</td>
                      <td className={`${tdClass} whitespace-nowrap text-slate-500`}>{j.createdAt.slice(0, 10)}</td>
                      <td className={tdClass}>
                        <Badge tone={check.tone}>{check.label}</Badge>
                      </td>
                      <td className={tdClass}>
                        <span className="flex justify-end gap-1">
                          <Link href={ROUTES.job(j.id)} target="_blank" title="Saytda koʻrish" aria-label="Saytda koʻrish" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          {canModerate && j.status !== 'active' && (
                            <button
                              type="button"
                              onClick={() => run(j, 'approve')}
                              className="flex h-8 items-center gap-1 rounded-lg bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-100 transition-colors"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Tasdiqlash
                            </button>
                          )}
                          {canModerate && j.status === 'active' && (
                            <ActionButton icon={XCircle} label="Yopish" tone="blue" onClick={() => run(j, 'close')} />
                          )}
                          {canModerate && j.status !== 'closed' && (
                            <button
                              type="button"
                              onClick={() => run(j, 'close')}
                              className="flex h-8 items-center gap-1 rounded-lg bg-red-50 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Rad
                            </button>
                          )}
                          {can('jobs.delete') && <ActionButton icon={Trash2} label="Oʻchirish" tone="red" onClick={() => run(j, 'delete')} />}
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
