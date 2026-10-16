import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('card flex flex-col items-center text-center px-6 py-14', className)}>
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mb-5">
        <Icon className="w-8 h-8" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">{title}</h3>
      {description && (
        <p className="text-[var(--color-muted)] text-sm max-w-xs leading-relaxed mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
