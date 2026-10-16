'use client';

import React from 'react';
import type {
  JobSearchParams,
  WorkTypeFilter,
  ScheduleFilter,
} from '@/types';
import { cn } from '@/lib/utils';
import { Select } from '@/components/ui/Select';
import {
  WORK_TYPE_FILTER_OPTIONS,
  SCHEDULE_FILTER_OPTIONS,
  SALARY_RANGE_OPTIONS,
} from '@/lib/filters/job-search';
import type { Category } from '@/types';

export interface SearchFiltersPanelProps {
  params: JobSearchParams;
  categories: Category[];
  locations: { value: string; label: string }[];
  onCategoryChange: (categoryId: string) => void;
  onLocationChange: (location: string) => void;
  onSalaryRangeChange: (min?: number, max?: number) => void;
  onWorkTypeToggle: (workType: WorkTypeFilter) => void;
  onScheduleToggle: (schedule: ScheduleFilter) => void;
  onClear: () => void;
  className?: string;
  compact?: boolean;
}

function ChipGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { id: T; label: string }[];
  selected: T[];
  onToggle: (id: T) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2.5">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggle(opt.id)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'bg-gray-50 text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40'
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SearchFiltersPanel({
  params,
  categories,
  locations,
  onCategoryChange,
  onLocationChange,
  onSalaryRangeChange,
  onWorkTypeToggle,
  onScheduleToggle,
  onClear,
  className,
  compact = false,
}: SearchFiltersPanelProps) {
  const categoryOptions = [
    { value: 'all', label: 'Barcha kategoriyalar' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const locationOptions = locations.map((l) => ({ value: l.value, label: l.label }));

  const activeSalaryId =
    SALARY_RANGE_OPTIONS.find(
      (r) => r.min === (params.salaryMin ?? 0) && r.max === (params.salaryMax ?? Infinity)
    )?.id ?? 'any';

  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex items-center justify-between">
        <h3 className={cn('font-bold text-[var(--color-secondary)]', compact ? 'text-base' : 'text-sm')}>
          Filtrlar
        </h3>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
        >
          Tozalash
        </button>
      </div>

      <Select
        label="Kategoriya"
        options={categoryOptions}
        value={params.categoryId ?? 'all'}
        onChange={(e) => onCategoryChange(e.target.value)}
      />

      <Select
        label="Joylashuv"
        options={locationOptions}
        value={params.location ?? 'all'}
        onChange={(e) => onLocationChange(e.target.value)}
      />

      <Select
        label="Maosh (oylik)"
        options={SALARY_RANGE_OPTIONS.map((r) => ({ value: r.id, label: r.label }))}
        value={activeSalaryId}
        onChange={(e) => {
          const range = SALARY_RANGE_OPTIONS.find((r) => r.id === e.target.value);
          if (!range || range.id === 'any') {
            onSalaryRangeChange(undefined, undefined);
          } else {
            onSalaryRangeChange(range.min, range.max);
          }
        }}
      />

      <ChipGroup
        label="Ish turi"
        options={WORK_TYPE_FILTER_OPTIONS}
        selected={params.workTypes ?? []}
        onToggle={onWorkTypeToggle}
      />

      <ChipGroup
        label="Jadval"
        options={SCHEDULE_FILTER_OPTIONS}
        selected={params.schedules ?? []}
        onToggle={onScheduleToggle}
      />
    </div>
  );
}
