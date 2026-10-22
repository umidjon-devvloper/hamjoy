'use client';

import { useParams, useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ChatThreadSkeleton } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import { useChat } from '@/hooks/useChat';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { formatUserError } from '@/lib/errors/format-user-error';

function ChatDetailContent() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const { header, messages, send, bottomRef, isEmpty, thread, isLoading, error, refetch, peerTyping, notifyTyping } =
    useChat(chatId);

  if (isLoading) {
    return <ChatThreadSkeleton />;
  }

  if (!thread || !header) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <EmptyState
          icon={AlertCircle}
          title={error ? 'Failed to load chat' : 'Chat not found'}
          description={
            error
              ? formatUserError(error)
              : 'This conversation may have been removed or is no longer available.'
          }
          action={
            error ? (
              <Button onClick={() => void refetch()}>Try again</Button>
            ) : (
              <Button onClick={() => router.push('/chat')}>Back to messages</Button>
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-[var(--color-background)]">
      <ChatHeader header={header} />
      <MessageList messages={messages} bottomRef={bottomRef} isEmpty={isEmpty} />
      {peerTyping ? (
        <div className="flex items-center gap-2 px-4 pb-1 text-xs italic text-[var(--color-muted)]">
          <span className="flex gap-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted)] opacity-50 animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted)] opacity-70 animate-pulse [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted)] animate-pulse [animation-delay:300ms]" />
          </span>
          yozmoqda…
        </div>
      ) : null}
      <MessageInput onSend={send} onTyping={notifyTyping} />
    </div>
  );
}

export default function ChatDetailPage() {
  return (
    <RequireAuth>
      <ChatDetailContent />
    </RequireAuth>
  );
}
