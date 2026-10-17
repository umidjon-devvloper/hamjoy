import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl font-semibold transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          {
            'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-sm shadow-black/10':
              variant === 'primary',
            'bg-[var(--color-secondary)] text-white hover:bg-[#23262B]': variant === 'secondary',
            'bg-[var(--color-accent)] text-white hover:brightness-90 shadow-sm shadow-black/10':
              variant === 'accent',
            'bg-[var(--color-success)] text-white hover:bg-[var(--color-primary-hover)]': variant === 'success',
            'border border-[#DADBD5] bg-white hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] text-[var(--color-secondary)]':
              variant === 'outline',
            'hover:bg-[var(--color-field)] text-[var(--color-muted)]': variant === 'ghost',
            'h-9 px-4 text-sm rounded-xl': size === 'sm',
            'h-12 px-5 text-sm rounded-[14px]': size === 'md',
            'h-14 px-8 text-base rounded-full': size === 'lg',
            'h-11 w-11 rounded-xl': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
