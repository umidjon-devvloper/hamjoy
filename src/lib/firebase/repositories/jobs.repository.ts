import type { Job } from '@/types';
import type { JobStatus } from '@/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getCountFromServer,
} from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase/client';
import { mapJobRow, mapJobToRow } from '@/lib/firebase/mappers';
import type { JobRow } from '@/lib/firebase/document.types';

const COLLECTION = 'jobs';

function jobRef(id: string) {
  return doc(getFirestoreDb(), COLLECTION, id);
}

function rowFromSnap(id: string, data: Record<string, unknown>): JobRow {
  return { id, ...data } as JobRow;
}

export const firebaseJobsRepository = {
  async getAll(): Promise<Job[]> {
    const snap = await getDocs(collection(getFirestoreDb(), COLLECTION));
    return snap.docs
      .map((d) => mapJobRow(rowFromSnap(d.id, d.data())))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getActive(): Promise<Job[]> {
    const q = query(collection(getFirestoreDb(), COLLECTION), where('status', '==', 'active'));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => mapJobRow(rowFromSnap(d.id, d.data())))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getById(id: string): Promise<Job | undefined> {
    const snap = await getDoc(jobRef(id));
    if (!snap.exists()) return undefined;
    return mapJobRow(rowFromSnap(snap.id, snap.data()));
  },

  async insert(job: Job): Promise<Job> {
    const row = mapJobToRow(job);
    await setDoc(jobRef(job.id), row);
    return mapJobRow(row);
  },

  async updateStatus(id: string, status: JobStatus): Promise<Job> {
    const updatedAt = new Date().toISOString();
    await updateDoc(jobRef(id), { status, updated_at: updatedAt });
    const updated = await this.getById(id);
    if (!updated) throw new Error('Job not found');
    return updated;
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(jobRef(id));
  },

  async countByStatus(status?: JobStatus): Promise<number> {
    const base = collection(getFirestoreDb(), COLLECTION);
    const q = status ? query(base, where('status', '==', status)) : base;
    const snap = await getCountFromServer(q);
    return snap.data().count;
  },
};
