'use client';

import { useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatBubble } from './ChatBubble';
import { usersService } from '@/services/users.service';
import { formatMessageTime, formatMessageDateLabel, isSameMessageDay } from '@/lib/format/message-time';

interface MessageListMessage {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  isOwn: boolean;
}

interface MessageListProps {
  messages: MessageListMessage[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
  isEmpty?: boolean;
}

export function MessageList({ messages, bottomRef, isEmpty }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, bottomRef]);

  if (isEmpty) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mb-4">
          <MessageCircle className="w-7 h-7" />
        </div>
        <h3 className="font-semibold text-[var(--color-secondary)] mb-1">No messages yet</h3>
        <p className="text-sm text-[var(--color-muted)] max-w-xs">
          Say hello and ask about the role. Your messages stay in this conversation thread.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg, index) => {
        const showDate =
          index === 0 || !isSameMessageDay(msg.createdAt, messages[index - 1].createdAt);
        const sender = usersService.getById(msg.senderId);

        return (
          <div key={msg.id}>
            {showDate && (
              <div className="text-center my-4">
                <span className="text-[10px] font-semibold text-[var(--color-muted)] bg-white border border-[var(--color-border)] px-3 py-1 rounded-full">
                  {formatMessageDateLabel(msg.createdAt)}
                </span>
              </div>
            )}
            <ChatBubble
              variant={msg.isOwn ? 'sent' : 'received'}
              message={msg.body}
              time={formatMessageTime(msg.createdAt)}
              avatarUrl={msg.isOwn ? undefined : sender?.avatarUrl}
            />
          </div>
        );
      })}
      <div ref={bottomRef} aria-hidden />
    </div>
  );
}
