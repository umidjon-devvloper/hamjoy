import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Admin-granted ✓ badge. Telegram-style — a tight pill with a checkmark.
 * Pass `label` to show text; omit for icon-only.
 */
export function TrustBadge({
  size = 'sm',
  label,
  className,
}: {
  size?: 'xs' | 'sm' | 'md';
  label?: string;
  className?: string;
}) {
  const sz = size === 'xs' ? 12 : size === 'sm' ? 14 : 18;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)] px-1.5 py-0.5 text-white',
        size === 'xs' && 'text-[10px]',
        size === 'sm' && 'text-[11px]',
        size === 'md' && 'text-[13px]',
        className,
      )}
      title="Ishonchli egasi · administrator tasdiqlagan"
    >
      <BadgeCheck size={sz} strokeWidth={2.6} />
      {label ? <span className="font-semibold">{label}</span> : null}
    </span>
  );
}
