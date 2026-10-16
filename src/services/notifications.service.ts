import type { AppNotification, NotificationKind } from '@/types';
import { NOTIFICATIONS_STORAGE_KEY } from '@/data/constants';
import { isRestBackendEnabled } from '@/lib/api/config';

function seed(): AppNotification[] {
  const now = Date.now();
  const iso = (minsAgo: number) => new Date(now - minsAgo * 60000).toISOString();
  return [
    {
      id: 'seed-welcome',
      kind: 'system',
      title: 'HamJoy’ga xush kelibsiz! 🎉',
      body: 'Yaqinimdagi ishlar bo‘limidan eng yaqin ishlarni toping.',
      link: '/home/ish/xarita',
      read: false,
      createdAt: iso(30),
    },
    {
      id: 'seed-match',
      kind: 'job_match',
      title: 'Sizga mos 5 ta yangi ish',
      body: 'Dizayn va dasturlash bo‘yicha yangi e’lonlar.',
      link: '/search',
      read: false,
      createdAt: iso(180),
    },
  ];
}

function readStore(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppNotification[];
  } catch {
    /* fall through to seed */
  }
  const seeded = seed();
  writeStore(seeded);
  return seeded;
}

function writeStore(items: AppNotification[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
}

async function restRepo() {
  const { restNotificationsRepository } = await import(
    '@/lib/rest/repositories/notifications.repository'
  );
  return restNotificationsRepository;
}

export const notificationsService = {
  async list(): Promise<AppNotification[]> {
    if (isRestBackendEnabled()) return (await restRepo()).list();
    return readStore().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async unreadCount(): Promise<number> {
    if (isRestBackendEnabled()) return (await restRepo()).unreadCount();
    return readStore().filter((n) => !n.read).length;
  },

  async markAllRead(): Promise<void> {
    if (isRestBackendEnabled()) {
      await (await restRepo()).markAllRead();
      return;
    }
    writeStore(readStore().map((n) => ({ ...n, read: true })));
  },

  async markRead(id: string): Promise<void> {
    if (isRestBackendEnabled()) {
      await (await restRepo()).markRead(id);
      return;
    }
    writeStore(readStore().map((n) => (n.id === id ? { ...n, read: true } : n)));
  },

  /** Local-only helper: push a notification in mock mode (REST creates them server-side). */
  pushLocal(kind: NotificationKind, title: string, body?: string, link?: string): void {
    if (isRestBackendEnabled()) return;
    const item: AppNotification = {
      id: `n-${Date.now()}`,
      kind,
      title,
      body,
      link,
      read: false,
      createdAt: new Date().toISOString(),
    };
    writeStore([item, ...readStore()]);
  },
};
