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
  const { header, messages, send, bottomRef, isEmpty, thread, isLoading, error, refetch } =
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
      <MessageInput onSend={send} />
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
