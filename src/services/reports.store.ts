import type { Report } from '@/types';
import { REPORTS_STORAGE_KEY } from '@/data/constants';

function readReports(): Report[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Report[];
  } catch {
    return [];
  }
}

function writeReports(reports: Report[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

export const reportsStore = {
  list(): Report[] {
    return readReports().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  add(report: Report): Report {
    const reports = readReports();
    reports.unshift(report);
    writeReports(reports);
    return report;
  },

  updateStatus(id: string, status: Report['status']): Report | undefined {
    const reports = readReports();
    const index = reports.findIndex((r) => r.id === id);
    if (index < 0) return undefined;
    reports[index] = { ...reports[index], status };
    writeReports(reports);
    return reports[index];
  },
};
