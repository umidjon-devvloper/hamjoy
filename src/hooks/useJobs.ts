'use client';

import { useFavorites } from '@/context/FavoritesContext';
import type { JobFilters, JobListItem, JobSearchParams, MapCoordinates } from '@/types';
import { jobsService } from '@/services';
import { useAsyncQuery } from './useAsyncQuery';

export function useNearbyJobs(center: MapCoordinates | null, radiusKm = 15) {
  const { favoriteIds } = useFavorites();

  return useAsyncQuery(
    () =>
      center
        ? jobsService.getNearbyJobs(favoriteIds, center, radiusKm)
        : Promise.resolve([] as JobListItem[]),
    [favoriteIds, center?.lat, center?.lng, radiusKm],
    [] as JobListItem[]
  );
}

export function useJobs(filters: JobFilters | JobSearchParams = {}) {
  const { favoriteIds } = useFavorites();
  // Callers often pass inline objects (`useJobs({})`); depending on the object
  // identity would refetch after every render and loop forever. Key by value.
  const filtersKey = JSON.stringify(filters);

  return useAsyncQuery(
    () => jobsService.searchJobs(favoriteIds, filters),
    [favoriteIds, filtersKey],
    [] as JobListItem[]
  );
}

export function useJobCount(filters: JobFilters = {}) {
  const filtersKey = JSON.stringify(filters);
  return useAsyncQuery(() => jobsService.countJobs(filters), [filtersKey], 0);
}

export function useFeaturedJobs(limit = 2) {
  const { favoriteIds } = useFavorites();

  return useAsyncQuery(
    () => jobsService.getFeaturedJobs(favoriteIds, limit),
    [favoriteIds, limit],
    [] as JobListItem[]
  );
}

export function useRecentJobs(limit = 4) {
  const { favoriteIds } = useFavorites();

  return useAsyncQuery(
    () => jobsService.getRecentJobs(favoriteIds, limit),
    [favoriteIds, limit],
    [] as JobListItem[]
  );
}
