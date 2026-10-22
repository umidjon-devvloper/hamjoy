import { API_URL, tokens } from './api';

export interface UserStats {
  avg: number;
  count: number;
}

export interface Review {
  id: string;
  toUserId: string;
  fromUserId: string;
  listingId: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}

async function authHeader(): Promise<Record<string, string>> {
  const token = await tokens.getAccess();
  return token
    ? { authorization: `Bearer ${token}`, 'content-type': 'application/json' }
    : { 'content-type': 'application/json' };
}

/** Thin wrapper for owner-only listing actions used by /my-listings. */
export const listingsApi = {
  async markSold(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/listings/${id}/mark-sold`, { method: 'POST', headers: await authHeader() });
    if (!res.ok) throw new Error('mark_sold_failed');
  },
  async reopen(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/listings/${id}/reopen`, { method: 'POST', headers: await authHeader() });
    if (!res.ok) throw new Error('reopen_failed');
  },
  async remove(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/listings/${id}`, { method: 'DELETE', headers: await authHeader() });
    if (!res.ok) throw new Error('delete_failed');
  },
  async myHistory(userId: string) {
    const res = await fetch(`${API_URL}/users/${userId}/history`);
    if (!res.ok) return [] as const;
    return (await res.json()) as Array<{
      id: string;
      title: string;
      type: string;
      vertical: string;
      status: string;
      priceAmount: string | null;
      priceCurrency: string | null;
      createdAt: string;
    }>;
  },
};

export const reviewsApi = {
  async stats(userId: string): Promise<UserStats> {
    const res = await fetch(`${API_URL}/users/${userId}/stats`);
    if (!res.ok) return { avg: 0, count: 0 };
    return (await res.json()) as UserStats;
  },
  async list(userId: string): Promise<Review[]> {
    const res = await fetch(`${API_URL}/users/${userId}/reviews`);
    if (!res.ok) return [];
    return (await res.json()) as Review[];
  },
  async create(input: {
    toUserId: string;
    listingId?: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: await authHeader(),
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(body.message ?? `Baho qoʻshib boʻlmadi (${res.status})`);
    }
    return (await res.json()) as Review;
  },
};
