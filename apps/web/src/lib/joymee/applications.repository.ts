import type { Application, ApplicationStatus } from '@/types';

/**
 * Stub — Joymee API does not expose /applications endpoints yet.
 * Returns empty data so the Applications page renders cleanly instead of
 * showing a network error. Replace with a real adapter when the API ships.
 */
export const joymeeApplicationsRepository = {
  async apply(_jobId: string, _coverNote?: string, _expectedSalary?: number): Promise<Application> {
    throw new Error("Ariza yuborish hali REST rejimida ulanmagan");
  },

  async listAll(): Promise<Application[]> {
    return [];
  },

  async updateStatus(_id: string, _status: ApplicationStatus): Promise<Application> {
    throw new Error("Ariza statusini o'zgartirish hali REST rejimida ulanmagan");
  },
};
