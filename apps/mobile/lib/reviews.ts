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
