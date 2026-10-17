import type { Application, ApplicationStatus } from '@/types';
import { joymeeTokens } from './client';

const base = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';

async function authHeader(): Promise<Record<string, string>> {
  const token = await joymeeTokens.getAccess();
  return token ? { authorization: `Bearer ${token}`, 'content-type': 'application/json' } : { 'content-type': 'application/json' };
}

interface JoymeeAppRow {
  id: string;
  listingId: string;
  userId: string;
  coverLetter: string | null;
  status: string; // Joymee uses pending|viewed|accepted|rejected
  createdAt: string;
}

const toUiStatus = (s: string): ApplicationStatus => {
  switch (s) {
    case 'viewed': return 'reviewing';
    case 'accepted': return 'accepted';
    case 'rejected': return 'rejected';
    default: return 'pending';
  }
};

const toApiStatus = (s: ApplicationStatus): 'pending' | 'viewed' | 'accepted' | 'rejected' => {
  switch (s) {
    case 'reviewing':
    case 'shortlisted':
      return 'viewed';
    case 'accepted': return 'accepted';
    case 'rejected':
    case 'withdrawn':
      return 'rejected';
    default: return 'pending';
  }
};

function mapRow(r: JoymeeAppRow): Application {
  return {
    id: r.id,
    jobId: r.listingId,
    applicantId: r.userId,
    coverNote: r.coverLetter ?? '',
    status: toUiStatus(r.status),
    createdAt: r.createdAt,
  };
}

export const joymeeApplicationsRepository = {
  async apply(jobId: string, coverNote?: string, _expectedSalary?: number): Promise<Application> {
    const res = await fetch(`${base()}/applications`, {
      method: 'POST',
      headers: await authHeader(),
      body: JSON.stringify({ listingId: jobId, coverLetter: coverNote }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? `Ariza berib bo'lmadi (${res.status})`);
    }
    return mapRow(await res.json());
  },

  async listAll(): Promise<Application[]> {
    const res = await fetch(`${base()}/applications/mine`, { headers: await authHeader() });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{ app: JoymeeAppRow }> | JoymeeAppRow[];
    // Returned either as joined rows or flat; normalise.
    return rows.map((r) => mapRow('app' in (r as object) ? (r as { app: JoymeeAppRow }).app : (r as JoymeeAppRow)));
  },

  async updateStatus(id: string, status: ApplicationStatus): Promise<Application> {
    const res = await fetch(`${base()}/applications/${id}/status`, {
      method: 'PATCH',
      headers: await authHeader(),
      body: JSON.stringify({ status: toApiStatus(status) }),
    });
    if (!res.ok) throw new Error(`Status o'zgartirib bo'lmadi (${res.status})`);
    return mapRow(await res.json());
  },
};
