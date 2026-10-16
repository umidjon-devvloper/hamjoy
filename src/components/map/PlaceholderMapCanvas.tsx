'use client';

import { cn } from '@/lib/utils';

interface PlaceholderMapCanvasProps {
  children?: React.ReactNode;
  className?: string;
  /** Show subtle provider badge for demo maps */
  showProviderBadge?: boolean;
}

export function PlaceholderMapCanvas({
  children,
  className,
  showProviderBadge = true,
}: PlaceholderMapCanvasProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-blue-50 via-gray-50 to-emerald-50',
        className
      )}
      role="img"
      aria-label="Map placeholder"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #CBD5E1 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Decorative roads */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[30%] left-0 right-0 h-px bg-slate-400 rotate-[8deg] origin-left" />
        <div className="absolute top-[55%] left-0 right-0 h-px bg-slate-400 -rotate-[4deg] origin-right" />
        <div className="absolute left-[40%] top-0 bottom-0 w-px bg-slate-400 rotate-[12deg]" />
      </div>

      {showProviderBadge && (
        <div className="absolute top-3 right-3 z-[1] rounded-lg bg-white/80 backdrop-blur px-2 py-1 text-[10px] font-medium text-[var(--color-muted)] border border-[var(--color-border)]">
          Demo map
        </div>
      )}

      {children}
    </div>
  );
}
