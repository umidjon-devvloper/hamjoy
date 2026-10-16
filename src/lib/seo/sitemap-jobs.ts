import { jobs as seedJobs } from '@/data/jobs';
import { getApiBaseUrl } from '@/lib/api/config';
import type { PaginatedResponse } from '@/lib/api/types';

interface RestJobSitemap {
  id: string;
  updated_at: string;
  status: string;
}

export async function getSitemapJobs(): Promise<Array<{ id: string; updatedAt: string }>> {
  const apiBase = getApiBaseUrl();

  if (apiBase) {
    try {
      const response = await fetch(`${apiBase}/api/jobs/?status=active`, {
        next: { revalidate: 3600 },
      });
      if (response.ok) {
        const data = (await response.json()) as PaginatedResponse<RestJobSitemap>;
        return data.results
          .filter((job) => job.status === 'active')
          .map((job) => ({ id: String(job.id), updatedAt: job.updated_at }));
      }
    } catch {
      // Fall through to seed data
    }
  }

  return seedJobs
    .filter((job) => job.status === 'active')
    .map((job) => ({ id: job.id, updatedAt: job.updatedAt }));
}
