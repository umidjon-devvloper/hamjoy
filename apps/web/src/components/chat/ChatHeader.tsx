'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, MoreVertical, Phone } from 'lucide-react';
import type { ChatHeaderInfo } from '@/types';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { ChatJobPreview } from './ChatJobPreview';

interface ChatHeaderProps {
  header: ChatHeaderInfo;
}

export function ChatHeader({ header }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-[var(--color-border)] shrink-0">
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-muted)] hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar src={header.otherUserAvatar} alt={header.otherUserName} size="md" isOnline />
            <div className="min-w-0">
              <h2 className="font-semibold text-[var(--color-secondary)] text-sm truncate">
                {header.otherUserName}
              </h2>
              <p className="text-xs text-[var(--color-muted)] truncate">
                {header.otherUserTitle ?? 'Ish boʻyicha suhbat'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
            aria-label="Call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-muted)] hover:bg-gray-100 transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {header.job && (
        <div className="px-4 pb-3">
          <ChatJobPreview job={header.job} />
        </div>
      )}
    </header>
  );
}
