'use client';

import Link from 'next/link';
import { FileText, ChevronRight, MapPin } from 'lucide-react';
import { useApplications } from '@/context/ApplicationsContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { JobListSkeleton } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import { APPLICATION_STATUS_LABELS, type ApplicationStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  reviewing: 'bg-blue-50 text-blue-700',
  shortlisted: 'bg-violet-50 text-violet-700',
  accepted: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-600',
  withdrawn: 'bg-gray-100 text-gray-500',
};

export function ApplicationsContent() {
  const { myApplications, isLoading } = useApplications();

  return (
    <div className="page-container">
      <PageHeader
        title="Mening arizalarim"
        subtitle={`${myApplications.length} ta ariza yuborilgan`}
      />

      {isLoading ? (
        <JobListSkeleton count={3} />
      ) : myApplications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Hali ariza yoʻq"
          description="Yoqqan ishga ariza yuboring — u shu yerda koʻrinadi."
          action={
            <Link href="/search">
              <Button>Ishlarni koʻrish</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {myApplications.map((app) => (
            <Link
              key={app.id}
              href={`/job/${app.jobId}`}
              className="card card-hover flex items-center gap-3 p-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-[var(--color-secondary)]">
                  {app.jobTitle ?? 'Ish'}
                </h3>
                <p className="text-xs text-[var(--color-muted)]">
                  {new Date(app.createdAt).toLocaleDateString('uz-UZ')}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold',
                  STATUS_STYLES[app.status]
                )}
              >
                {APPLICATION_STATUS_LABELS[app.status]}
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-[var(--color-muted)]" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
