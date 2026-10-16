'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Briefcase, FileText, Home, Users } from 'lucide-react';
import { AdminPageHeader, LineChart, Panel, StatCard } from '@/components/admin/ui';
import { adminService } from '@/services/admin.service';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { DEMO_LISTINGS } from '@/data/listings';
import { useUserListings } from '@/lib/listings/user-listings';
import { useListingModeration } from '@/lib/listings/moderation';
import { formatListingPrice } from '@/lib/listings/format';
import { ROUTES } from '@/lib/navigation/routes';

const DAYS = 7;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export default function AdminDashboardPage() {
  const jobs = useAsyncQuery(() => adminService.listAllJobs(), [], []);
  const users = useAsyncQuery(() => adminService.listUsers(), [], []);
  const reports = useAsyncQuery(() => adminService.listReports(), [], []);
  const userListings = useUserListings();
  const { statusOf } = useListingModeration();

  const listings = useMemo(
    () => [...userListings, ...DEMO_LISTINGS].filter((l) => statusOf(l.id) !== 'removed'),
    [userListings, statusOf]
  );
  const pendingListings = listings.filter((l) => statusOf(l.id) === 'pending').length;
  const pendingJobs = jobs.data.filter((j) => j.status === 'pending').length;
  const openReports = reports.data.filter((r) => r.status === 'pending').length;

  // Posts per day for the last week, by type.
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
        { label: 'Uy-joy', color: '#2563EB', values: count(listings.map((l) => l.postedAt)) },
        { label: 'Ish', color: '#7C3AED', values: count(jobs.data.map((j) => j.createdAt.slice(0, 10))) },
      ],
    };
  }, [listings, jobs.data]);

  const recent = useMemo(
    () =>
      [
        ...listings.map((l) => ({
          id: `l-${l.id}`,
          href: ROUTES.listing(l.id),
          title: l.title,
          meta: `Uy-joy · ${formatListingPrice(l)}`,
          image: l.images[0],
          date: l.postedAt,
        })),
        ...jobs.data.map((j) => ({
          id: `j-${j.id}`,
          href: ROUTES.job(j.id),
          title: j.title,
          meta: `Ish · ${j.companyName}`,
          image: undefined,
          date: j.createdAt.slice(0, 10),
        })),
      ]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6),
    [listings, jobs.data]
  );

  return (
    <>
      <AdminPageHeader title="Dashboard" subtitle="Sayt faoliyati haqida umumiy maʼlumot" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Jami eʼlonlar" value={listings.length + jobs.data.length} icon={FileText} tone="blue" hint={`${pendingListings + pendingJobs} tasi tekshiruvda`} />
        <StatCard label="Uy-joy eʼlonlari" value={listings.length} icon={Home} tone="green" hint={`${pendingListings} tasi tekshiruvda`} />
        <StatCard label="Ish eʼlonlari" value={jobs.data.length} icon={Briefcase} tone="purple" hint={`${pendingJobs} tasi tekshiruvda`} />
        <StatCard label="Foydalanuvchilar" value={users.data.length} icon={Users} tone="orange" hint={`${openReports} ta yangi murojaat`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Panel title="Eʼlonlar statistikasi" action={<span className="text-xs font-medium text-slate-500">Soʻnggi 7 kun</span>}>
          <div className="p-5">
            <LineChart labels={chart.labels} series={chart.series} />
          </div>
        </Panel>

        <Panel title="Soʻnggi eʼlonlar">
          <ul className="divide-y divide-slate-100">
            {recent.map((item) => (
              <li key={item.id}>
                <Link href={item.href} target="_blank" className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-violet-50 text-violet-600">
                    {item.image ? <Image src={item.image} alt="" fill sizes="44px" className="object-cover" /> : <Briefcase className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{item.title}</span>
                    <span className="block truncate text-xs text-slate-500">{item.meta}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">{item.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
