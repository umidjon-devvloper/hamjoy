import type { Listing } from '@joymee/types';
import type { Job } from '@/types';
import { getJoymeeClient } from './client';

/**
 * Map a Joymee Listing (generic marketplace entry) into the web app's Job
 * shape, which is what the current UI pages consume. Only the fields the
 * list/card UI actually reads are populated; the rest default to safe values.
 */
function listingToJob(l: Listing & { priceAmount?: string | number | null; priceCurrency?: string | null }): Job {
  // Backend returns raw columns (priceAmount, priceCurrency); SDK type says
  // price:{amount,...}. Support both until the server normalises.
  const rawAmount = l.price?.amount ?? (l.priceAmount != null ? Number(l.priceAmount) : 0);
  const currency = l.price?.currency ?? l.priceCurrency ?? 'UZS';
  const salary = Number.isFinite(rawAmount) ? Number(rawAmount) : 0;
  return {
    id: l.id,
    title: l.title,
    companyId: l.userId,
    companyName: 'Joymee foydalanuvchi',
    companyLogo: '',
    categoryId: String(l.categoryId),
    posterId: l.userId,
    description: l.description,
    requirements: [],
    status: l.status === 'active' ? 'active' : l.status === 'archived' || l.status === 'sold' ? 'closed' : 'pending',
    workType: 'onsite',
    scheduleType: 'full-time',
    schedulePattern: 'standard',
    location: {
      label: '', // locationId → name lookup happens elsewhere; label empty for now
      isRemote: false,
      lat: l.geo?.lat,
      lng: l.geo?.lng,
    },
    salaryMin: salary,
    salaryMax: salary,
    salaryCurrency: currency,
    skills: [],
    isFeatured: false,
    createdAt: l.createdAt,
    updatedAt: l.createdAt,
  };
}

export const joymeeListingsRepository = {
  async getAll(): Promise<Job[]> {
    const res = await getJoymeeClient().listings.search({ limit: 50 });
    return res.items.map(listingToJob);
  },

  async getById(id: string): Promise<Job | undefined> {
    try {
      const l = await getJoymeeClient().listings.get(id);
      return listingToJob(l);
    } catch {
      return undefined;
    }
  },

  async getMine(): Promise<Job[]> {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';
    const token = await (await import('./client')).joymeeTokens.getAccess();
    if (!token) return [];
    const res = await fetch(`${base}/listings/mine`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const items = (await res.json()) as Array<Parameters<typeof listingToJob>[0]>;
    return items.map(listingToJob);
  },

  async remove(id: string): Promise<void> {
    await getJoymeeClient().listings.remove(id);
  },

  async markSold(id: string): Promise<void> {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';
    const token = await (await import('./client')).joymeeTokens.getAccess();
    await fetch(`${base}/listings/${id}/mark-sold`, {
      method: 'POST',
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
  },

  async reopen(id: string): Promise<void> {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';
    const token = await (await import('./client')).joymeeTokens.getAccess();
    await fetch(`${base}/listings/${id}/reopen`, {
      method: 'POST',
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
  },
};
