import type { Job, JobStatus, MapCoordinates } from '@/types';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { apiFetch } from '@/lib/api/http-client';
import type { PaginatedResponse } from '@/lib/api/types';

/** Cap on auto-paginated fetches so REST mode never loads unbounded rows. */
const MAX_PAGES = 12;

interface RestLocation {
  label: string;
  is_remote: boolean;
  lat?: number;
  lng?: number;
  city?: string;
  country?: string;
}

interface RestJob {
  id: string;
  title: string;
  company_id: string;
  company_name: string;
  company_logo: string;
  category_id: string;
  poster_id: string;
  description: string;
  requirements: string[];
  status: JobStatus;
  work_type: Job['workType'];
  schedule_type: Job['scheduleType'];
  schedule_pattern: Job['schedulePattern'];
  location: RestLocation;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  skills: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  responsibilities?: string[];
  contact_phone?: string;
  address?: string;
  district?: string;
  distance?: number | null;
}

/** Follow DRF `next` links (up to MAX_PAGES) and return all rows. */
async function fetchAllPages(firstPath: string): Promise<RestJob[]> {
  const rows: RestJob[] = [];
  let path: string | null = firstPath;
  let pages = 0;
  while (path && pages < MAX_PAGES) {
    const page: PaginatedResponse<RestJob> = await apiFetch<PaginatedResponse<RestJob>>(path);
    rows.push(...page.results);
    pages += 1;
    // `next` is an absolute URL; strip the origin so apiFetch can re-prefix it.
    path = page.next ? page.next.replace(/^https?:\/\/[^/]+/, '') : null;
  }
  return rows;
}

function mapJob(data: RestJob): Job {
  return {
    id: String(data.id),
    title: data.title,
    companyId: data.company_id,
    companyName: data.company_name,
    companyLogo: data.company_logo,
    categoryId: String(data.category_id),
    posterId: String(data.poster_id),
    description: data.description,
    requirements: data.requirements ?? [],
    status: data.status,
    workType: data.work_type,
    scheduleType: data.schedule_type,
    schedulePattern: data.schedule_pattern,
    location: {
      label: data.location.label,
      isRemote: data.location.is_remote,
      lat: data.location.lat,
      lng: data.location.lng,
      city: data.location.city,
      country: data.location.country,
    },
    salaryMin: data.salary_min,
    salaryMax: data.salary_max,
    salaryCurrency: data.salary_currency,
    skills: data.skills ?? [],
    isFeatured: data.is_featured,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    responsibilities: data.responsibilities,
    contactPhone: data.contact_phone,
    address: data.address,
    district: data.district,
  };
}

function mapJobPayload(job: Job): Record<string, unknown> {
  return {
    title: job.title,
    company_id: job.companyId,
    company_name: job.companyName,
    company_logo: job.companyLogo,
    category_id: job.categoryId,
    description: job.description,
    requirements: job.requirements,
    status: job.status,
    work_type: job.workType,
    schedule_type: job.scheduleType,
    schedule_pattern: job.schedulePattern,
    location: {
      label: job.location.label,
      is_remote: job.location.isRemote,
      lat: job.location.lat,
      lng: job.location.lng,
      city: job.location.city,
      country: job.location.country,
    },
    salary_min: job.salaryMin,
    salary_max: job.salaryMax,
    salary_currency: job.salaryCurrency,
    skills: job.skills,
    is_featured: job.isFeatured,
    responsibilities: job.responsibilities,
    contact_phone: job.contactPhone,
    address: job.address,
    district: job.district,
  };
}

export const restJobsRepository = {
  async getAll(): Promise<Job[]> {
    const rows = await fetchAllPages(`${API_ENDPOINTS.jobs}?page_size=100`);
    return rows.map(mapJob);
  },

  /** Server-side geo search — returns jobs nearest-first with distance in km. */
  async getNearby(
    center: MapCoordinates,
    radiusKm: number
  ): Promise<Array<{ job: Job; distanceKm?: number }>> {
    const path = `${API_ENDPOINTS.jobs}?near=${center.lat},${center.lng}&radius_km=${radiusKm}&page_size=100`;
    const rows = await fetchAllPages(path);
    return rows.map((row) => ({
      job: mapJob(row),
      distanceKm: row.distance ?? undefined,
    }));
  },

  async getById(id: string): Promise<Job | undefined> {
    try {
      const data = await apiFetch<RestJob>(API_ENDPOINTS.job(id));
      return mapJob(data);
    } catch {
      return undefined;
    }
  },

  async insert(job: Job): Promise<Job> {
    const data = await apiFetch<RestJob>(API_ENDPOINTS.jobs, {
      method: 'POST',
      body: JSON.stringify(mapJobPayload(job)),
    });
    return mapJob(data);
  },

  async update(id: string, job: Job): Promise<Job> {
    const data = await apiFetch<RestJob>(API_ENDPOINTS.job(id), {
      method: 'PATCH',
      body: JSON.stringify(mapJobPayload(job)),
    });
    return mapJob(data);
  },

  async updateStatus(id: string, status: JobStatus): Promise<void> {
    await apiFetch(API_ENDPOINTS.job(id), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async delete(id: string): Promise<void> {
    await apiFetch(API_ENDPOINTS.job(id), { method: 'DELETE' });
  },
};
