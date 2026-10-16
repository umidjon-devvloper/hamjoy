import { useSyncExternalStore } from 'react';

/**
 * Tiny JSON store over localStorage with a React hook. Stands in for an API until the backend
 * exists; other tabs stay in sync through the `storage` event. The parsed value is cached per raw
 * string, so React sees a stable snapshot.
 */
export function createLocalStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue = fallback;

  const read = (): T => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      return fallback;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cachedValue = raw ? (JSON.parse(raw) as T) : fallback;
      } catch {
        cachedValue = fallback;
      }
    }
    return cachedValue;
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  };

  const write = (value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Private mode / quota — the change just won't persist.
    }
    listeners.forEach((l) => l());
  };

  const clear = () => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    listeners.forEach((l) => l());
  };

  const useValue = () => useSyncExternalStore(subscribe, read, () => fallback);

  return { read, write, clear, subscribe, useValue };
}
