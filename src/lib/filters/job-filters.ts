import type { ScheduleType, WorkType } from '@/types';

export interface FilterOption {
  id: string;
  label: string;
}

export const JOB_FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All Jobs' },
  { id: 'remote', label: 'Remote' },
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'freelance', label: 'Freelance' },
];

export function resolveFilterId(filterId: string): {
  workType?: WorkType;
  scheduleType?: ScheduleType;
} {
  switch (filterId) {
    case 'remote':
      return { workType: 'remote' };
    case 'full-time':
      return { scheduleType: 'full-time' };
    case 'part-time':
      return { scheduleType: 'part-time' };
    case 'freelance':
      return { scheduleType: 'freelance' };
    default:
      return {};
  }
}
