import type { AppNotification, NotificationKind } from '@/types';
import { joymeeTokens } from './client';

const base = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';

async function authHeader(): Promise<Record<string, string>> {
  const token = await joymeeTokens.getAccess();
  return token ? { authorization: `Bearer ${token}` } : {};
}

interface JoymeeNotif {
  id: string;
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

const toKind = (t: string): NotificationKind => {
  switch (t) {
    case 'new_message': return 'message';
    case 'application_received':
    case 'application_status_changed':
      return 'application_update';
    case 'listing_approved':
    case 'listing_rejected':
      return 'application';
    default: return 'system';
  }
};

const titleFor = (n: JoymeeNotif): string => {
  switch (n.type) {
    case 'new_message': return 'Yangi xabar';
    case 'application_received': return "Yangi ariza";
    case 'application_status_changed': return 'Arizangiz holati o\'zgardi';
    case 'listing_approved': return "E'loningiz tasdiqlandi";
    case 'listing_rejected': return "E'loningiz rad etildi";
    default: return 'Yangilik';
  }
};

function mapRow(n: JoymeeNotif): AppNotification {
  const body = typeof n.payload?.body === 'string' ? (n.payload.body as string) : undefined;
  const link = typeof n.payload?.link === 'string' ? (n.payload.link as string) : undefined;
  return {
    id: n.id,
    kind: toKind(n.type),
    title: titleFor(n),
    body,
    link,
    read: n.readAt != null,
    createdAt: n.createdAt,
  };
}

export const joymeeNotificationsRepository = {
  async list(): Promise<AppNotification[]> {
    const res = await fetch(`${base()}/notifications`, { headers: await authHeader() });
    if (!res.ok) return [];
    const rows = (await res.json()) as JoymeeNotif[];
    return rows.map(mapRow);
  },

  async unreadCount(): Promise<number> {
    const res = await fetch(`${base()}/notifications/unread-count`, { headers: await authHeader() });
    if (!res.ok) return 0;
    const body = (await res.json()) as { count: number };
    return body.count;
  },

  async markAllRead(): Promise<void> {
    await fetch(`${base()}/notifications/read-all`, { method: 'POST', headers: await authHeader() });
  },

  async markRead(id: string): Promise<void> {
    await fetch(`${base()}/notifications/${id}/read`, { method: 'POST', headers: await authHeader() });
  },
};
