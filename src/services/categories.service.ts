import type { Category } from '@/types';
import { categories as categoriesData, jobs as jobsData } from '@/data';
import { isBackendEnabled } from '@/lib/backend/config';
import { isRestBackendEnabled } from '@/lib/api/config';
import { firebaseCategoriesRepository } from '@/lib/firebase/repositories/categories.repository';

async function restRepo() {
  const { restCategoriesRepository } = await import(
    '@/lib/rest/repositories/categories.repository'
  );
  return restCategoriesRepository;
}

export const categoriesService = {
  /** @deprecated sync */
  listCategories(): Category[] {
    return categoriesData.map((cat) => ({
      ...cat,
      jobCount: jobsData.filter(
        (job) => job.categoryId === cat.id && job.status === 'active'
      ).length,
    }));
  },

  async listCategoriesAsync(): Promise<Category[]> {
    if (isRestBackendEnabled()) {
      return (await restRepo()).list();
    }
    if (isBackendEnabled()) {
      return firebaseCategoriesRepository.list();
    }
    return this.listCategories();
  },

  async getById(id: string): Promise<Category | undefined> {
    if (isRestBackendEnabled()) {
      return (await restRepo()).getById(id);
    }
    if (isBackendEnabled()) {
      return firebaseCategoriesRepository.getById(id);
    }
    return this.listCategories().find((c) => c.id === id);
  },

  async getBySlug(slug: string): Promise<Category | undefined> {
    if (isRestBackendEnabled()) {
      return (await restRepo()).getBySlug(slug);
    }
    if (isBackendEnabled()) {
      return firebaseCategoriesRepository.getBySlug(slug);
    }
    return this.listCategories().find((c) => c.slug === slug);
  },
};
