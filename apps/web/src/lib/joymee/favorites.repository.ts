import { getJoymeeClient, joymeeTokens } from './client';

const base = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';

async function authHeader(): Promise<Record<string, string>> {
  const token = await joymeeTokens.getAccess();
  return token ? { authorization: `Bearer ${token}` } : {};
}

export const joymeeFavoritesRepository = {
  async getFavoriteIds(_userId: string): Promise<Set<string>> {
    void _userId;
    const res = await fetch(`${base()}/favorites`, { headers: await authHeader() });
    if (!res.ok) return new Set();
    const rows = (await res.json()) as Array<{ listing: { id: string } }>;
    return new Set(rows.map((r) => r.listing.id));
  },

  async toggle(_userId: string, listingId: string): Promise<boolean> {
    void _userId;
    const res = await fetch(`${base()}/favorites/${listingId}`, {
      method: 'POST',
      headers: await authHeader(),
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { favorited: boolean };
    return body.favorited;
  },
};

void getJoymeeClient;
