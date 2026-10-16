'use client';

import React from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  asLink?: boolean;
  href?: string;
  onFilterClick?: () => void;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Ish, kompaniya yoki koʻnikma qidiring...',
  asLink = false,
  href = '/search',
  onFilterClick,
  className,
}: SearchBarProps) {
  const inner = (
    <div
      className={cn(
        'card card-hover flex items-center gap-3 p-3.5 sm:p-4 focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20 focus-within:border-[var(--color-primary)]/40 transition-all',
        className
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
        <Search className="w-5 h-5" />
      </div>
      {asLink ? (
        <span className="flex-1 text-[var(--color-muted)] text-base">{placeholder}</span>
      ) : (
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-1 outline-none text-base bg-transparent text-[var(--color-secondary)] placeholder:text-[var(--color-muted)]"
        />
      )}
      {onFilterClick !== undefined && (
        <button
          type="button"
          onClick={onFilterClick}
          className="w-11 h-11 rounded-xl bg-[var(--color-secondary)] text-white flex items-center justify-center hover:bg-gray-800 transition-colors shrink-0"
          aria-label="Filters"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }

  return inner;
}
