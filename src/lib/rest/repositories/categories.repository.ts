import type { Category } from '@/types';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { apiFetch } from '@/lib/api/http-client';

interface RestCategory {
  id: number | string;
  name: string;
  slug: string;
  icon: string;
  order?: number;
  job_count: number;
}

function mapCategory(c: RestCategory): Category {
  return {
    id: String(c.id),
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    jobCount: c.job_count ?? 0,
  };
}

export const restCategoriesRepository = {
  // The categories endpoint is unpaginated (returns a plain array).
  async list(): Promise<Category[]> {
    const data = await apiFetch<RestCategory[]>(API_ENDPOINTS.categories);
    return Array.isArray(data) ? data.map(mapCategory) : [];
  },

  async getById(id: string): Promise<Category | undefined> {
    return (await this.list()).find((c) => c.id === id);
  },

  async getBySlug(slug: string): Promise<Category | undefined> {
    return (await this.list()).find((c) => c.slug === slug);
  },
};
