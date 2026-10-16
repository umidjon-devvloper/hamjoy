import { cn } from '@/lib/utils';
import { RefreshButton } from '@/components/ui/RefreshButton';

export interface PageHeaderProps {
  greeting?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  onRefresh?: () => void | Promise<void>;
  className?: string;
}

export function PageHeader({
  greeting,
  title,
  subtitle,
  action,
  onRefresh,
  className,
}: PageHeaderProps) {
  const trailingAction =
    action ??
    (onRefresh ? <RefreshButton onRefresh={onRefresh} label={`Refresh ${title}`} /> : null);

  return (
    <header className={cn('flex justify-between items-start gap-4 mb-6 md:mb-8', className)}>
      <div className="min-w-0">
        {greeting && <p className="text-[var(--color-muted)] text-sm mb-1">{greeting}</p>}
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-secondary)] tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-[var(--color-muted)] text-sm mt-1.5">{subtitle}</p>}
      </div>
      {trailingAction && <div className="shrink-0">{trailingAction}</div>}
    </header>
  );
}
