'use client';

import { jobsService } from '@/services';
import { usersService } from '@/services';
import { useFavorites } from '@/context/FavoritesContext';
import { useAsyncQuery } from './useAsyncQuery';

export function useMyJobPosts() {
  const { favoriteIds } = useFavorites();
  const currentUser = usersService.getCurrentUser();

  const jobsQuery = useAsyncQuery(
    () => jobsService.getMyJobPosts(currentUser.id, favoriteIds),
    [currentUser.id, favoriteIds],
    []
  );

  return {
    jobs: jobsQuery.data,
    currentUser,
    isLoading: jobsQuery.isLoading,
    error: jobsQuery.error,
    refetch: jobsQuery.refetch,
  };
}
