'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCheck, Eye, XCircle } from 'lucide-react';
import {
  ActionButton,
  AdminPageHeader,
  Badge,
  EmptyRow,
  Pagination,
  Panel,
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
import type { Report, ReportStatus, ReportTargetType } from '@/types';

type Tab = 'all' | ReportStatus;

const STATUS: Record<ReportStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: 'Yangi', tone: 'red' },
  reviewed: { label: 'Koʻrib chiqilmoqda', tone: 'orange' },
  resolved: { label: 'Hal qilingan', tone: 'green' },
  dismissed: { label: 'Rad etilgan', tone: 'gray' },
};
const TARGET: Record<ReportTargetType, string> = { job: 'Ish eʼloni', user: 'Foydalanuvchi', message: 'Xabar' };

export default function AdminReportsPage() {
  const can = useCan();
  const reports = useAsyncQuery(() => adminService.listReports(), [], []);
  const [tab, setTab] = useState<Tab>('all');

  const filtered = useMemo(
    () =>
      [...reports.data]
        .filter((r) => tab === 'all' || r.status === tab)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reports.data, tab]
  );
  const { rows, page, pageCount, setPage, offset } = usePaged(filtered);
  const count = (s: ReportStatus) => reports.data.filter((r) => r.status === s).length;

  const setStatus = async (report: Report, status: ReportStatus) => {
    try {
      await adminService.updateReportStatus(report.id, status);
      appToast.success(`Murojaat: ${STATUS[status].label.toLowerCase()}`);
      reports.refetch();
    } catch (err) {
      appToast.error(err, 'Holatni oʻzgartirib boʻlmadi');
    }
  };

  const canResolve = can('reports.resolve');

  return (
    <>
      <AdminPageHeader title="Murojaatlar" subtitle="Foydalanuvchilardan kelgan shikoyat va xabarlar" />
      <Panel>
        <div className="p-4">
          <Tabs<Tab>
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'all', label: 'Barchasi', count: reports.data.length },
              { id: 'pending', label: 'Yangi', count: count('pending') },
              { id: 'reviewed', label: 'Koʻrib chiqilmoqda', count: count('reviewed') },
              { id: 'resolved', label: 'Hal qilingan', count: count('resolved') },
              { id: 'dismissed', label: 'Rad etilgan', count: count('dismissed') },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={thClass}>Obyekt</th>
                <th className={thClass}>Sabab</th>
                <th className={thClass}>Sana</th>
                <th className={thClass}>Holat</th>
                <th className={`${thClass} text-right`}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {reports.isLoading ? (
                <EmptyRow colSpan={6} text="Yuklanmoqda…" />
              ) : rows.length === 0 ? (
                <EmptyRow colSpan={6} text="Murojaat yoʻq" />
              ) : (
                rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className={tdClass}>{offset + i + 1}</td>
                    <td className={tdClass}>
                      {r.targetType === 'job' ? (
                        <Link href={ROUTES.job(r.targetId)} target="_blank" className="font-semibold text-blue-600 hover:underline">
                          {TARGET.job}
                        </Link>
                      ) : (
                        <span className="font-semibold text-slate-900">{TARGET[r.targetType]}</span>
                      )}
                      <span className="block text-xs text-slate-500">{r.targetId}</span>
                    </td>
                    <td className={tdClass}>
                      <span className="block font-medium text-slate-900">{r.reason}</span>
                      {r.details && <span className="block max-w-sm truncate text-xs text-slate-500">{r.details}</span>}
                    </td>
                    <td className={`${tdClass} whitespace-nowrap`}>{r.createdAt.slice(0, 16).replace('T', ' ')}</td>
                    <td className={tdClass}>
                      <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
                    </td>
                    <td className={tdClass}>
                      {canResolve ? (
                        <span className="flex justify-end gap-0.5">
                          {r.status === 'pending' && <ActionButton icon={Eye} label="Koʻrib chiqilmoqda" tone="blue" onClick={() => setStatus(r, 'reviewed')} />}
                          {r.status !== 'resolved' && <ActionButton icon={CheckCheck} label="Hal qilindi" tone="green" onClick={() => setStatus(r, 'resolved')} />}
                          {r.status !== 'dismissed' && <ActionButton icon={XCircle} label="Rad etish" tone="red" onClick={() => setStatus(r, 'dismissed')} />}
                        </span>
                      ) : (
                        <span className="block text-right text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageCount={pageCount} total={filtered.length} onChange={setPage} unit="ta murojaat" />
      </Panel>
    </>
  );
}
