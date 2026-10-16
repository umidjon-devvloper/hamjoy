import type { Report, ReportStatus } from '@/types';
import { isBackendEnabled } from '@/lib/backend/config';
import {
  firebaseReportsRepository,
  type CreateReportInput,
} from '@/lib/firebase/repositories/reports.repository';
import { authService } from '@/services/auth.service';
import { reportsStore } from '@/services/reports.store';

export type { CreateReportInput, ReportTargetType } from '@/lib/firebase/repositories/reports.repository';

export const reportsService = {
  async submitReport(input: Omit<CreateReportInput, 'reporterId'>): Promise<void> {
    const payload = {
      ...input,
      reporterId: authService.getCurrentUserId(),
    };

    if (!isBackendEnabled()) {
      reportsStore.add({
        id: `report-${Date.now()}`,
        reporterId: payload.reporterId,
        targetType: payload.targetType,
        targetId: payload.targetId,
        reason: payload.reason,
        details: payload.details,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      return;
    }

    await firebaseReportsRepository.create(payload);
  },

  async listReports(): Promise<Report[]> {
    if (!isBackendEnabled()) return reportsStore.list();
    return firebaseReportsRepository.list();
  },

  async updateReportStatus(id: string, status: ReportStatus): Promise<void> {
    if (!isBackendEnabled()) {
      const updated = reportsStore.updateStatus(id, status);
      if (!updated) throw new Error('Report not found');
      return;
    }
    await firebaseReportsRepository.updateStatus(id, status);
  },
};
