import type { ScheduleType, WorkType } from './enums';

/** User-facing work type filters */
export type WorkTypeFilter =
  | 'full-time'
  | 'part-time'
  | 'temporary'
  | 'remote'
  | 'flexible';

/** Shift / hours pattern */
export type ScheduleFilter =
  | 'standard'
  | 'flexible-hours'
  | 'weekends'
  | 'night-shift';

export type JobSortOption = 'newest' | 'salary-desc' | 'salary-asc';

export type SearchViewMode = 'list' | 'map';

export interface JobSearchParams {
  /** Search by job title */
  query?: string;
  categoryId?: string;
  categorySlug?: string;
  /** Location label or city match */
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  workTypes?: WorkTypeFilter[];
  schedules?: ScheduleFilter[];
  sort?: JobSortOption;
}

export interface SalaryRangeOption {
  id: string;
  label: string;
  min: number;
  max: number;
}

export interface LocationOption {
  value: string;
  label: string;
}

/** @deprecated Use JobSearchParams — kept for my-jobs and simple listings */
export interface JobFilters {
  query?: string;
  categoryId?: string;
  categorySlug?: string;
  scheduleType?: ScheduleType | 'all';
  workType?: WorkType | 'all';
  filterId?: string;
  posterId?: string;
  status?: import('./enums').JobStatus;
}
