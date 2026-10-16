import React from 'react';
import type { SearchFiltersPanelProps } from './SearchFiltersPanel';
import { SearchFiltersPanel } from './SearchFiltersPanel';
import { cn } from '@/lib/utils';

export function SearchFilterSidebar(props: SearchFiltersPanelProps) {
  return (
    <aside
      className={cn(
        'hidden lg:block w-72 shrink-0',
        'sticky top-6 self-start',
        'card p-5 max-h-[calc(100vh-8rem)] overflow-y-auto hide-scrollbar'
      )}
    >
      <SearchFiltersPanel {...props} />
    </aside>
  );
}
