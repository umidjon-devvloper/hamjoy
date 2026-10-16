import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-2xl', className)}
      aria-hidden
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex gap-4">
        <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-7 w-20 rounded-xl" />
        <Skeleton className="h-7 w-16 rounded-xl" />
        <Skeleton className="h-7 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export interface JobListSkeletonProps {
  count?: number;
}

export function JobListSkeleton({ count = 3 }: JobListSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="min-w-[88px] h-[96px] rounded-2xl shrink-0" />
      ))}
    </div>
  );
}

export function ChatListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="page-container space-y-3">
      <Skeleton className="h-8 w-40" />
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function ChatThreadSkeleton() {
  return (
    <div className="flex flex-col h-dvh bg-[var(--color-background)]">
      <div className="border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <Skeleton className="h-12 w-2/3 rounded-2xl ml-auto" />
        <Skeleton className="h-10 w-1/2 rounded-2xl" />
        <Skeleton className="h-14 w-3/4 rounded-2xl ml-auto" />
        <Skeleton className="h-10 w-2/5 rounded-2xl" />
      </div>
      <div className="border-t border-[var(--color-border)] p-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function JobDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-28">
      <div className="page-container pt-4 space-y-6">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <div className="card p-6 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-6 w-40" />
        <JobListSkeleton count={2} />
      </div>
    </div>
  );
}

export function AuthGateSkeleton() {
  return (
    <div className="page-container min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <Skeleton className="h-4 w-36" />
    </div>
  );
}

export interface PageLoadingStateProps {
  showBanner?: boolean;
}

export function PageLoadingState({ showBanner = true }: PageLoadingStateProps) {
  return (
    <div className="page-container">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>

      <Skeleton className="h-14 w-full rounded-2xl mb-8" />
      {showBanner && <Skeleton className="h-32 w-full rounded-2xl mb-8" />}

      <Skeleton className="h-6 w-36 mb-4" />
      <JobListSkeleton count={2} />

      <Skeleton className="h-6 w-28 mt-8 mb-4" />
      <CategorySkeleton />

      <Skeleton className="h-6 w-32 mt-8 mb-4" />
      <JobListSkeleton count={2} />
    </div>
  );
}

// Alias for backward compatibility within the codebase
export { PageLoadingState as LoadingState };
