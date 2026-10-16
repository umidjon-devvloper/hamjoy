'use client';

import { useCallback, useMemo, useState } from 'react';
import type {
  JobSearchParams,
  JobListItem,
  WorkTypeFilter,
  ScheduleFilter,
  JobSortOption,
  SearchViewMode,
} from '@/types';
import { jobsService, mapService } from '@/services';
import { categoriesService } from '@/services';
import { useFavorites } from '@/context/FavoritesContext';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import {
  DEFAULT_SEARCH_PARAMS,
  countActiveFilters,
} from '@/lib/filters/job-search';

export function useJobSearch(initialCategorySlug?: string, initialQuery?: string) {
  const { favoriteIds } = useFavorites();

  const categoriesQuery = useAsyncQuery(
    () => categoriesService.listCategoriesAsync(),
    [],
    []
  );

  const initialCategory = useMemo(() => {
    if (!initialCategorySlug) return undefined;
    return categoriesQuery.data.find(
      (c) =>
        c.slug === initialCategorySlug ||
        c.name.toLowerCase() === initialCategorySlug.toLowerCase()
    );
  }, [categoriesQuery.data, initialCategorySlug]);

  const [params, setParams] = useState<JobSearchParams>({
    ...DEFAULT_SEARCH_PARAMS,
    query: initialQuery ?? DEFAULT_SEARCH_PARAMS.query,
    categoryId: initialCategory?.id,
  });

  // Categories load async, so `initialCategory` is undefined on the first render.
  // Apply the `?category=` slug once it resolves (state adjustment during render).
  const [appliedCategorySlug, setAppliedCategorySlug] = useState<string | undefined>(
    initialCategory ? initialCategorySlug : undefined
  );
  if (initialCategory && appliedCategorySlug !== initialCategorySlug) {
    setAppliedCategorySlug(initialCategorySlug);
    setParams((p) => ({ ...p, categoryId: initialCategory.id }));
  }

  const [viewMode, setViewMode] = useState<SearchViewMode>('list');

  const jobsQuery = useAsyncQuery(
    () => jobsService.search(favoriteIds, params),
    [favoriteIds, params],
    [] as JobListItem[]
  );

  const facetsQuery = useAsyncQuery(() => jobsService.getSearchFacets(), [jobsQuery.data.length], {
    locations: [{ value: 'all', label: 'Barcha joylashuvlar' }],
  });

  const mapMarkers = useMemo(
    () => mapService.getMarkersForJobIds(jobsQuery.data.map((j) => j.id)),
    [jobsQuery.data]
  );

  const activeFilterCount = countActiveFilters(params);

  const setQuery = useCallback((query: string) => {
    setParams((p) => ({ ...p, query }));
  }, []);

  const setSort = useCallback((sort: JobSortOption) => {
    setParams((p) => ({ ...p, sort }));
  }, []);

  const setCategory = useCallback((categoryId: string) => {
    setParams((p) => ({
      ...p,
      categoryId: categoryId === 'all' ? undefined : categoryId,
    }));
  }, []);

  const setLocation = useCallback((location: string) => {
    setParams((p) => ({
      ...p,
      location: location === 'all' ? undefined : location,
    }));
  }, []);

  const setSalaryRange = useCallback((salaryMin?: number, salaryMax?: number) => {
    setParams((p) => ({
      ...p,
      salaryMin,
      salaryMax,
    }));
  }, []);

  const toggleWorkType = useCallback((workType: WorkTypeFilter) => {
    setParams((p) => {
      const current = p.workTypes ?? [];
      const next = current.includes(workType)
        ? current.filter((w) => w !== workType)
        : [...current, workType];
      return { ...p, workTypes: next };
    });
  }, []);

  const toggleSchedule = useCallback((schedule: ScheduleFilter) => {
    setParams((p) => {
      const current = p.schedules ?? [];
      const next = current.includes(schedule)
        ? current.filter((s) => s !== schedule)
        : [...current, schedule];
      return { ...p, schedules: next };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setParams({ ...DEFAULT_SEARCH_PARAMS });
  }, []);

  const replaceParams = useCallback((next: JobSearchParams) => {
    setParams((p) => ({ ...p, ...next }));
  }, []);

  return {
    jobs: jobsQuery.data,
    isLoading: jobsQuery.isLoading || categoriesQuery.isLoading,
    error: jobsQuery.error ?? categoriesQuery.error,
    params,
    viewMode,
    setViewMode,
    categories: categoriesQuery.data,
    locations: facetsQuery.data.locations,
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
    refetch: jobsQuery.refetch,
  };
}
