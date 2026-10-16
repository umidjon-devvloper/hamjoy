import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Saved Uy-joy listings, kept in this browser until listings get a backend.
 * (Job favorites have their own context/service — this store does not touch them.)
 */

const STORAGE_KEY = 'hamjoy:saved-listings';
const listeners = new Set<() => void>();

function readRaw(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function parse(raw: string): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Adds or removes a listing; returns true when it is now saved. */
function toggleSaved(id: string): boolean {
  const ids = parse(readRaw());
  const saved = !ids.includes(id);
  const next = saved ? [...ids, id] : ids.filter((x) => x !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / storage full — the toggle just won't persist.
  }
  listeners.forEach((l) => l());
  return saved;
}

export function useSavedListings() {
  // The raw string is the snapshot: stable between renders, empty on the server.
  const raw = useSyncExternalStore(subscribe, readRaw, () => '');
  const ids = useMemo(() => new Set(parse(raw)), [raw]);
  const isSaved = useCallback((id: string) => ids.has(id), [ids]);
  return { savedIds: ids, isSaved, toggleSaved };
}
