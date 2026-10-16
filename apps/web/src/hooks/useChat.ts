'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChats } from '@/context/ChatsContext';
import { authService } from '@/services/auth.service';
import { chatsService } from '@/services/chats.service';
import type { ChatHeaderInfo, Message } from '@/types';

export function useChat(chatId: string) {
  const { sendMessage, markAsRead } = useChats();
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [header, setHeader] = useState<ChatHeaderInfo | undefined>();
  const [preview, setPreview] = useState<ReturnType<typeof useChats>['chats'][0] | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const thread = await chatsService.getThread(chatId);
        if (cancelled) return;
        if (!thread) {
          setHeader(undefined);
          setPreview(undefined);
          setLocalMessages([]);
          return;
        }
        setHeader(thread.header);
        setPreview(thread.preview);
        setLocalMessages(thread.messages);
        await markAsRead(chatId);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load chat');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chatId, markAsRead, reloadKey]);

  useEffect(() => {
    const unsubscribe = chatsService.subscribeToMessages(chatId, (message) => {
      setLocalMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });
    return () => unsubscribe?.();
  }, [chatId]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [localMessages.length, scrollToBottom]);

  const send = useCallback(
    async (body: string) => {
      const message = await sendMessage(chatId, body);
      if (message) {
        setLocalMessages((prev) => [...prev, message]);
      }
      return message;
    },
    [chatId, sendMessage]
  );

  const messagesWithOwnership = useMemo(
    () =>
      localMessages.map((msg) => ({
        ...msg,
        isOwn: msg.senderId === authService.getCurrentUserId(),
      })),
    [localMessages]
  );

  return {
    thread: header ? { header, preview, messages: localMessages } : undefined,
    header,
    preview,
    messages: messagesWithOwnership,
    send,
    bottomRef,
    isEmpty: localMessages.length === 0,
    isLoading,
    error,
    refetch,
  };
}
