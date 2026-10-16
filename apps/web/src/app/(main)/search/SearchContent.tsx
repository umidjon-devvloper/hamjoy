'use client';

import React, { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { JobCard } from '@/components/jobs/JobCard';
import { SearchBar } from '@/components/jobs/SearchBar';
import { FilterDrawer } from '@/components/jobs/FilterDrawer';
import { SearchFilterSidebar } from '@/components/jobs/SearchFilterSidebar';
import { SearchToolbar } from '@/components/jobs/SearchToolbar';
import { PageHeader } from '@/components/ui/PageHeader';
import { JobListSkeleton } from '@/components/ui/LoadingState';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { MapPreview } from '@/components/map/MapPreview';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useJobSearch } from '@/hooks/useJobSearch';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Search } from 'lucide-react';
import { WORK_TYPE_FILTER_OPTIONS } from '@/lib/filters/job-search';
import { cn } from '@/lib/utils';

export default function SearchContent() {
  useScrollRestore();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') ?? undefined;
  const queryParam = searchParams.get('q') ?? undefined;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    jobs,
    isLoading,
    error,
    params,
    viewMode,
    setViewMode,
    categories,
    locations,
    mapMarkers,
    activeFilterCount,
    setQuery,
    setSort,
    setCategory,
    setLocation,
    setSalaryRange,
    toggleWorkType,
    toggleSchedule,
    clearFilters,
    replaceParams,
    refetch,
  } = useJobSearch(categoryParam, queryParam);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  usePullToRefresh(handleRefresh);

  const filterPanelProps = {
    params,
    categories,
    locations,
    onCategoryChange: setCategory,
    onLocationChange: setLocation,
    onSalaryRangeChange: setSalaryRange,
    onWorkTypeToggle: toggleWorkType,
    onScheduleToggle: toggleSchedule,
    onClear: clearFilters,
  };

  return (
    <div className="page-container lg:max-w-6xl">
      <PageHeader
        title="Ish qidirish"
        subtitle="Koʻnikmalaringizga mos ishni toping"
        onRefresh={handleRefresh}
      />

      <div className="mb-5">
        <SearchBar
          value={params.query ?? ''}
          onChange={setQuery}
          placeholder="Ish nomi boʻyicha qidiring..."
        />
      </div>

      {/* Quick work-type chips — mobile & tablet */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-5 pb-1 lg:hidden -mx-1 px-1">
        {WORK_TYPE_FILTER_OPTIONS.map((opt) => {
          const isActive = params.workTypes?.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleWorkType(opt.id)}
              className={cn(
                'whitespace-nowrap px-3.5 py-2 rounded-full text-sm font-medium transition-all shrink-0',
                isActive
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'bg-white text-[var(--color-muted)] border border-[var(--color-border)]'
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-6 lg:gap-8 items-start">
        <SearchFilterSidebar {...filterPanelProps} />

        <div className="flex-1 min-w-0">
          <SearchToolbar
            resultCount={jobs.length}
            sort={params.sort ?? 'newest'}
            viewMode={viewMode}
            activeFilterCount={activeFilterCount}
            onSortChange={setSort}
            onViewModeChange={setViewMode}
            onOpenFilters={onOpen}
          />

          <QueryErrorBanner message={error} onRetry={refetch} />

          {isLoading ? (
            <JobListSkeleton count={6} />
          ) : viewMode === 'list' ? (
            jobs.length > 0 ? (
              <div className="flex flex-col gap-3 sm:gap-4">
                {jobs.map((job, index) => (
                  <JobCard key={job.id} job={job} index={index} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Search}
                title="Ish topilmadi"
                description="Qidiruv yoki filtrlarni oʻzgartirib koʻring."
              />
            )
          ) : (
            <MapPreview
              markers={mapMarkers}
              jobCount={jobs.length}
              title="Topilgan ishlar"
              className="min-h-[480px] h-[calc(100dvh-16rem)]"
            />
          )}
        </div>
      </div>

      <FilterDrawer
        isOpen={isOpen}
        onClose={onClose}
        onApply={replaceParams}
        resultCount={jobs.length}
        {...filterPanelProps}
      />
    </div>
  );
}
