import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}

export function SectionHeader({ title, href, linkLabel = 'Barchasi', className }: SectionHeaderProps) {
  return (
    <div className={cn('flex justify-between items-center mb-4', className)}>
      <h2 className="text-lg sm:text-xl font-bold text-[var(--color-secondary)]">{title}</h2>
      {href && (
        <Link
          href={href}
          className="text-[var(--color-primary)] font-medium text-sm hover:text-[var(--color-primary-hover)] transition-colors"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
