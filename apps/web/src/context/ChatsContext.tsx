'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Chat, ChatPreview, ChatThreadView, Message } from '@/types';
import { chatsService } from '@/services/chats.service';
import { formatUserError } from '@/lib/errors/format-user-error';
import { isBackendEnabled } from '@/lib/backend/config';
import { useAuth } from '@/context/AuthContext';

interface ChatsContextValue {
  chats: ChatPreview[];
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  getThread: (chatId: string) => Promise<ChatThreadView | undefined>;
  getMessages: (chatId: string) => Promise<Message[]>;
  sendMessage: (chatId: string, body: string) => Promise<Message | null>;
  markAsRead: (chatId: string) => Promise<void>;
  getOrCreateChatForJob: (jobId: string) => Promise<Chat | null>;
  totalUnread: number;
}

const ChatsContext = createContext<ChatsContextValue | null>(null);

export function ChatsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated: authHydrated } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (isBackendEnabled() && (!authHydrated || !isAuthenticated)) {
        setChats([]);
        setError(null);
        setIsHydrated(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const list = await chatsService.listChatPreviews();
        if (!cancelled) {
          setChats(list);
          setIsHydrated(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(formatUserError(err, 'Failed to load chats'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [version, authHydrated, isAuthenticated]);

  const totalUnread = useMemo(
    () => chats.reduce((sum, chat) => sum + (chat.unread ?? 0), 0),
    [chats]
  );

  const getThread = useCallback((chatId: string) => chatsService.getThread(chatId), []);

  const getMessages = useCallback((chatId: string) => chatsService.getMessages(chatId), []);

  const sendMessage = useCallback(
    async (chatId: string, body: string) => {
      const message = await chatsService.sendMessage(chatId, body);
      if (message) refresh();
      return message;
    },
    [refresh]
  );

  const markAsRead = useCallback(
    async (chatId: string) => {
      const updated = await chatsService.markAsRead(chatId);
      if (updated) refresh();
    },
    [refresh]
  );

  const getOrCreateChatForJob = useCallback(
    async (jobId: string) => {
      const chat = await chatsService.getOrCreateChatForJob(jobId);
      if (chat) refresh();
      return chat;
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      chats,
      isHydrated,
      isLoading,
      error,
      refresh,
      getThread,
      getMessages,
      sendMessage,
      markAsRead,
      getOrCreateChatForJob,
      totalUnread,
    }),
    [
      chats,
      isHydrated,
      isLoading,
      error,
      refresh,
      getThread,
      getMessages,
      sendMessage,
      markAsRead,
      getOrCreateChatForJob,
      totalUnread,
    ]
  );

  return <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>;
}

export function useChats(): ChatsContextValue {
  const ctx = useContext(ChatsContext);
  if (!ctx) {
    throw new Error('useChats must be used within ChatsProvider');
  }
  return ctx;
}
