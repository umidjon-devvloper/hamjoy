import { useCallback } from 'react';
import { createLocalStore } from '@/lib/local-store';

/**
 * Admin decisions on Uy-joy listings. Listings without a record are live ("active").
 * The public site shows only active ones; the admin panel shows everything.
 */
export type ListingModerationStatus = 'active' | 'pending' | 'removed';

export const LISTING_STATUS_LABELS: Record<ListingModerationStatus, string> = {
  active: 'Faol',
  pending: 'Tekshiruvda',
  removed: 'Oʻchirilgan',
};

const store = createLocalStore<Record<string, ListingModerationStatus>>('hamjoy:listing-moderation', {});

export function useListingModeration() {
  const statuses = store.useValue();
  const statusOf = useCallback((id: string): ListingModerationStatus => statuses[id] ?? 'active', [statuses]);
  const isVisible = useCallback((id: string) => (statuses[id] ?? 'active') === 'active', [statuses]);
  const setStatus = useCallback((ids: string[], status: ListingModerationStatus) => {
    const next = { ...store.read() };
    for (const id of ids) {
      if (status === 'active') delete next[id];
      else next[id] = status;
    }
    store.write(next);
  }, []);
  return { statusOf, isVisible, setStatus, reset: store.clear };
}
