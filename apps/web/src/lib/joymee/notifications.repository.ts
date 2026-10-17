import type { AppNotification } from '@/types';

/**
 * Stub — Joymee API has a notifications table but no HTTP endpoints yet.
 * Returns empty / no-op so the UI stays silent instead of logging 404s.
 */
export const joymeeNotificationsRepository = {
  async list(): Promise<AppNotification[]> {
    return [];
  },

  async unreadCount(): Promise<number> {
    return 0;
  },

  async markAllRead(): Promise<void> {
    /* no-op */
  },

  async markRead(_id: string): Promise<void> {
    /* no-op */
  },
};
