export type NotificationKind =
  | 'message'
  | 'application'
  | 'application_update'
  | 'job_match'
  | 'review_received'
  | 'system';

/** A feed notification (distinct from the user's NotificationSettings prefs). */
export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
