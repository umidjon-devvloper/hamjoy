import type { Job } from '@/types';
import type {
  JobSearchParams,
  JobSortOption,
  ScheduleFilter,
  WorkTypeFilter,
  SalaryRangeOption,
} from '@/types';

export const DEFAULT_SEARCH_PARAMS: JobSearchParams = {
  query: '',
  sort: 'newest',
  workTypes: [],
  schedules: [],
};

export const WORK_TYPE_FILTER_OPTIONS: { id: WorkTypeFilter; label: string }[] = [
  { id: 'full-time', label: 'Toʻliq stavka' },
  { id: 'part-time', label: 'Yarim stavka' },
  { id: 'temporary', label: 'Vaqtinchalik' },
  { id: 'remote', label: 'Masofaviy' },
  { id: 'flexible', label: 'Moslashuvchan' },
];

export const SCHEDULE_FILTER_OPTIONS: { id: ScheduleFilter; label: string }[] = [
  { id: 'standard', label: 'Standart (9–18)' },
  { id: 'flexible-hours', label: 'Moslashuvchan' },
  { id: 'weekends', label: 'Dam olish kunlari' },
  { id: 'night-shift', label: 'Tungi smena' },
];

export const SORT_OPTIONS: { id: JobSortOption; label: string }[] = [
  { id: 'newest', label: 'Eng yangi' },
  { id: 'salary-desc', label: 'Yuqori maosh' },
  { id: 'salary-asc', label: 'Past maosh' },
];

// Monthly USD ranges (matches the Uzbekistan-market dataset).
export const SALARY_RANGE_OPTIONS: SalaryRangeOption[] = [
  { id: 'any', label: 'Istalgan maosh', min: 0, max: Infinity },
  { id: 'under-500', label: '$500 gacha', min: 0, max: 500 },
  { id: '500-1000', label: '$500 – $1000', min: 500, max: 1000 },
  { id: '1000-2000', label: '$1000 – $2000', min: 1000, max: 2000 },
  { id: '2000-plus', label: '$2000+', min: 2000, max: Infinity },
];

export function matchesWorkTypeFilter(job: Job, filter: WorkTypeFilter): boolean {
  switch (filter) {
    case 'full-time':
      return job.scheduleType === 'full-time';
    case 'part-time':
      return job.scheduleType === 'part-time';
    case 'temporary':
      return job.scheduleType === 'contract' || job.scheduleType === 'freelance';
    case 'remote':
      return job.workType === 'remote' || job.location.isRemote;
    case 'flexible':
      return (
        job.workType === 'hybrid' ||
        job.schedulePattern === 'flexible-hours' ||
        job.scheduleType === 'freelance'
      );
    default:
      return true;
  }
}

export function isAnnualSalary(job: Job): boolean {
  return job.salaryMin >= 1000;
}

/** Comparable value for filtering/sorting — monthly salaryMax in the dataset. */
export function getComparableSalary(job: Job): number {
  return job.salaryMax;
}

export function matchesSearchParams(job: Job, params: JobSearchParams): boolean {
  if (params.query?.trim()) {
    const q = params.query.toLowerCase().trim();
    if (!job.title.toLowerCase().includes(q)) return false;
  }

  if (params.categoryId && job.categoryId !== params.categoryId) return false;

  if (params.location && params.location !== 'all') {
    const loc = params.location.toLowerCase();
    const matches =
      job.location.label.toLowerCase().includes(loc) ||
      job.location.city?.toLowerCase().includes(loc) ||
      job.location.country?.toLowerCase().includes(loc) ||
      (loc === 'remote' && job.location.isRemote);
    if (!matches) return false;
  }

  if (params.salaryMin !== undefined || params.salaryMax !== undefined) {
    const min = params.salaryMin ?? 0;
    const max = params.salaryMax ?? Infinity;
    const comparable = getComparableSalary(job);
    if (comparable < min || comparable > max) return false;
  }

  if (params.workTypes && params.workTypes.length > 0) {
    const matchesAny = params.workTypes.some((wt) => matchesWorkTypeFilter(job, wt));
    if (!matchesAny) return false;
  }

  if (params.schedules && params.schedules.length > 0) {
    if (!params.schedules.includes(job.schedulePattern)) return false;
  }

  return true;
}

export function sortJobs(jobs: Job[], sort: JobSortOption = 'newest'): Job[] {
  const sorted = [...jobs];
  switch (sort) {
    case 'salary-desc':
      return sorted.sort((a, b) => getComparableSalary(b) - getComparableSalary(a));
    case 'salary-asc':
      return sorted.sort((a, b) => getComparableSalary(a) - getComparableSalary(b));
    case 'newest':
    default:
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

export function countActiveFilters(params: JobSearchParams): number {
  let count = 0;
  if (params.query?.trim()) count++;
  if (params.categoryId) count++;
  if (params.location && params.location !== 'all') count++;
  if (params.salaryMin !== undefined || (params.salaryMax !== undefined && params.salaryMax < Infinity))
    count++;
  if (params.workTypes?.length) count++;
  if (params.schedules?.length) count++;
  return count;
}
