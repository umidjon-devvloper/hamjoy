import type { Application, ApplicationStatus } from '@/types';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { apiFetch } from '@/lib/api/http-client';
import type { PaginatedResponse } from '@/lib/api/types';

interface RestApplication {
  id: number | string;
  job_id: number | string;
  job_title?: string;
  applicant_id: number | string;
  applicant_name?: string;
  cover_note?: string;
  expected_salary?: number | null;
  status: ApplicationStatus;
  created_at: string;
}

function mapApplication(a: RestApplication): Application {
  return {
    id: String(a.id),
    jobId: String(a.job_id),
    jobTitle: a.job_title,
    applicantId: String(a.applicant_id),
    applicantName: a.applicant_name,
    coverNote: a.cover_note,
    expectedSalary: a.expected_salary ?? undefined,
    status: a.status,
    createdAt: a.created_at,
  };
}

export const restApplicationsRepository = {
  async apply(jobId: string, coverNote?: string, expectedSalary?: number): Promise<Application> {
    const data = await apiFetch<RestApplication>(API_ENDPOINTS.applications, {
      method: 'POST',
      body: JSON.stringify({
        job_id: jobId,
        cover_note: coverNote ?? '',
        expected_salary: expectedSalary,
      }),
    });
    return mapApplication(data);
  },

  // Returns applications visible to the user (as applicant AND as job poster).
  async listAll(): Promise<Application[]> {
    const data = await apiFetch<PaginatedResponse<RestApplication>>(API_ENDPOINTS.applications);
    return data.results.map(mapApplication);
  },

  async updateStatus(id: string, status: ApplicationStatus): Promise<Application> {
    const data = await apiFetch<RestApplication>(`${API_ENDPOINTS.applications}${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return mapApplication(data);
  },
};
