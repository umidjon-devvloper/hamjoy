import React from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';

export interface CategoryCardProps {
  category: Category;
  href?: string;
  variant?: 'pill' | 'card';
  className?: string;
}

export function CategoryCard({
  category,
  href = `/search?category=${encodeURIComponent(category.slug)}`,
  variant = 'card',
  className,
}: CategoryCardProps) {
  const Icon =
    (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
      category.icon
    ] || Icons.Briefcase;

  if (variant === 'pill') {
    return (
      <Link
        href={href}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[var(--color-border)] text-sm font-medium text-[var(--color-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap shrink-0',
          className
        )}
      >
        <Icon className="w-4 h-4 text-[var(--color-primary)]" />
        {category.name}
      </Link>
    );
  }

  return (
    <Link href={href} className={cn('block shrink-0', className)}>
      <div className="card card-hover flex flex-col items-center justify-center p-4 min-w-[88px] sm:min-w-[100px] group">
        <div className="w-11 h-11 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs sm:text-sm font-medium text-[var(--color-secondary)] text-center leading-tight">
          {category.name}
        </span>
        <span className="text-[10px] text-[var(--color-muted)] mt-0.5">{category.jobCount}</span>
      </div>
    </Link>
  );
}
