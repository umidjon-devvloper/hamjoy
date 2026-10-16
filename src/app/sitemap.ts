import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo/metadata';
import { getSitemapJobs } from '@/lib/seo/sitemap-jobs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const staticRoutes = [
    '',
    '/home',
    '/search',
    '/categories',
    '/home/ish',
    '/home/ish/xarita',
    '/login',
    '/register',
    '/legal/privacy',
    '/legal/terms',
  ];

  const jobEntries = await getSitemapJobs();

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: path === '' || path === '/home' ? 1 : 0.8,
    })),
    ...jobEntries.map((job) => ({
      url: `${base}/job/${job.id}`,
      lastModified: new Date(job.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
