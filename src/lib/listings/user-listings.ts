import { useMemo, useSyncExternalStore } from 'react';
import type { PropertyListing } from '@/types/listing';

/**
 * Uy-joy listings posted from this browser. Stands in for the listings API:
 * swap these functions for HTTP calls when the backend exists.
 */

const STORAGE_KEY = 'hamjoy:user-listings';
const listeners = new Set<() => void>();

function readRaw(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function parse(raw: string): PropertyListing[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? (value as PropertyListing[]) : [];
  } catch {
    return [];
  }
}

function write(listings: PropertyListing[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      throw new Error('Brauzer xotirasi toʻldi — kamroq yoki kichikroq rasm yuklang.');
    }
    throw err;
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function addUserListing(listing: PropertyListing): PropertyListing {
  write([listing, ...parse(readRaw())]);
  return listing;
}

export function removeUserListing(id: string): void {
  write(parse(readRaw()).filter((l) => l.id !== id));
}

/** Newest first. Empty during SSR and the first client render (no hydration mismatch). */
export function useUserListings(): PropertyListing[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => '');
  return useMemo(() => parse(raw), [raw]);
}

/** True once the browser store has been read — lets pages tell "loading" from "not found". */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
