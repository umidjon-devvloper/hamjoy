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
        <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[var(--color-secondary)] sm:text-[36px]">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-[var(--color-muted)]">{subtitle}</p>}
      </div>
      {trailingAction && <div className="shrink-0">{trailingAction}</div>}
    </header>
  );
}
