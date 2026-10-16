import type { Application, ApplicationStatus } from '@/types';
import { APPLICATIONS_STORAGE_KEY } from '@/data/constants';
import { isRestBackendEnabled } from '@/lib/api/config';
import { authService } from '@/services/auth.service';
import { jobsService } from '@/services/jobs.service';
import { notificationsService } from '@/services/notifications.service';

/** Demo applicants (from other users) to the demo poster's jobs — so the
 *  employer "Nomzodlar" view is populated in mock mode. */
function seed(): Application[] {
  const iso = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
  return [
    {
      id: 'app-seed-1',
      jobId: 'job-4',
      jobTitle: 'Backend Dasturchi (Python/Django)',
      applicantId: 'user-sarah',
      applicantName: 'Dilnoza Yusupova',
      coverNote: '5 yillik Django va PostgreSQL tajribam bor, jamoada ishlashga tayyorman.',
      status: 'pending',
      createdAt: iso(1),
    },
    {
      id: 'app-seed-2',
      jobId: 'job-4',
      jobTitle: 'Backend Dasturchi (Python/Django)',
      applicantId: 'user-mike',
      applicantName: 'Jasur Toshmatov',
      coverNote: 'Fintech sohasida 3 yil tajriba, REST API’larni loyihalaganman.',
      status: 'reviewing',
      createdAt: iso(2),
    },
    {
      id: 'app-seed-3',
      jobId: 'job-7',
      jobTitle: 'UI Dizayner (Shartnoma asosida)',
      applicantId: 'user-emily',
      applicantName: 'Malika Olimova',
      coverNote: 'Mobil ilovalar uchun UI portfoliom bor.',
      status: 'pending',
      createdAt: iso(3),
    },
  ];
}

function readStore(): Application[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Application[];
  } catch {
    /* fall through to seed */
  }
  const seeded = seed();
  writeStore(seeded);
  return seeded;
}

function writeStore(items: Application[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(items));
}

async function restRepo() {
  const { restApplicationsRepository } = await import(
    '@/lib/rest/repositories/applications.repository'
  );
  return restApplicationsRepository;
}

export const applicationsService = {
  /** Sync set of job ids the current user has applied to (mock only). */
  getAppliedJobIds(): Set<string> {
    const userId = authService.getOptionalUserId();
    return new Set(
      readStore()
        .filter((a) => !userId || a.applicantId === userId)
        .map((a) => a.jobId)
    );
  },

  async getMyApplications(): Promise<Application[]> {
    const userId = authService.getOptionalUserId();
    if (isRestBackendEnabled()) {
      const all = await (await restRepo()).listAll();
      return all
        .filter((a) => !userId || a.applicantId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return readStore()
      .filter((a) => !userId || a.applicantId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async hasApplied(jobId: string): Promise<boolean> {
    return (await this.getMyApplications()).some((a) => a.jobId === jobId);
  },

  /** Applications submitted to jobs the current user posted (employer view). */
  async getApplicantsForMyJobs(): Promise<Application[]> {
    const userId = authService.getOptionalUserId();
    if (isRestBackendEnabled()) {
      const all = await (await restRepo()).listAll();
      return all
        .filter((a) => a.applicantId !== userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return readStore()
      .filter((a) => a.applicantId !== userId)
      .filter((a) => jobsService.getById(a.jobId)?.posterId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async updateStatus(id: string, status: ApplicationStatus): Promise<void> {
    if (isRestBackendEnabled()) {
      await (await restRepo()).updateStatus(id, status);
      return;
    }
    writeStore(readStore().map((a) => (a.id === id ? { ...a, status } : a)));
  },

  async apply(jobId: string, coverNote?: string, expectedSalary?: number): Promise<Application> {
    if (isRestBackendEnabled()) {
      return (await restRepo()).apply(jobId, coverNote, expectedSalary);
    }

    const userId = authService.getCurrentUserId();
    const store = readStore();
    const existing = store.find((a) => a.jobId === jobId && a.applicantId === userId);
    if (existing) return existing;

    const job = await jobsService.getByIdAsync(jobId);
    const application: Application = {
      id: `app-${Date.now()}`,
      jobId,
      jobTitle: job?.title,
      applicantId: userId,
      applicantName: authService.getCurrentUser().name,
      coverNote,
      expectedSalary,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    writeStore([application, ...store]);
    notificationsService.pushLocal(
      'application',
      'Arizangiz yuborildi ✅',
      job?.title ? `"${job.title}" uchun ariza qabul qilindi.` : undefined,
      '/applications'
    );
    return application;
  },
};
