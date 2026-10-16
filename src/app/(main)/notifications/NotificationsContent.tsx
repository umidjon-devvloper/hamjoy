'use client';

import Link from 'next/link';
import {
  Bell,
  MessageCircle,
  FileText,
  CheckCircle2,
  Sparkles,
  CheckCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNotifications } from '@/context/NotificationsContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { JobListSkeleton } from '@/components/ui/LoadingState';
import type { AppNotification, NotificationKind } from '@/types';
import { cn } from '@/lib/utils';

const KIND_ICON: Record<NotificationKind, LucideIcon> = {
  message: MessageCircle,
  application: FileText,
  application_update: CheckCircle2,
  job_match: Sparkles,
  system: Bell,
};

const KIND_STYLE: Record<NotificationKind, string> = {
  message: 'bg-blue-50 text-blue-600',
  application: 'bg-violet-50 text-violet-600',
  application_update: 'bg-emerald-50 text-emerald-600',
  job_match: 'bg-amber-50 text-amber-600',
  system: 'bg-gray-100 text-gray-500',
};

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} kun oldin`;
  return new Date(iso).toLocaleDateString('uz-UZ');
}

function Row({ n, onRead }: { n: AppNotification; onRead: (id: string) => void }) {
  const Icon = KIND_ICON[n.kind] ?? Bell;
  const inner = (
    <div
      className={cn(
        'card flex items-start gap-3 p-4 transition-colors',
        !n.read && 'border-[var(--color-primary)]/30 bg-[var(--color-primary-light)]/30'
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          KIND_STYLE[n.kind]
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--color-secondary)]">{n.title}</p>
        {n.body && <p className="mt-0.5 text-sm text-[var(--color-muted)]">{n.body}</p>}
        <p className="mt-1 text-xs text-[var(--color-muted)]">{timeAgo(n.createdAt)}</p>
      </div>
      {!n.read && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-accent)]" />}
    </div>
  );

  if (n.link) {
    return (
      <Link href={n.link} onClick={() => onRead(n.id)} className="block">
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => onRead(n.id)} className="block w-full text-left">
      {inner}
    </button>
  );
}

export function NotificationsContent() {
  const { notifications, unreadCount, isLoading, markAllRead, markRead } = useNotifications();

  return (
    <div className="page-container">
      <PageHeader
        title="Bildirishnomalar"
        subtitle={unreadCount > 0 ? `${unreadCount} ta oʻqilmagan` : 'Hammasi oʻqilgan'}
        action={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-primary-light)] px-3 py-2 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15"
            >
              <CheckCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Oʻqildi</span>
            </button>
          ) : undefined
        }
      />

      {isLoading ? (
        <JobListSkeleton count={3} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Bildirishnoma yoʻq"
          description="Yangiliklar shu yerda koʻrinadi — arizalar, xabarlar va mos ishlar."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <Row key={n.id} n={n} onRead={markRead} />
          ))}
        </div>
      )}
    </div>
  );
}
