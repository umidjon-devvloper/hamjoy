'use client';

import { useEffect, useRef } from 'react';

const PULL_THRESHOLD_PX = 72;

/**
 * Mobile pull-to-refresh when the page is scrolled to the top.
 */
export function usePullToRefresh(
  onRefresh: () => void | Promise<void>,
  enabled = true
): void {
  const startY = useRef(0);
  const isTracking = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const onTouchStart = (event: TouchEvent) => {
      if (window.scrollY > 4) return;
      startY.current = event.touches[0]?.clientY ?? 0;
      isTracking.current = true;
    };

    const onTouchEnd = async (event: TouchEvent) => {
      if (!isTracking.current) return;
      isTracking.current = false;

      const endY = event.changedTouches[0]?.clientY ?? 0;
      const delta = endY - startY.current;

      if (delta >= PULL_THRESHOLD_PX && window.scrollY <= 4) {
        await onRefreshRef.current();
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled]);
}
