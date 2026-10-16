import type { JobStatus } from '@/types';
import { JOB_MODERATION_STORAGE_KEY } from '@/data/constants';

interface JobModerationEntry {
  status?: JobStatus;
  deleted?: boolean;
}

function readOverrides(): Record<string, JobModerationEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(JOB_MODERATION_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, JobModerationEntry>;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Record<string, JobModerationEntry>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(JOB_MODERATION_STORAGE_KEY, JSON.stringify(overrides));
}

export const jobModerationStore = {
  getOverride(jobId: string): JobModerationEntry | undefined {
    return readOverrides()[jobId];
  },

  setStatus(jobId: string, status: JobStatus): void {
    const overrides = readOverrides();
    overrides[jobId] = { ...overrides[jobId], status, deleted: false };
    writeOverrides(overrides);
  },

  markDeleted(jobId: string): void {
    const overrides = readOverrides();
    overrides[jobId] = { ...overrides[jobId], deleted: true };
    writeOverrides(overrides);
  },

  applyToJob<T extends { id: string; status: JobStatus }>(job: T): T | null {
    const override = this.getOverride(job.id);
    if (override?.deleted) return null;
    if (override?.status) return { ...job, status: override.status };
    return job;
  },
};
