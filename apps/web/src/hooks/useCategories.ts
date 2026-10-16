'use client';

import { categoriesService } from '@/services';
import { useAsyncQuery } from './useAsyncQuery';
import type { Category } from '@/types';

export function useCategories() {
  return useAsyncQuery(
    () => categoriesService.listCategoriesAsync(),
    [],
    [] as Category[]
  );
}
