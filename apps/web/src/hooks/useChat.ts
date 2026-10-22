'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChats } from '@/context/ChatsContext';
import { authService } from '@/services/auth.service';
import { chatsService } from '@/services/chats.service';
import { getJoymeeSocket } from '@/lib/joymee/socket';
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

  useEffect(() => {
    const unsubscribe = chatsService.subscribeToReads(chatId, ({ readerId, readAt }) => {
      const cutoff = readAt;
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.senderId !== readerId && !m.read && m.createdAt <= cutoff ? { ...m, read: true } : m,
        ),
      );
    });
    return () => unsubscribe?.();
  }, [chatId]);

  // Typing indicator: track the other party's "I'm typing" pings, hide after
  // 3.5s of silence, and expose an emitter the composer can throttle.
  const [peerTyping, setPeerTyping] = useState(false);
  const typingHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingEmitAtRef = useRef(0);
  const socketRef = useRef<Awaited<ReturnType<typeof getJoymeeSocket>> | null>(null);
  const meId = authService.getCurrentUserId();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const sock = await getJoymeeSocket();
      if (cancelled || !sock) return;
      socketRef.current = sock;
      const onTyping = (payload: { chatId: string; userId: string }) => {
        if (payload.chatId !== chatId || payload.userId === meId) return;
        setPeerTyping(true);
        if (typingHideTimer.current) clearTimeout(typingHideTimer.current);
        typingHideTimer.current = setTimeout(() => setPeerTyping(false), 3500);
      };
      sock.on('chat:typing', onTyping);
    })();
    return () => {
      cancelled = true;
      socketRef.current?.off('chat:typing');
      if (typingHideTimer.current) clearTimeout(typingHideTimer.current);
    };
  }, [chatId, meId]);

  const notifyTyping = useCallback(() => {
    const now = Date.now();
    if (now - typingEmitAtRef.current < 1500) return;
    typingEmitAtRef.current = now;
    socketRef.current?.emit('chat:typing', chatId);
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
    peerTyping,
    notifyTyping,
  };
}
