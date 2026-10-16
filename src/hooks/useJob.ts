'use client';

import { jobsService } from '@/services';
import { useFavorites } from '@/context/FavoritesContext';
import { useAsyncQuery } from './useAsyncQuery';

export function useJob(jobId: string) {
  const { favoriteIds } = useFavorites();

  const jobQuery = useAsyncQuery(
    () => jobsService.getJobDetail(jobId, favoriteIds).then((j) => j ?? null),
    [jobId, favoriteIds],
    null
  );

  const similarQuery = useAsyncQuery(
    () => jobsService.getSimilarJobs(jobId, favoriteIds, 3),
    [jobId, favoriteIds],
    []
  );

  const rawQuery = useAsyncQuery(
    () => jobsService.getByIdAsync(jobId).then((j) => j ?? null),
    [jobId],
    null
  );

  return {
    job: jobQuery.data ?? undefined,
    similarJobs: similarQuery.data,
    rawJob: rawQuery.data ?? undefined,
    isLoading: jobQuery.isLoading || rawQuery.isLoading,
    error: jobQuery.error ?? rawQuery.error,
    refetch: jobQuery.refetch,
  };
}
