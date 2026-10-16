import type { Timestamp, UUID } from './common';

export type NotificationType =
  | 'new_message'
  | 'application_received'
  | 'application_status_changed'
  | 'listing_approved'
  | 'listing_rejected'
  | 'system';

export interface AppNotification {
  id: UUID;
  userId: UUID;
  type: NotificationType;
  payload: Record<string, unknown>;
  readAt: Timestamp | null;
  createdAt: Timestamp;
}
