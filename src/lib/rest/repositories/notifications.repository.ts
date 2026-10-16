import type { AppNotification, NotificationKind } from '@/types';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { apiFetch } from '@/lib/api/http-client';
import type { PaginatedResponse } from '@/lib/api/types';

interface RestNotification {
  id: number | string;
  kind: NotificationKind;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  created_at: string;
}

function mapNotification(n: RestNotification): AppNotification {
  return {
    id: String(n.id),
    kind: n.kind,
    title: n.title,
    body: n.body || undefined,
    link: n.link || undefined,
    read: n.read,
    createdAt: n.created_at,
  };
}

export const restNotificationsRepository = {
  async list(): Promise<AppNotification[]> {
    const data = await apiFetch<PaginatedResponse<RestNotification>>(API_ENDPOINTS.notifications);
    return data.results.map(mapNotification);
  },

  async unreadCount(): Promise<number> {
    const data = await apiFetch<{ count: number }>(API_ENDPOINTS.notificationsUnread);
    return data.count ?? 0;
  },

  async markAllRead(): Promise<void> {
    await apiFetch(API_ENDPOINTS.notificationsReadAll, { method: 'POST' });
  },

  async markRead(id: string): Promise<void> {
    await apiFetch(`${API_ENDPOINTS.notifications}${id}/read/`, { method: 'POST' });
  },
};
