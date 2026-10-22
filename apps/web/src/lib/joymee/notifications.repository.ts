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
    case 'review_received':
      return 'review_received';
    case 'listing_sold':
      return 'system';
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
    case 'review_received': return 'Yangi baho';
    case 'listing_sold': return "E'lon sotildi";
    default: return 'Yangilik';
  }
};

function bodyFor(n: JoymeeNotif): string | undefined {
  const p = n.payload ?? {};
  if (n.type === 'review_received') {
    const rating = typeof p.rating === 'number' ? (p.rating as number) : 0;
    const preview = typeof p.preview === 'string' ? (p.preview as string).trim() : '';
    const base = `${rating} yulduz`;
    return preview ? `${base} · "${preview}"` : base;
  }
  if (n.type === 'listing_sold') {
    return typeof p.title === 'string' ? (p.title as string) : undefined;
  }
  return typeof p.body === 'string' ? (p.body as string) : undefined;
}

function linkFor(n: JoymeeNotif): string | undefined {
  const p = n.payload ?? {};
  if (typeof p.link === 'string') return p.link as string;
  if (n.type === 'review_received') {
    const toUser = typeof p.toUserId === 'string' ? (p.toUserId as string) : n.userId;
    return `/u/${toUser}`;
  }
  if (n.type === 'new_message' && typeof p.chatId === 'string') return `/chat/${p.chatId}`;
  if (n.type === 'listing_sold' && typeof p.listingId === 'string') return `/listing/${p.listingId}`;
  return undefined;
}

function mapRow(n: JoymeeNotif): AppNotification {
  return {
    id: n.id,
    kind: toKind(n.type),
    title: titleFor(n),
    body: bodyFor(n),
    link: linkFor(n),
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
