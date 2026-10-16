import { cn } from '@/lib/utils';

/** Left-menu item: a chip on mobile, a large row on desktop. Shared by posting and browsing. */
export const sideItemClass = (active: boolean) =>
  cn(
    'flex min-h-10 shrink-0 items-center gap-3 whitespace-nowrap rounded-full border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-gold)]/70',
    'lg:min-h-12 lg:w-full lg:gap-3.5 lg:rounded-xl lg:border-transparent lg:px-3.5 lg:text-base',
    active
      ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
      : 'border-[var(--color-border)] bg-white text-[var(--color-secondary)] hover:bg-gray-50 lg:bg-transparent'
  );

export const sideIconClass = 'h-[18px] w-[18px] shrink-0 lg:h-[22px] lg:w-[22px]';
export const sideGroupLabelClass = 'mb-1.5 hidden px-3.5 text-[15px] font-semibold text-gray-500 lg:block';
export const sideRowClass =
  '-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:flex-col lg:gap-0.5 lg:overflow-visible';

/**
 * Desktop left column: sticks under the page header and scrolls on its own when the menu is
 * taller than the screen, so its last items are always reachable without scrolling the page.
 */
export const sideAsideScrollClass =
  'lg:overflow-y-auto lg:overscroll-contain lg:rounded-2xl [scrollbar-width:thin]';
