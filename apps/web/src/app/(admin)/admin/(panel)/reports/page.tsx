'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Ban, CheckCheck, Clock, EyeOff, Shield } from 'lucide-react';
import {
  AdminPageHeader,
  Badge,
  Panel,
  Pagination,
  usePaged,
} from '@/components/admin/ui';
import { adminService } from '@/services/admin.service';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { useCan, type BadgeTone } from '@/lib/admin/access';
import { appToast } from '@/lib/feedback/toast';
import { ROUTES } from '@/lib/navigation/routes';
import type { Report, ReportStatus, ReportTargetType } from '@/types';
import { cn } from '@/lib/utils';

type Tab = 'all' | ReportStatus;

const STATUS: Record<ReportStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: 'Yangi', tone: 'red' },
  reviewed: { label: 'Koʻrib chiqilmoqda', tone: 'orange' },
  resolved: { label: 'Hal qilingan', tone: 'green' },
  dismissed: { label: 'Rad etilgan', tone: 'gray' },
};
const TARGET: Record<ReportTargetType, string> = { job: 'Ish eʼloni', user: 'Foydalanuvchi', message: 'Xabar' };

function SeverityPill({ urgent }: { urgent: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide',
      urgent ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
    )}>
      {urgent ? <><AlertTriangle className="h-3 w-3" /> Shoshilinch</> : <><Clock className="h-3 w-3" /> Oddiy</>}
    </span>
  );
}

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
  const { rows, page, pageCount, setPage } = usePaged(filtered, 6);
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

  const tabs: { id: Tab; label: string; c: number }[] = [
    { id: 'all', label: 'Barchasi', c: reports.data.length },
    { id: 'pending', label: 'Yangi', c: count('pending') },
    { id: 'reviewed', label: 'Koʻrilmoqda', c: count('reviewed') },
    { id: 'resolved', label: 'Hal qilingan', c: count('resolved') },
    { id: 'dismissed', label: 'Rad etilgan', c: count('dismissed') },
  ];

  return (
    <>
      <AdminPageHeader title="Murojaatlar" subtitle="Foydalanuvchilardan kelgan shikoyat va xabarlar" />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              tab === t.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {t.label}
            {t.c > 0 && <span className="ml-1.5 opacity-80">{t.c}</span>}
          </button>
        ))}
      </div>

      {reports.isLoading ? (
        <p className="py-12 text-center text-sm text-slate-500">Yuklanmoqda…</p>
      ) : rows.length === 0 ? (
        <Panel>
          <p className="px-5 py-12 text-center text-sm text-slate-500">Murojaat yoʻq</p>
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => {
            const isUrgent = r.reason.toLowerCase().includes('spam') || r.reason.toLowerCase().includes('firib');
            const targetHref = r.targetType === 'job' ? ROUTES.job(r.targetId) : undefined;
            return (
              <div
                key={r.id}
                className={cn(
                  'flex flex-col gap-3 rounded-[20px] border bg-white p-5',
                  isUrgent ? 'border-red-200' : 'border-[var(--color-border)]'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <SeverityPill urgent={isUrgent} />
                  <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">{r.reason}</p>
                  {r.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 italic">"{r.description}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Shield className="h-3.5 w-3.5" />
                  {targetHref ? (
                    <Link href={targetHref} target="_blank" className="font-medium text-[var(--color-primary)] hover:underline">
                      {TARGET[r.targetType]}
                    </Link>
                  ) : (
                    <span>{TARGET[r.targetType]}</span>
                  )}
                  <span className="ml-auto text-xs">{r.createdAt.slice(0, 10)}</span>
                </div>

                {canResolve && r.status !== 'resolved' && r.status !== 'dismissed' && (
                  <div className="flex gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setStatus(r, 'dismissed')}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Asossiz
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(r, 'resolved')}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-50 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      <EyeOff className="h-3.5 w-3.5" /> Eʼlonni yashirish
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(r, 'resolved')}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {(r.status === 'resolved' || r.status === 'dismissed') && (
                  <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3 text-sm">
                    <CheckCheck className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium text-emerald-600">
                      {r.status === 'resolved' ? 'Hal qilingan' : 'Rad etilgan'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-4">
          <Panel>
            <Pagination page={page} pageCount={pageCount} total={filtered.length} onChange={setPage} unit="ta murojaat" />
          </Panel>
        </div>
      )}
    </>
  );
}
