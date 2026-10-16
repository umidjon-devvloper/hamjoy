'use client';

import type { NotificationSettings } from '@/types';
import { cn } from '@/lib/utils';

const NOTIFICATION_ITEMS: {
  key: keyof NotificationSettings;
  label: string;
  description: string;
}[] = [
  { key: 'emailAlerts', label: 'Email alerts', description: 'Important account updates' },
  { key: 'pushAlerts', label: 'Push notifications', description: 'Alerts on this device' },
  { key: 'jobMatches', label: 'Job matches', description: 'New jobs matching your profile' },
  { key: 'chatMessages', label: 'Chat messages', description: 'New messages from employers' },
  { key: 'marketing', label: 'Tips & offers', description: 'Product news and promotions' },
];

interface NotificationSettingsPanelProps {
  settings: NotificationSettings;
  onChange: (key: keyof NotificationSettings, value: boolean) => void;
}

export function NotificationSettingsPanel({
  settings,
  onChange,
}: NotificationSettingsPanelProps) {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {NOTIFICATION_ITEMS.map((item) => (
        <label
          key={item.key}
          className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 cursor-pointer"
        >
          <div className="min-w-0">
            <span className="text-sm font-medium text-[var(--color-secondary)] block">
              {item.label}
            </span>
            <span className="text-xs text-[var(--color-muted)]">{item.description}</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings[item.key]}
            onClick={() => onChange(item.key, !settings[item.key])}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors shrink-0',
              settings[item.key] ? 'bg-[var(--color-primary)]' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                settings[item.key] && 'translate-x-5'
              )}
            />
          </button>
        </label>
      ))}
    </div>
  );
}
