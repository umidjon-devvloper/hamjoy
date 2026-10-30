'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  Briefcase,
  Eye,
  FileText,
  Home,
  MessageSquareWarning,
  TrendingUp,
  Users,
} from 'lucide-react';
import { AdminPageHeader, Badge, BarChart, Panel, ProgressBar } from '@/components/admin/ui';
import { adminService } from '@/services/admin.service';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { DEMO_LISTINGS } from '@/data/listings';
import { useUserListings } from '@/lib/listings/user-listings';
import { useListingModeration } from '@/lib/listings/moderation';
import { formatListingPrice } from '@/lib/listings/format';
import { ROUTES } from '@/lib/navigation/routes';
import { joymeeTokens } from '@/lib/joymee/client';
import { isRestBackendEnabled } from '@/lib/api/config';
import { cn } from '@/lib/utils';

const DAYS = 7;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

interface ReviewStats { total: number; avg: number; last7: number }

const STAT_ICON_TONES = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
  purple: 'bg-violet-50 text-violet-600',
  orange: 'bg-amber-50 text-amber-600',
};

function DashStatCard({
  label,
  value,
  change,
  subLabel,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  change?: string;
  subLabel?: string;
  icon: React.ElementType;
  tone: keyof typeof STAT_ICON_TONES;
}) {
  const isPositive = change?.startsWith('+');
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-[var(--color-border)] bg-white p-5 shadow-[0_1px_2px_rgb(15_31_22/0.04)]">
      <div className="flex items-center justify-between">
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-[14px]', STAT_ICON_TONES[tone])}>
          <Icon className="h-[22px] w-[22px]" />
        </span>
        {change && (
          <span className={cn(
            'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          )}>
            <TrendingUp className={cn('h-3 w-3', !isPositive && 'rotate-180')} />
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--color-muted)]">{label}</p>
        <p className="tabular text-[30px] font-extrabold leading-[1.2] tracking-[-0.02em] text-[var(--color-secondary)]">{value}</p>
      </div>
      {subLabel && <p className="text-xs font-medium text-slate-500">{subLabel}</p>}
    </div>
  );
}

function AlertCard({
  title,
  count,
  href,
  linkLabel,
  tone,
  icon: Icon,
}: {
  title: string;
  count: number;
  href: string;
  linkLabel: string;
  tone: 'gold' | 'red';
  icon: React.ElementType;
}) {
  const styles = tone === 'gold'
    ? 'border-[var(--color-brand-gold)]/30 bg-[#FBF6E9]'
    : 'border-red-200 bg-red-50';
  const iconBg = tone === 'gold' ? 'bg-[var(--color-brand-gold)]/20 text-[#7A5A12]' : 'bg-red-100 text-red-600';
  const countColor = tone === 'gold' ? 'text-[#7A5A12]' : 'text-red-700';
  const linkColor = tone === 'gold' ? 'text-[#7A5A12] hover:text-[#5C4310]' : 'text-red-600 hover:text-red-800';

  return (
    <div className={cn('flex items-center gap-4 rounded-[18px] border p-4', styles)}>
      <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]', iconBg)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <p className={cn('tabular text-2xl font-extrabold', countColor)}>{count}</p>
      </div>
      <Link href={href} className={cn('flex items-center gap-1 text-sm font-semibold whitespace-nowrap', linkColor)}>
        {linkLabel} <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function AdminDashboardPage() {
  const jobs = useAsyncQuery(() => adminService.listAllJobs(), [], []);
  const users = useAsyncQuery(() => adminService.listUsers(), [], []);
  const reports = useAsyncQuery(() => adminService.listReports(), [], []);
  const userListings = useUserListings();
  const { statusOf } = useListingModeration();
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
    if (!isRestBackendEnabled()) return;
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';
    void (async () => {
      const token = await joymeeTokens.getAccess();
      const res = await fetch(`${base}/admin/reviews/stats`, {
        headers: token ? { authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) setReviewStats((await res.json()) as ReviewStats);
    })();
  }, []);

  const listings = useMemo(
    () => [...userListings, ...DEMO_LISTINGS].filter((l) => statusOf(l.id) !== 'removed'),
    [userListings, statusOf]
  );
  const pendingListings = listings.filter((l) => statusOf(l.id) === 'pending').length;
  const pendingJobs = jobs.data.filter((j) => j.status === 'pending').length;
  const openReports = reports.data.filter((r) => r.status === 'pending').length;

  const saleCount = listings.filter((l) => l.dealType === 'sale').length;
  const rentCount = listings.filter((l) => l.dealType === 'rent').length;
  const dailyRentCount = listings.filter((l) => l.dealType === 'daily').length;
  const totalBreakdown = saleCount + rentCount + dailyRentCount + jobs.data.length;

  const chart = useMemo(() => {
    const days = Array.from({ length: DAYS }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (DAYS - 1 - i));
      return isoDay(d);
    });
    const count = (dates: string[]) => days.map((day) => dates.filter((d) => d === day).length);
    return {
      labels: days.map((d) => `${Number(d.slice(8))}.${d.slice(5, 7)}`),
      series: [
        { label: 'Uy-joy', color: '#1F6B3F', values: count(listings.map((l) => l.postedAt)) },
        { label: 'Vakansiyalar', color: '#D9B25F', values: count(jobs.data.map((j) => j.createdAt.slice(0, 10))) },
      ],
    };
  }, [listings, jobs.data]);

  const pendingItems = useMemo(() => {
    const pending = listings
      .filter((l) => statusOf(l.id) === 'pending')
      .map((l) => ({
        id: l.id,
        href: ROUTES.listing(l.id),
        title: l.title,
        type: l.dealType === 'sale' ? 'Sotuv' : l.dealType === 'rent' ? 'Ijara' : 'Kunlik',
        author: 'Foydalanuvchi',
        image: l.images[0],
        date: l.postedAt,
      }));
    const pendingJobItems = jobs.data
      .filter((j) => j.status === 'pending')
      .map((j) => ({
        id: j.id,
        href: ROUTES.job(j.id),
        title: j.title,
        type: 'Vakansiya',
        author: j.companyName,
        image: undefined as string | undefined,
        date: j.createdAt.slice(0, 10),
      }));
    return [...pending, ...pendingJobItems]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [listings, jobs.data, statusOf]);

  return (
    <>
      <AdminPageHeader title="Dashboard" subtitle="Sayt faoliyati haqida umumiy maʼlumot" />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashStatCard
          label="Jami eʼlonlar"
          value={listings.length + jobs.data.length}
          change="+12%"
          subLabel={`uy-joy ${listings.length} / ish ${jobs.data.length}`}
          icon={FileText}
          tone="blue"
        />
        <DashStatCard
          label="Foydalanuvchilar"
          value={users.data.length}
          change="+8%"
          subLabel={`${users.data.filter((u) => !u.blocked).length} ta faol`}
          icon={Users}
          tone="green"
        />
        <DashStatCard
          label="Uy-joy eʼlonlari"
          value={listings.length}
          change="+5%"
          subLabel={`${pendingListings} tasi tekshiruvda`}
          icon={Home}
          tone="purple"
        />
        <DashStatCard
          label="Ish eʼlonlari"
          value={jobs.data.length}
          change="+3%"
          subLabel={`${pendingJobs} tasi tekshiruvda`}
          icon={Briefcase}
          tone="orange"
        />
      </div>

      {/* Alert cards */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <AlertCard
          title="Moderatsiya navbati"
          count={pendingListings + pendingJobs}
          href="/admin/listings"
          linkLabel="Koʻrib chiqish"
          tone="gold"
          icon={Eye}
        />
        <AlertCard
          title="Ochiq murojaatlar"
          count={openReports}
          href="/admin/reports"
          linkLabel="Hal qilish"
          tone="red"
          icon={MessageSquareWarning}
        />
      </div>

      {/* Chart + breakdown */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Panel title="Kunlik yangi eʼlonlar" action={<span className="text-xs font-medium text-slate-500">Soʻnggi 7 kun</span>}>
          <div className="p-5">
            <BarChart labels={chart.labels} series={chart.series} />
          </div>
        </Panel>

        <Panel title="Eʼlon turlari">
          <div className="space-y-4 p-5">
            <ProgressBar label="Sotuv" value={saleCount} max={totalBreakdown} color="#1F6B3F" />
            <ProgressBar label="Ijara" value={rentCount} max={totalBreakdown} color="#2E8B57" />
            <ProgressBar label="Kunlik ijara" value={dailyRentCount} max={totalBreakdown} color="#60A88A" />
            <ProgressBar label="Vakansiyalar" value={jobs.data.length} max={totalBreakdown} color="#D9B25F" />
          </div>
        </Panel>
      </div>

      {/* Moderation pending table */}
      <div className="mt-6">
        <Panel title="Moderatsiya kutilmoqda" action={
          <Link href="/admin/listings" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
            Hammasini koʻrish
          </Link>
        }>
          {pendingItems.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">Moderatsiya kutayotgan eʼlon yoʻq</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">Eʼlon</th>
                    <th className="px-4 py-3">Turi</th>
                    <th className="px-4 py-3">Muallif</th>
                    <th className="px-4 py-3">Sana</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {pendingItems.map((item) => (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                            {item.image ? (
                              <Image src={item.image} alt="" fill sizes="40px" className="object-cover" />
                            ) : (
                              <Briefcase className="h-4 w-4 text-slate-400" />
                            )}
                          </span>
                          <span className="truncate font-medium text-slate-900">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={item.type === 'Vakansiya' ? 'orange' : 'green'}>{item.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.author}</td>
                      <td className="px-4 py-3 text-slate-500">{item.date}</td>
                      <td className="px-4 py-3">
                        <Link href={item.href} target="_blank" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                          Koʻrish
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {/* Review stats */}
      {reviewStats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-5">
            <p className="text-sm font-medium text-[var(--color-muted)]">Jami sharhlar</p>
            <p className="mt-1 tabular text-[28px] font-extrabold text-[var(--color-secondary)]">{reviewStats.total}</p>
          </div>
          <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-5">
            <p className="text-sm font-medium text-[var(--color-muted)]">Oʻrtacha reyting</p>
            <p className="mt-1 tabular text-[28px] font-extrabold text-[var(--color-secondary)]">{(Math.round(reviewStats.avg * 10) / 10).toFixed(1)}</p>
          </div>
          <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-5">
            <p className="text-sm font-medium text-[var(--color-muted)]">Soʻnggi 7 kun</p>
            <p className="mt-1 tabular text-[28px] font-extrabold text-[var(--color-secondary)]">{reviewStats.last7}</p>
          </div>
        </div>
      )}
    </>
  );
}
