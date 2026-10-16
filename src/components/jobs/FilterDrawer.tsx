'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { JobSearchParams } from '@/types';
import { Button } from '@/components/ui/Button';
import { SearchFiltersPanel, type SearchFiltersPanelProps } from './SearchFiltersPanel';

export interface FilterDrawerProps extends Omit<SearchFiltersPanelProps, 'params'> {
  isOpen: boolean;
  onClose: () => void;
  params: JobSearchParams;
  onApply: (params: JobSearchParams) => void;
  resultCount: number;
  title?: string;
}

function FilterDrawerPanel({
  params,
  onClose,
  onApply,
  resultCount,
  title,
  ...filterProps
}: Omit<FilterDrawerProps, 'isOpen'>) {
  const [draft, setDraft] = useState(params);

  const draftProps: SearchFiltersPanelProps = {
    ...filterProps,
    params: draft,
    compact: true,
    onCategoryChange: (id) =>
      setDraft((p) => ({ ...p, categoryId: id === 'all' ? undefined : id })),
    onLocationChange: (loc) =>
      setDraft((p) => ({ ...p, location: loc === 'all' ? undefined : loc })),
    onSalaryRangeChange: (min, max) =>
      setDraft((p) => ({ ...p, salaryMin: min, salaryMax: max })),
    onWorkTypeToggle: (wt) =>
      setDraft((p) => {
        const current = p.workTypes ?? [];
        return {
          ...p,
          workTypes: current.includes(wt) ? current.filter((w) => w !== wt) : [...current, wt],
        };
      }),
    onScheduleToggle: (s) =>
      setDraft((p) => {
        const current = p.schedules ?? [];
        return {
          ...p,
          schedules: current.includes(s) ? current.filter((x) => x !== s) : [...current, s],
        };
      }),
    onClear: () => {
      filterProps.onClear();
      onClose();
    },
  };

  return (
    <>
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close filters"
      />

      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-secondary)]">{title ?? 'Filtrlar'}</h2>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">{resultCount} ta ish mos keladi</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[var(--color-muted)]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <SearchFiltersPanel {...draftProps} />
        </div>

        <div className="p-5 border-t border-[var(--color-border)] pb-safe shrink-0 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button
            className="flex-[2]"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Filtrlash
          </Button>
        </div>
      </div>
    </>
  );
}

export function FilterDrawer({ isOpen, params, title = 'Filters', ...rest }: FilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <FilterDrawerPanel key={JSON.stringify(params)} params={params} title={title} {...rest} />
    </div>
  );
}

export { JOB_FILTER_OPTIONS as DEFAULT_JOB_FILTERS } from '@/lib/filters/job-filters';
