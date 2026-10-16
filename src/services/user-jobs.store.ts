import type { Job } from '@/types';
import { USER_JOBS_STORAGE_KEY } from '@/data/constants';

function readJobs(): Job[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USER_JOBS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Job[];
  } catch {
    return [];
  }
}

function writeJobs(jobs: Job[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_JOBS_STORAGE_KEY, JSON.stringify(jobs));
}

export const userJobsStore = {
  getAll(): Job[] {
    return readJobs();
  },

  add(job: Job): Job {
    const jobs = readJobs();
    jobs.unshift(job);
    writeJobs(jobs);
    return job;
  },

  getById(id: string): Job | undefined {
    return readJobs().find((j) => j.id === id);
  },

  getByPoster(posterId: string): Job[] {
    return readJobs().filter((j) => j.posterId === posterId);
  },

  update(id: string, patch: Partial<Job>): Job | undefined {
    const jobs = readJobs();
    const index = jobs.findIndex((j) => j.id === id);
    if (index < 0) return undefined;
    jobs[index] = { ...jobs[index], ...patch, updatedAt: new Date().toISOString() };
    writeJobs(jobs);
    return jobs[index];
  },

  remove(id: string): boolean {
    const jobs = readJobs().filter((j) => j.id !== id);
    if (jobs.length === readJobs().length) return false;
    writeJobs(jobs);
    return true;
  },
};
