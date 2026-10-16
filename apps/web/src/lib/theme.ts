'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY as STORAGE_KEY } from './theme-script';

export type Theme = 'light' | 'dark';

const CHANGE_EVENT = 'hamjoy:theme-change';

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  // Keep tabs in sync when the theme is changed in another tab.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    applyTheme(e.newValue === 'dark' ? 'dark' : 'light', false);
  };
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

function applyTheme(theme: Theme, persist = true) {
  if (theme === 'dark') document.documentElement.dataset.theme = 'dark';
  else delete document.documentElement.dataset.theme;
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* private mode — theme still applies for this page view */
    }
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Current theme + a toggle. Light on the server; the real value after hydration. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => 'light');
  const toggleTheme = useCallback(() => applyTheme(readTheme() === 'dark' ? 'light' : 'dark'), []);
  return { theme, toggleTheme };
}
