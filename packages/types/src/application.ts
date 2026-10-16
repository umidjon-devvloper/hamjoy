import type { Timestamp, UUID } from './common';

export type ApplicationStatus = 'pending' | 'viewed' | 'accepted' | 'rejected';

export interface Application {
  id: UUID;
  listingId: UUID;
  userId: UUID;
  coverLetter: string | null;
  status: ApplicationStatus;
  createdAt: Timestamp;
}
