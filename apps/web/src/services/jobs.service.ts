import type { Job, JobFilters, JobListItem, JobSearchParams, JobStatus } from '@/types';
import type { CreateJobFormData } from '@/types';
import { jobs as jobsData, categories as categoriesData } from '@/data';
import { toJobListItem, toJobListItems } from '@/lib/mappers/job.mapper';
import { createJobFormToEntity } from '@/lib/mappers/create-job.mapper';
import { resolveFilterId } from '@/lib/filters/job-filters';
import { userJobsStore } from '@/services/user-jobs.store';
import { jobModerationStore } from '@/services/job-moderation.store';
import { isBackendEnabled } from '@/lib/backend/config';
import { isRestBackendEnabled } from '@/lib/api/config';
import { firebaseJobsRepository } from '@/lib/firebase/repositories/jobs.repository';
import { haversineKm } from '@/lib/map/distance';
import type { MapCoordinates } from '@/types';
import {
  matchesSearchParams,
  sortJobs,
  DEFAULT_SEARCH_PARAMS,
} from '@/lib/filters/job-search';

async function fetchAllJobs(): Promise<Job[]> {
  if (isRestBackendEnabled()) {
    const { restJobsRepository } = await import('@/lib/rest/repositories/jobs.repository');
    return restJobsRepository.getAll();
  }
  if (isBackendEnabled()) {
    return firebaseJobsRepository.getAll();
  }
  const userJobs = typeof window !== 'undefined' ? userJobsStore.getAll() : [];
  // userJobsStore entries override seed jobs with the same id (e.g. an edited
  // seed listing), so dedupe by id keeping the user copy.
  const userJobIds = new Set(userJobs.map((j) => j.id));
  const merged = [...userJobs, ...jobsData.filter((j) => !userJobIds.has(j.id))]
    .map((job) => jobModerationStore.applyToJob(job))
    .filter((job): job is Job => job !== null);
  return merged;
}

async function fetchActiveJobs(): Promise<Job[]> {
  const all = await fetchAllJobs();
  return all.filter((job) => job.status === 'active');
}

function applyLegacyFilters(job: Job, filters: JobFilters): boolean {
  if (filters.posterId && job.posterId !== filters.posterId) return false;
  if (filters.status && job.status !== filters.status) return false;
  if (filters.categoryId && job.categoryId !== filters.categoryId) return false;

  if (filters.categorySlug) {
    const cat = categoriesData.find((c) => c.slug === filters.categorySlug);
    if (cat && job.categoryId !== cat.id) return false;
  }

  if (filters.filterId && filters.filterId !== 'all') {
    const resolved = resolveFilterId(filters.filterId);
    if (resolved.workType && job.workType !== resolved.workType) return false;
    if (resolved.scheduleType && job.scheduleType !== resolved.scheduleType) return false;
  }

  if (filters.workType && filters.workType !== 'all' && job.workType !== filters.workType) {
    return false;
  }

  if (
    filters.scheduleType &&
    filters.scheduleType !== 'all' &&
    job.scheduleType !== filters.scheduleType
  ) {
    return false;
  }

  if (filters.query?.trim()) {
    const q = filters.query.toLowerCase().trim();
    if (!job.title.toLowerCase().includes(q)) return false;
  }

  return true;
}

function resolveCategorySlug(params: JobSearchParams, categories = categoriesData): JobSearchParams {
  if (!params.categorySlug) return params;
  const cat = categories.find((c) => c.slug === params.categorySlug);
  if (cat) return { ...params, categoryId: cat.id, categorySlug: undefined };
  return params;
}

export const jobsService = {
  /** @deprecated sync — use getAllRawAsync */
  getAllRaw(): Job[] {
    const userJobs = typeof window !== 'undefined' ? userJobsStore.getAll() : [];
    return [...userJobs, ...jobsData];
  },

  async getAllRawAsync(): Promise<Job[]> {
    return fetchAllJobs();
  },

  /** @deprecated sync */
  getById(id: string): Job | undefined {
    return this.getAllRaw().find((job) => job.id === id);
  },

  async getByIdAsync(id: string): Promise<Job | undefined> {
    if (isRestBackendEnabled()) {
      const { restJobsRepository } = await import('@/lib/rest/repositories/jobs.repository');
      return restJobsRepository.getById(id);
    }
    if (isBackendEnabled()) {
      return firebaseJobsRepository.getById(id);
    }
    return this.getById(id);
  },

  async createFromForm(data: CreateJobFormData): Promise<Job> {
    const job = createJobFormToEntity(data);
    if (isRestBackendEnabled()) {
      const { restJobsRepository } = await import('@/lib/rest/repositories/jobs.repository');
      return restJobsRepository.insert(job);
    }
    if (isBackendEnabled()) {
      return firebaseJobsRepository.insert(job);
    }
    return userJobsStore.add(job);
  },

  /** Edit an existing listing from the wizard form, preserving identity/status. */
  async updateFromForm(id: string, data: CreateJobFormData): Promise<Job> {
    const existing = await this.getByIdAsync(id);
    const draft = createJobFormToEntity(data);
    const updated: Job = {
      ...draft,
      id,
      posterId: existing?.posterId ?? draft.posterId,
      // Preserve identity/branding/status — the wizard only edits the content.
      companyName: existing?.companyName ?? draft.companyName,
      companyLogo: existing?.companyLogo ?? draft.companyLogo,
      companyId: existing?.companyId ?? draft.companyId,
      status: existing?.status ?? draft.status,
      isFeatured: existing?.isFeatured ?? draft.isFeatured,
      createdAt: existing?.createdAt ?? draft.createdAt,
      updatedAt: new Date().toISOString(),
    };

    if (isRestBackendEnabled()) {
      const { restJobsRepository } = await import('@/lib/rest/repositories/jobs.repository');
      return restJobsRepository.update(id, updated);
    }
    if (isBackendEnabled()) {
      return firebaseJobsRepository.insert(updated);
    }
    // Mock: upsert into the user store so it overrides any seed listing by id.
    if (userJobsStore.getById(id)) {
      return userJobsStore.update(id, updated) ?? updated;
    }
    return userJobsStore.add(updated);
  },

  async getSearchFacets() {
    const active = await fetchActiveJobs();
    const labels = new Set<string>();
    active.forEach((job) => {
      labels.add(job.location.isRemote ? 'Masofaviy' : job.location.label);
    });
    return {
      locations: [
        { value: 'all', label: 'Barcha joylashuvlar' },
        ...[...labels].sort().map((label) => ({ value: label, label })),
      ],
    };
  },

  async search(savedJobIds: Set<string>, params: JobSearchParams = {}): Promise<JobListItem[]> {
    const resolved = resolveCategorySlug({ ...DEFAULT_SEARCH_PARAMS, ...params });
    const filtered = (await fetchActiveJobs()).filter((job) => matchesSearchParams(job, resolved));
    const sorted = sortJobs(filtered, resolved.sort ?? 'newest');
    return toJobListItems(sorted, savedJobIds);
  },

  async listJobs(
    savedJobIds: Set<string>,
    filters: JobFilters | JobSearchParams = {}
  ): Promise<JobListItem[]> {
    if ('workTypes' in filters || 'schedules' in filters || 'sort' in filters) {
      return this.search(savedJobIds, filters as JobSearchParams);
    }

    const legacy = filters as JobFilters;
    const includeAllStatuses = Boolean(legacy.posterId);
    const pool = includeAllStatuses ? await fetchAllJobs() : await fetchActiveJobs();
    const filtered = pool.filter((job) => applyLegacyFilters(job, legacy));
    return toJobListItems(filtered, savedJobIds);
  },

  async searchJobs(
    savedJobIds: Set<string>,
    filters: JobFilters | JobSearchParams = {}
  ): Promise<JobListItem[]> {
    return this.listJobs(savedJobIds, filters);
  },

  async getFeaturedJobs(savedJobIds: Set<string>, limit = 2): Promise<JobListItem[]> {
    return toJobListItems(
      (await fetchActiveJobs()).filter((j) => j.isFeatured),
      savedJobIds
    ).slice(0, limit);
  },

  async getRecentJobs(savedJobIds: Set<string>, limit = 4): Promise<JobListItem[]> {
    return sortJobs(await fetchActiveJobs(), 'newest')
      .slice(0, limit)
      .map((job) => toJobListItem(job, savedJobIds));
  },

  /**
   * Jobs within `radiusKm` of a point, nearest-first, with `distanceKm` attached.
   * REST mode delegates to the server's geo endpoint; otherwise distance is
   * computed client-side over the active pool.
   */
  async getNearbyJobs(
    savedJobIds: Set<string>,
    center: MapCoordinates,
    radiusKm = 25
  ): Promise<JobListItem[]> {
    if (isRestBackendEnabled()) {
      const { restJobsRepository } = await import('@/lib/rest/repositories/jobs.repository');
      const results = await restJobsRepository.getNearby(center, radiusKm);
      return results.map(({ job, distanceKm }) => {
        const item = toJobListItem(job, savedJobIds);
        item.distanceKm = distanceKm;
        return item;
      });
    }

    const active = await fetchActiveJobs();
    return active
      .filter(
        (job) =>
          !job.location.isRemote &&
          job.location.lat !== undefined &&
          job.location.lng !== undefined
      )
      .map((job) => ({
        job,
        distanceKm: haversineKm(center, {
          lat: job.location.lat as number,
          lng: job.location.lng as number,
        }),
      }))
      .filter(({ distanceKm }) => distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .map(({ job, distanceKm }) => {
        const item = toJobListItem(job, savedJobIds);
        item.distanceKm = Math.round(distanceKm * 10) / 10;
        return item;
      });
  },

  async getSimilarJobs(
    jobId: string,
    savedJobIds: Set<string>,
    limit = 3
  ): Promise<JobListItem[]> {
    const job = await this.getByIdAsync(jobId);
    if (!job) return [];

    return toJobListItems(
      (await fetchActiveJobs())
        .filter((j) => j.id !== jobId && j.categoryId === job.categoryId)
        .slice(0, limit),
      savedJobIds
    );
  },

  async getMyJobPosts(userId: string, savedJobIds: Set<string>): Promise<JobListItem[]> {
    return this.listJobs(savedJobIds, { posterId: userId });
  },

  async getJobDetail(id: string, savedJobIds: Set<string>): Promise<JobListItem | undefined> {
    const job = await this.getByIdAsync(id);
    if (!job) return undefined;
    return toJobListItem(job, savedJobIds);
  },

  async countJobs(filters: JobFilters | JobSearchParams = {}): Promise<number> {
    if ('workTypes' in filters || 'schedules' in filters) {
      const resolved = resolveCategorySlug(filters as JobSearchParams);
      return (await fetchActiveJobs()).filter((job) => matchesSearchParams(job, resolved)).length;
    }
    const legacy = filters as JobFilters;
    const includeAllStatuses = Boolean(legacy.posterId);
    const pool = includeAllStatuses ? await fetchAllJobs() : await fetchActiveJobs();
    return pool.filter((job) => applyLegacyFilters(job, legacy)).length;
  },

  async updateJobStatus(id: string, status: JobStatus): Promise<void> {
    if (isRestBackendEnabled()) {
      const { restJobsRepository } = await import('@/lib/rest/repositories/jobs.repository');
      await restJobsRepository.updateStatus(id, status);
      return;
    }
    if (isBackendEnabled()) {
      await firebaseJobsRepository.updateStatus(id, status);
      return;
    }
    if (userJobsStore.update(id, { status })) return;
    jobModerationStore.setStatus(id, status);
  },

  async deleteJob(id: string): Promise<void> {
    if (isRestBackendEnabled()) {
      const { restJobsRepository } = await import('@/lib/rest/repositories/jobs.repository');
      await restJobsRepository.delete(id);
      return;
    }
    if (isBackendEnabled()) {
      await firebaseJobsRepository.delete(id);
      return;
    }
    // Remove a user/edited copy if present, and mark seed jobs deleted so they
    // don't reappear from the static dataset.
    userJobsStore.remove(id);
    jobModerationStore.markDeleted(id);
  },
};
