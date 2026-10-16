import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { apiFetch } from '@/lib/api/http-client';
import type { PaginatedResponse } from '@/lib/api/types';

interface RestFavorite {
  id: number;
  job_id: string;
}

export const restFavoritesRepository = {
  async getFavoriteIds(userId: string): Promise<Set<string>> {
    void userId;
    const data = await apiFetch<PaginatedResponse<RestFavorite>>(API_ENDPOINTS.favorites);
    return new Set(data.results.map((item) => String(item.job_id)));
  },

  async toggle(userId: string, jobId: string): Promise<boolean> {
    void userId;
    const existing = await apiFetch<PaginatedResponse<RestFavorite>>(API_ENDPOINTS.favorites);
    const match = existing.results.find((item) => String(item.job_id) === jobId);

    if (match) {
      await apiFetch(`${API_ENDPOINTS.favorites}${match.id}/`, { method: 'DELETE' });
      return false;
    }

    await apiFetch(API_ENDPOINTS.favorites, {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId }),
    });
    return true;
  },
};
