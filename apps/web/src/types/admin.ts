import type { JobStatus } from './enums';
import type { Category } from './category';
import type { User } from './user';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type ReportTargetType = 'job' | 'user' | 'message';

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  createdAt: string;
}

export interface LocationRecord {
  id: string;
  label: string;
  slug: string;
  isActive: boolean;
}

export interface AdminDashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalUsers: number;
  totalChats: number;
  pendingPosts: number;
  pendingReports: number;
}

export interface AdminJobRow {
  id: string;
  title: string;
  companyName: string;
  posterId: string;
  posterName: string;
  status: JobStatus;
  createdAt: string;
  categoryId: string;
}

export interface AdminUserRow extends User {
  blocked: boolean;
}

export interface CategoryInput {
  name: string;
  slug: string;
  icon: string;
}

export type CategoryUpdateInput = Partial<CategoryInput>;

export type { Category };
