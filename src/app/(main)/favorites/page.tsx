'use client';

import React from 'react';
import Link from 'next/link';
import { JobCard } from '@/components/jobs/JobCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { JobListSkeleton } from '@/components/ui/LoadingState';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { useFavorites } from '@/context/FavoritesContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { Bookmark } from 'lucide-react';

export default function FavoritesPage() {
  useScrollRestore();
  const { savedJobs, isLoading, error, refresh, isHydrated } = useFavorites();

  return (
    <RequireAuth>
    <div className="page-container">
      <PageHeader
        title="Saqlangan ishlar"
        onRefresh={refresh}
        subtitle={
          savedJobs.length > 0
            ? `${savedJobs.length} ta ish saqlangan.`
            : 'Belgilangan ishlar shu yerda koʻrinadi.'
        }
      />

      <QueryErrorBanner message={error} onRetry={refresh} className="mb-4" />

      {!isHydrated || isLoading ? (
        <JobListSkeleton count={4} />
      ) : savedJobs.length > 0 ? (
        <div className="flex flex-col gap-3 sm:gap-4">
          {savedJobs.map((job, index) => (
            <JobCard key={job.id} job={job} index={index} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="Hali saqlangan ish yoʻq"
          description="Istalgan ishdagi belgi tugmasini bosib, uni shu yerga saqlang."
          action={
            <Link href="/search">
              <Button>Ishlarni koʻrish</Button>
            </Link>
          }
        />
      )}
    </div>
    </RequireAuth>
  );
}
