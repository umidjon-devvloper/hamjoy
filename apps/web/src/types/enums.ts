export type JobStatus = 'draft' | 'pending' | 'active' | 'closed';

export type WorkType = 'remote' | 'onsite' | 'hybrid';

export type ScheduleType = 'full-time' | 'part-time' | 'freelance' | 'contract';

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: 'Qoralama',
  pending: 'Koʻrib chiqilmoqda',
  active: 'Faol',
  closed: 'Yopilgan',
};

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  remote: 'Masofaviy',
  onsite: 'Ofisda',
  hybrid: 'Gibrid',
};

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  'full-time': 'Toʻliq stavka',
  'part-time': 'Yarim stavka',
  freelance: 'Frilans',
  contract: 'Shartnoma',
};
