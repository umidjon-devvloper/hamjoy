'use client';

import React from 'react';
import { CategoryCard } from '@/components/jobs/CategoryCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { JobListSkeleton } from '@/components/ui/LoadingState';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { useCategories } from '@/hooks/useCategories';

export default function CategoriesPage() {
  const { data: categories, isLoading, error, refetch } = useCategories();

  return (
    <div className="page-container">
      <PageHeader title="Kategoriyalar" subtitle="Sohangiz boʻyicha ishlarni koʻring." />

      <QueryErrorBanner message={error} onRetry={refetch} className="mb-4" />

      {isLoading ? (
        <JobListSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} className="w-full" />
          ))}
        </div>
      )}
    </div>
  );
}
