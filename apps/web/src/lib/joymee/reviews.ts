import { joymeeTokens } from './client';

const base = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';

async function authHeader(): Promise<Record<string, string>> {
  const token = await joymeeTokens.getAccess();
  return token ? { authorization: `Bearer ${token}`, 'content-type': 'application/json' } : { 'content-type': 'application/json' };
}

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

export interface UserHistoryRow {
  id: string;
  title: string;
  type: string;
  vertical: string;
  status: string;
  priceAmount: string | null;
  priceCurrency: string | null;
  createdAt: string;
}

export const joymeeReviews = {
  async stats(userId: string): Promise<UserStats> {
    const res = await fetch(`${base()}/users/${userId}/stats`);
    if (!res.ok) return { avg: 0, count: 0 };
    return (await res.json()) as UserStats;
  },

  async list(userId: string): Promise<Review[]> {
    const res = await fetch(`${base()}/users/${userId}/reviews`);
    if (!res.ok) return [];
    return (await res.json()) as Review[];
  },

  async history(userId: string): Promise<UserHistoryRow[]> {
    const res = await fetch(`${base()}/users/${userId}/history`);
    if (!res.ok) return [];
    return (await res.json()) as UserHistoryRow[];
  },

  async myListings(): Promise<UserHistoryRow[]> {
    const headers = await authHeader();
    const res = await fetch(`${base()}/listings/mine`, { headers });
    if (!res.ok) return [];
    const items = (await res.json()) as Array<{
      id: string; title: string; type: string; vertical: string;
      status: string; priceAmount?: string | null; priceCurrency?: string | null;
      createdAt: string;
    }>;
    return items.map((l) => ({
      id: l.id,
      title: l.title,
      type: l.type,
      vertical: l.vertical,
      status: l.status,
      priceAmount: l.priceAmount ?? null,
      priceCurrency: l.priceCurrency ?? null,
      createdAt: l.createdAt,
    }));
  },

  async create(input: { toUserId: string; listingId?: string; rating: number; comment?: string }): Promise<Review> {
    const res = await fetch(`${base()}/reviews`, {
      method: 'POST',
      headers: await authHeader(),
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? `Baho qoʻshib boʻlmadi (${res.status})`);
    }
    return (await res.json()) as Review;
  },
};
