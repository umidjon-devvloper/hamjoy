'use client';

import React from 'react';
import { List, Map, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select } from '@/components/ui/Select';
import { SORT_OPTIONS } from '@/lib/filters/job-search';
import type { JobSortOption, SearchViewMode } from '@/types';

export interface SearchToolbarProps {
  resultCount: number;
  sort: JobSortOption;
  viewMode: SearchViewMode;
  activeFilterCount: number;
  onSortChange: (sort: JobSortOption) => void;
  onViewModeChange: (mode: SearchViewMode) => void;
  onOpenFilters?: () => void;
}

export function SearchToolbar({
  resultCount,
  sort,
  viewMode,
  activeFilterCount,
  onSortChange,
  onViewModeChange,
  onOpenFilters,
}: SearchToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <p className="text-sm text-[var(--color-muted)]">
        <span className="font-semibold text-[var(--color-secondary)]">{resultCount}</span> ta ish
        topildi
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-white text-sm font-medium text-[var(--color-secondary)] hover:border-[var(--color-primary)]/40 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtrlar
            {activeFilterCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        <div className="w-40">
          <Select
            options={SORT_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
            value={sort}
            onChange={(e) => onSortChange(e.target.value as JobSortOption)}
            aria-label="Sort jobs"
          />
        </div>

        <div className="flex rounded-xl border border-[var(--color-border)] bg-white p-1">
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              viewMode === 'list'
                ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-secondary)]'
            )}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Roʻyxat</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('map')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              viewMode === 'map'
                ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-secondary)]'
            )}
            aria-label="Map view"
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Xarita</span>
          </button>
        </div>
      </div>
    </div>
  );
}
