import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Company logo, or a two-letter monogram when the job has none (API jobs often don't). */
export function CompanyLogo({
  src,
  company,
  size,
  className,
}: {
  src?: string | null;
  company: string;
  size: number;
  className?: string;
}) {
  if (src) {
    return <Image src={src} alt="" width={size} height={size} className={cn('object-contain', className)} aria-hidden unoptimized />;
  }
  const words = company.trim().split(/\s+/).filter(Boolean);
  const letters = (words.length > 1 ? words[0][0] + words[1][0] : company.slice(0, 2)).toUpperCase();
  return (
    <span
      aria-hidden
      style={{ fontSize: Math.round(size * 0.45) }}
      className={cn('font-extrabold tracking-[-0.02em] text-[var(--color-brand-green)]', className)}
    >
      {letters || '·'}
    </span>
  );
}
