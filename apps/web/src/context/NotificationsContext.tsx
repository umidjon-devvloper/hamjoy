'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AppNotification } from '@/types';
import { notificationsService } from '@/services/notifications.service';
import { useAuth } from '@/context/AuthContext';
import { getJoymeeSocket } from '@/lib/joymee/socket';
import { isRestBackendEnabled } from '@/lib/api/config';

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  refresh: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isHydrated: authHydrated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const items = await notificationsService.list();
        if (!cancelled) setNotifications(items);
      } catch {
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [version, authHydrated]);

  // Live push: when the user receives a notification via Socket.io, refresh
  // the list so the mapper produces the right title/body/link.
  useEffect(() => {
    if (!isRestBackendEnabled() || !authHydrated) return;
    let socketRef: Awaited<ReturnType<typeof getJoymeeSocket>> | null = null;
    let cancelled = false;
    void (async () => {
      const sock = await getJoymeeSocket();
      if (cancelled || !sock) return;
      socketRef = sock;
      const onNew = () => refresh();
      sock.on('notification:new', onNew);
    })();
    return () => {
      cancelled = true;
      socketRef?.off('notification:new');
    };
  }, [authHydrated, refresh]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await notificationsService.markAllRead();
  }, []);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await notificationsService.markRead(id);
  }, []);

  const value = useMemo(
    () => ({ notifications, unreadCount, isLoading, markAllRead, markRead, refresh }),
    [notifications, unreadCount, isLoading, markAllRead, markRead, refresh]
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return ctx;
}
