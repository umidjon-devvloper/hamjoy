import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({
  value,
  outOf = 5,
  size = 14,
  showNumber = true,
  count,
  className,
}: {
  value: number;
  outOf?: number;
  size?: number;
  showNumber?: boolean;
  count?: number;
  className?: string;
}) {
  const rounded = Math.round(value * 10) / 10;
  return (
    <span
      className={cn('inline-flex items-center gap-1 text-[13px] text-[var(--color-muted)]', className)}
      aria-label={`${rounded} dan ${outOf} yulduz, ${count ?? 0} baho`}
    >
      <span className="flex items-center text-[var(--color-brand-gold,#c7a052)]">
        {Array.from({ length: outOf }).map((_, i) => (
          <Star
            key={i}
            width={size}
            height={size}
            strokeWidth={0}
            className={i < Math.round(value) ? 'fill-current' : 'fill-[rgba(0,0,0,0.08)]'}
          />
        ))}
      </span>
      {showNumber ? (
        <span className="font-semibold text-[var(--color-secondary)]">
          {rounded.toFixed(rounded % 1 === 0 ? 0 : 1)}
          {count != null ? <span className="font-normal text-[var(--color-muted)]"> · {count}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
