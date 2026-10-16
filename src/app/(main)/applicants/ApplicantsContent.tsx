'use client';

import { useEffect, useState } from 'react';
import { Users, Check, X, Star } from 'lucide-react';
import { applicationsService } from '@/services/applications.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { JobListSkeleton } from '@/components/ui/LoadingState';
import { appToast } from '@/lib/feedback/toast';
import {
  APPLICATION_STATUS_LABELS,
  type Application,
  type ApplicationStatus,
} from '@/types';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  reviewing: 'bg-blue-50 text-blue-700',
  shortlisted: 'bg-violet-50 text-violet-700',
  accepted: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-600',
  withdrawn: 'bg-gray-100 text-gray-500',
};

export function ApplicantsContent() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await applicationsService.getApplicantsForMyJobs();
        if (!cancelled) setApps(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function setStatus(id: string, status: ApplicationStatus) {
    const prev = apps;
    setApps((cur) => cur.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      await applicationsService.updateStatus(id, status);
      appToast.success('Holat yangilandi');
    } catch (err) {
      setApps(prev);
      appToast.error(err, 'Holatni yangilab boʻlmadi');
    }
  }

  return (
    <div className="page-container">
      <PageHeader title="Nomzodlar" subtitle={`${apps.length} ta ariza qabul qilindi`} />

      {loading ? (
        <JobListSkeleton count={3} />
      ) : apps.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Hali nomzod yoʻq"
          description="Eʼlonlaringizga kelgan arizalar shu yerda koʻrinadi."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {apps.map((a) => (
            <div key={a.id} className="card p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-base font-bold text-white">
                  {(a.applicantName ?? 'N')[0].toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-semibold text-[var(--color-secondary)]">
                      {a.applicantName ?? 'Nomzod'}
                    </h3>
                    <span
                      className={cn(
                        'shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold',
                        STATUS_STYLES[a.status]
                      )}
                    >
                      {APPLICATION_STATUS_LABELS[a.status]}
                    </span>
                  </div>
                  <p className="truncate text-xs text-[var(--color-muted)]">{a.jobTitle}</p>
                  {a.coverNote && (
                    <p className="mt-2 rounded-lg bg-gray-50 p-2.5 text-sm text-[var(--color-muted)]">
                      {a.coverNote}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus(a.id, 'shortlisted')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-violet-50 py-2 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100"
                >
                  <Star className="h-4 w-4" /> Saralash
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(a.id, 'accepted')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <Check className="h-4 w-4" /> Qabul
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(a.id, 'rejected')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  <X className="h-4 w-4" /> Rad
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
