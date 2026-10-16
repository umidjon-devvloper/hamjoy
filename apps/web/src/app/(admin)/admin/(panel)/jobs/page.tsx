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
  Tabs,
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

type Tab = 'all' | JobStatus;
const STATUS_TONE: Record<JobStatus, BadgeTone> = { active: 'green', pending: 'orange', closed: 'red', draft: 'gray' };

export default function AdminJobsPage() {
  const can = useCan();
  const jobs = useAsyncQuery(() => adminService.listAllJobs(), [], []);
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.data.filter(
      (j) =>
        (tab === 'all' || j.status === tab) &&
        (!q || [j.title, j.companyName, j.posterName].some((v) => v.toLowerCase().includes(q)))
    );
  }, [jobs.data, tab, query]);
  const { rows, page, pageCount, setPage, offset } = usePaged(filtered);
  const count = (s: JobStatus) => jobs.data.filter((j) => j.status === s).length;

  const run = async (job: AdminJobRow, action: 'approve' | 'close' | 'delete') => {
    if (action === 'delete' && !window.confirm(`“${job.title}” butunlay oʻchirilsinmi?`)) return;
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
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <Tabs<Tab>
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'all', label: 'Barchasi', count: jobs.data.length },
              { id: 'active', label: 'Faol', count: count('active') },
              { id: 'pending', label: 'Tekshiruvda', count: count('pending') },
              { id: 'closed', label: 'Yopilgan', count: count('closed') },
            ]}
          />
          <SearchField value={query} onChange={setQuery} placeholder="Lavozim yoki kompaniya" />
        </div>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={thClass}>Lavozim</th>
                <th className={thClass}>Kompaniya</th>
                <th className={thClass}>Eʼlon beruvchi</th>
                <th className={thClass}>Sana</th>
                <th className={thClass}>Holat</th>
                <th className={`${thClass} text-right`}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {jobs.isLoading ? (
                <EmptyRow colSpan={7} text="Yuklanmoqda…" />
              ) : rows.length === 0 ? (
                <EmptyRow colSpan={7} text="Eʼlon topilmadi" />
              ) : (
                rows.map((j, i) => (
                  <tr key={j.id} className="hover:bg-slate-50/60">
                    <td className={tdClass}>{offset + i + 1}</td>
                    <td className={`${tdClass} max-w-xs truncate font-semibold text-slate-900`}>{j.title}</td>
                    <td className={tdClass}>{j.companyName}</td>
                    <td className={tdClass}>{j.posterName}</td>
                    <td className={`${tdClass} whitespace-nowrap`}>{j.createdAt.slice(0, 10)}</td>
                    <td className={tdClass}>
                      <Badge tone={STATUS_TONE[j.status]}>{JOB_STATUS_LABELS[j.status]}</Badge>
                    </td>
                    <td className={tdClass}>
                      <span className="flex justify-end gap-0.5">
                        <Link href={ROUTES.job(j.id)} target="_blank" title="Saytda koʻrish" aria-label="Saytda koʻrish" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        {canModerate && j.status !== 'active' && <ActionButton icon={CheckCircle2} label="Tasdiqlash" tone="green" onClick={() => run(j, 'approve')} />}
                        {canModerate && j.status === 'active' && <ActionButton icon={XCircle} label="Yopish" tone="blue" onClick={() => run(j, 'close')} />}
                        {can('jobs.delete') && <ActionButton icon={Trash2} label="Oʻchirish" tone="red" onClick={() => run(j, 'delete')} />}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageCount={pageCount} total={filtered.length} onChange={setPage} unit="ta eʼlon" />
      </Panel>
    </>
  );
}
