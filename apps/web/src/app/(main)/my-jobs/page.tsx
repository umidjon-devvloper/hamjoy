'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { JobCard } from '@/components/jobs/JobCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { JobListSkeleton } from '@/components/ui/LoadingState';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useMyJobPosts } from '@/hooks/useMyJobs';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { Briefcase, CheckCircle2, Pencil, RotateCcw, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { joymeeTokens } from '@/lib/joymee/client';
import { isRestBackendEnabled } from '@/lib/api/config';
import { JOB_STATUS_LABELS } from '@/types';
import { jobsService } from '@/services';
import { appToast } from '@/lib/feedback/toast';
import { cn } from '@/lib/utils';

export default function MyJobsPage() {
  useScrollRestore();
  const { jobs, isLoading, error, refetch } = useMyJobPosts();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await jobsService.deleteJob(id);
      appToast.success('Eʼlon oʻchirildi');
      setConfirmId(null);
      await refetch();
    } catch (err) {
      appToast.error(err, 'Oʻchirib boʻlmadi');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBuyTop = async (id: string) => {
    if (!isRestBackendEnabled()) {
      appToast.info?.('Mock rejimda pullik top mavjud emas');
      return;
    }
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';
    const token = await joymeeTokens.getAccess();
    const res = await fetch(`${base}/promotions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ listingId: id, tier: 'gold' }),
    });
    if (!res.ok) {
      appToast.error(new Error(`${res.status}`), "Top sotib bo'lmadi");
      return;
    }
    const row = (await res.json()) as { tier: string; expiresAt: string };
    appToast.success(`${row.tier.toUpperCase()} TOP — ${new Date(row.expiresAt).toLocaleDateString('uz-UZ')} gacha`);
    await refetch();
  };

  const handleToggleSold = async (id: string, isClosed: boolean) => {
    setTogglingId(id);
    try {
      if (isClosed) {
        await jobsService.reopen(id);
        appToast.success('Eʼlon qayta ochildi');
      } else {
        await jobsService.markSold(id);
        appToast.success('Eʼlon “Sotildi” deb belgilandi');
      }
      await refetch();
    } catch (err) {
      appToast.error(err, 'Amal bajarilmadi');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <RequireAuth>
      <div className="page-container">
        <PageHeader
          title="Mening eʼlonlarim"
          onRefresh={refetch}
          subtitle={
            jobs.length > 0
              ? `${jobs.length} ta eʼlon joylangan.`
              : 'Siz joylagan ishlar shu yerda koʻrinadi.'
          }
        />

        <QueryErrorBanner message={error} onRetry={refetch} className="mb-4" />

        {isLoading ? (
          <JobListSkeleton count={3} />
        ) : jobs.length > 0 ? (
          <div className="flex flex-col gap-3 sm:gap-4">
            {jobs.map((job, index) => (
              <div key={job.id} className="relative">
                <span
                  className={cn(
                    'absolute top-4 left-4 z-10 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md',
                    job.status === 'active' && 'bg-[var(--color-success-light)] text-[var(--color-success)]',
                    job.status === 'pending' && 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
                    job.status === 'draft' && 'bg-gray-100 text-[var(--color-muted)]',
                    job.status === 'closed' && 'bg-red-50 text-red-500'
                  )}
                >
                  {JOB_STATUS_LABELS[job.status]}
                </span>

                <JobCard job={job} index={index} />

                {/* Owner actions */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link href={`/create?edit=${job.id}`} className="flex-1 min-w-[120px]">
                    <span className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white py-2.5 text-sm font-semibold text-[var(--color-secondary)] transition-colors hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)]">
                      <Pencil className="h-4 w-4" />
                      Tahrirlash
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleBuyTop(job.id)}
                    className="flex flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-xl border border-[#c7a052]/40 bg-gradient-to-r from-[#fff8e8] to-white py-2.5 text-sm font-semibold text-[#8a6b1f] transition-colors hover:border-[#c7a052]"
                  >
                    <Sparkles className="h-4 w-4" />
                    Top (Gold)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleSold(job.id, job.status === 'closed')}
                    disabled={togglingId === job.id}
                    className={cn(
                      'flex flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition-colors disabled:opacity-60',
                      job.status === 'closed'
                        ? 'border-[var(--color-border)] bg-white text-[var(--color-secondary)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)]'
                        : 'border-[#c73a7f]/30 bg-[#c73a7f]/5 text-[#c73a7f] hover:bg-[#c73a7f]/10'
                    )}
                  >
                    {togglingId === job.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : job.status === 'closed' ? (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        Qayta ochish
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Sotildi
                      </>
                    )}
                  </button>

                  {confirmId === job.id ? (
                    <div className="flex flex-[1.4] gap-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(job.id)}
                        disabled={deletingId === job.id}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                      >
                        {deletingId === job.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Ha, oʻchir
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="flex-1 rounded-xl border border-[var(--color-border)] bg-white py-2.5 text-sm font-semibold text-[var(--color-muted)] hover:bg-gray-50"
                      >
                        Yoʻq
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(job.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Oʻchirish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="Hali eʼlon yoʻq"
            description="Birinchi eʼloningizni joylang va arizalar qabul qilishni boshlang."
            action={
              <Link href="/create">
                <Button variant="accent">Ish joylash</Button>
              </Link>
            }
          />
        )}
      </div>
    </RequireAuth>
  );
}
