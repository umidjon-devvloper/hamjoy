import React from 'react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/profile/UserAvatar';

export interface ChatBubbleProps {
  message: string;
  time: string;
  variant: 'sent' | 'received';
  avatarUrl?: string;
  className?: string;
}

export function ChatBubble({
  message,
  time,
  variant,
  avatarUrl,
  className,
}: ChatBubbleProps) {
  const isSent = variant === 'sent';

  return (
    <div className={cn('flex gap-2.5', isSent && 'flex-row-reverse', className)}>
      {!isSent && avatarUrl && (
        <UserAvatar src={avatarUrl} alt="" size="sm" className="mt-auto" />
      )}
      <div
        className={cn(
          'p-3 rounded-2xl max-w-[80%]',
          isSent
            ? 'bg-[var(--color-primary)] text-white rounded-br-md shadow-md shadow-blue-500/15'
            : 'card rounded-bl-md shadow-none'
        )}
      >
        <p className={cn('text-sm', !isSent && 'text-[var(--color-secondary)]')}>{message}</p>
        <span
          className={cn(
            'text-[10px] mt-1 block text-right',
            isSent ? 'text-blue-200' : 'text-[var(--color-muted)]'
          )}
        >
          {time}
        </span>
      </div>
    </div>
  );
}
