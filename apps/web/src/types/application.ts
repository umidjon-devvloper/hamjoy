export type ApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'shortlisted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  jobId: string;
  jobTitle?: string;
  applicantId: string;
  applicantName?: string;
  coverNote?: string;
  expectedSalary?: number;
  status: ApplicationStatus;
  createdAt: string;
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Koʻrib chiqilmoqda',
  reviewing: 'Tekshirilmoqda',
  shortlisted: 'Saralandi',
  accepted: 'Qabul qilindi',
  rejected: 'Rad etildi',
  withdrawn: 'Bekor qilindi',
};
