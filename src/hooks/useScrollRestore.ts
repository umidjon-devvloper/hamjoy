'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const STORAGE_PREFIX = 'scroll:';

/**
 * Persists window scroll per route in sessionStorage so back-navigation feels native.
 */
export function useScrollRestore(enabled = true): void {
  const pathname = usePathname();
  const storageKey = `${STORAGE_PREFIX}${pathname}`;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      const y = Number.parseInt(saved, 10);
      if (!Number.isNaN(y)) {
        requestAnimationFrame(() => window.scrollTo(0, y));
      }
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        sessionStorage.setItem(storageKey, String(window.scrollY));
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      sessionStorage.setItem(storageKey, String(window.scrollY));
    };
  }, [storageKey, enabled]);
}
