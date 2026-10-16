import type { Report, ReportStatus } from '@/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  getCountFromServer,
} from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase/client';
import type { ReportRow } from '@/lib/firebase/document.types';

export type ReportTargetType = 'job' | 'user' | 'message';

export interface CreateReportInput {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
}

const COLLECTION = 'reports';

function mapReportRow(row: ReportRow): Report {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    targetType: row.target_type as Report['targetType'],
    targetId: row.target_id,
    reason: row.reason,
    details: row.details ?? undefined,
    status: row.status as ReportStatus,
    createdAt: row.created_at,
  };
}

function reportRef(id: string) {
  return doc(getFirestoreDb(), COLLECTION, id);
}

export const firebaseReportsRepository = {
  async create(input: CreateReportInput): Promise<Report> {
    const id = `report-${Date.now()}`;
    const row: ReportRow = {
      id,
      reporter_id: input.reporterId,
      target_type: input.targetType,
      target_id: input.targetId,
      reason: input.reason,
      details: input.details ?? null,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    await setDoc(reportRef(id), row);
    return mapReportRow(row);
  },

  async list(): Promise<Report[]> {
    const snap = await getDocs(collection(getFirestoreDb(), COLLECTION));
    return snap.docs
      .map((d) => mapReportRow({ id: d.id, ...d.data() } as ReportRow))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async updateStatus(id: string, status: ReportStatus): Promise<Report> {
    const ref = reportRef(id);
    await updateDoc(ref, { status });
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Report not found');
    return mapReportRow({ id: snap.id, ...snap.data() } as ReportRow);
  },

  async countPending(): Promise<number> {
    const q = query(collection(getFirestoreDb(), COLLECTION), where('status', '==', 'pending'));
    const snap = await getCountFromServer(q);
    return snap.data().count;
  },
};
