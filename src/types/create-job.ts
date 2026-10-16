import type { WorkType, ScheduleType } from './enums';

export type CreateJobStep = 1 | 2 | 3 | 4;

export interface CreateJobFormData {
  title: string;
  categoryId: string;
  workType: WorkType | '';
  scheduleType: ScheduleType | '';
  salaryMin: string;
  salaryMax: string;
  description: string;
  responsibilities: string;
  requirements: string;
  phone: string;
  address: string;
  cityDistrict: string;
  mapLat?: number;
  mapLng?: number;
}

export type CreateJobFormErrors = Partial<Record<keyof CreateJobFormData, string>>;

export const EMPTY_CREATE_JOB_FORM: CreateJobFormData = {
  title: '',
  categoryId: '',
  workType: '',
  scheduleType: '',
  salaryMin: '',
  salaryMax: '',
  description: '',
  responsibilities: '',
  requirements: '',
  phone: '',
  address: '',
  cityDistrict: '',
};
