import type { Favorite } from '@/types';
import { CURRENT_USER_ID } from './constants';

export const favorites: Favorite[] = [
  {
    id: 'fav-1',
    userId: CURRENT_USER_ID,
    jobId: 'job-1',
    createdAt: '2026-06-20T10:00:00.000Z',
  },
  {
    id: 'fav-2',
    userId: CURRENT_USER_ID,
    jobId: 'job-4',
    createdAt: '2026-06-22T14:30:00.000Z',
  },
];
