import type { Chat, ChatThreadView, Message } from '@/types';
import { chats as seedChats, messages as seedMessages } from '@/data';
import { authService } from '@/services/auth.service';
import { chatStore } from '@/services/chat.store';
import { isBackendEnabled } from '@/lib/backend/config';
import { isRestBackendEnabled } from '@/lib/api/config';
import { firebaseChatsRepository } from '@/lib/firebase/repositories/chats.repository';
import { joymeeChatsRepository } from '@/lib/joymee/chats.repository';
import { getJoymeeSocket } from '@/lib/joymee/socket';
import { jobsService } from '@/services/jobs.service';
import {
  buildChatHeader,
  buildChatPreview,
  getOtherParticipantId,
  sortChatsByRecent,
  sortMessagesAsc,
} from '@/lib/mappers/chat.mapper';

function currentUserId(): string {
  return authService.getCurrentUserId();
}

function getAllChatsMock(): Chat[] {
  const stored = typeof window !== 'undefined' ? chatStore.getThreads() : [];
  const seedIds = new Set(seedChats.map((c) => c.id));
  const merged = [...stored.filter((c) => !seedIds.has(c.id)), ...seedChats];
  return sortChatsByRecent(merged);
}

function getAllMessagesMock(): Message[] {
  const stored = typeof window !== 'undefined' ? chatStore.getMessages() : [];
  const byId = new Map<string, Message>();
  seedMessages.forEach((m) => byId.set(m.id, m));
  stored.forEach((m) => byId.set(m.id, m));
  return Array.from(byId.values());
}

async function getAllChats(): Promise<Chat[]> {
  if (isRestBackendEnabled()) {
    const { chats } = await joymeeChatsRepository.listMine();
    return chats;
  }
  if (isBackendEnabled()) {
    return firebaseChatsRepository.getChatsForUser(currentUserId());
  }
  return getAllChatsMock();
}

async function getAllMessages(): Promise<Message[]> {
  if (isRestBackendEnabled()) {
    const chats = await getAllChats();
    const all: Message[] = [];
    for (const chat of chats) {
      const msgs = await joymeeChatsRepository.messages(chat.id);
      all.push(...msgs);
    }
    return all;
  }
  if (isBackendEnabled()) {
    const chats = await getAllChats();
    const all: Message[] = [];
    for (const chat of chats) {
      const msgs = await firebaseChatsRepository.getMessages(chat.id);
      all.push(...msgs);
    }
    return all;
  }
  return getAllMessagesMock();
}

async function getJobForChat(chat: Chat) {
  return chat.jobId ? jobsService.getByIdAsync(chat.jobId) : undefined;
}

export const chatsService = {
  async getAllChats(): Promise<Chat[]> {
    return getAllChats();
  },

  async getChatById(chatId: string): Promise<Chat | undefined> {
    if (isRestBackendEnabled()) {
      const { chats } = await joymeeChatsRepository.listMine();
      return chats.find((c) => c.id === chatId);
    }
    if (isBackendEnabled()) {
      return firebaseChatsRepository.getChatById(chatId);
    }
    return getAllChatsMock().find((c) => c.id === chatId);
  },

  async listChatPreviews() {
    const allChats = await getAllChats();
    const allMessages = await getAllMessages();
    const userId = currentUserId();

    const previews = await Promise.all(
      allChats
        .filter((chat) => chat.participantIds.includes(userId))
        .map(async (chat) => buildChatPreview(chat, allMessages, await getJobForChat(chat)))
    );

    return previews;
  },

  async getChatPreview(chatId: string) {
    const list = await this.listChatPreviews();
    return list.find((c) => c.id === chatId);
  },

  async getThread(chatId: string): Promise<ChatThreadView | undefined> {
    const chat = await this.getChatById(chatId);
    const userId = currentUserId();
    if (!chat || !chat.participantIds.includes(userId)) return undefined;

    const job = await getJobForChat(chat);
    let messages: Message[];
    let allMessages: Message[];
    if (isRestBackendEnabled()) {
      messages = sortMessagesAsc(await joymeeChatsRepository.messages(chatId));
      allMessages = messages;
    } else if (isBackendEnabled()) {
      messages = sortMessagesAsc(await firebaseChatsRepository.getMessages(chatId));
      allMessages = messages;
    } else {
      messages = sortMessagesAsc(getAllMessagesMock().filter((m) => m.chatId === chatId));
      allMessages = getAllMessagesMock();
    }
    const preview = buildChatPreview(chat, allMessages, job);
    const header = buildChatHeader(chat, job);

    return { chat, header, preview, messages };
  },

  async getMessages(chatId: string): Promise<Message[]> {
    if (isRestBackendEnabled()) {
      return sortMessagesAsc(await joymeeChatsRepository.messages(chatId));
    }
    if (isBackendEnabled()) {
      return sortMessagesAsc(await firebaseChatsRepository.getMessages(chatId));
    }
    return sortMessagesAsc(getAllMessagesMock().filter((m) => m.chatId === chatId));
  },

  async markAsRead(chatId: string): Promise<boolean> {
    const userId = currentUserId();

    if (isRestBackendEnabled()) {
      await joymeeChatsRepository.markRead(chatId);
      return true;
    }

    if (isBackendEnabled()) {
      await firebaseChatsRepository.markAsRead(chatId, userId);
      return true;
    }

    if (typeof window === 'undefined') return false;

    const allMessages = getAllMessagesMock();
    const hasUnread = allMessages.some(
      (m) => m.chatId === chatId && m.senderId !== userId && !m.read
    );
    if (!hasUnread) return false;

    chatStore.updateMessages((messages) =>
      messages.map((m) =>
        m.chatId === chatId && m.senderId !== userId ? { ...m, read: true } : m
      )
    );

    allMessages
      .filter(
        (m) =>
          m.chatId === chatId &&
          m.senderId !== userId &&
          !m.read &&
          seedMessages.some((s) => s.id === m.id)
      )
      .forEach((m) => chatStore.saveMessage({ ...m, read: true }));

    return true;
  },

  async sendMessage(
    chatId: string,
    body: string,
    senderId: string = currentUserId()
  ): Promise<Message | null> {
    const trimmed = body.trim();
    if (!trimmed) return null;

    const chat = await this.getChatById(chatId);
    if (!chat) return null;

    const message: Message = {
      id: `msg-user-${Date.now()}`,
      chatId,
      senderId,
      body: trimmed,
      createdAt: new Date().toISOString(),
      read: false,
    };

    if (isRestBackendEnabled()) {
      return joymeeChatsRepository.send(chatId, trimmed);
    }

    if (isBackendEnabled()) {
      return firebaseChatsRepository.sendMessage(message);
    }

    if (typeof window !== 'undefined') {
      chatStore.saveMessage(message);
      chatStore.saveThread({
        ...chat,
        lastMessageId: message.id,
        updatedAt: message.createdAt,
      });
    }

    return message;
  },

  async getOrCreateChatForJob(jobId: string): Promise<Chat | null> {
    const job = await jobsService.getByIdAsync(jobId);
    if (!job) return null;

    const posterId = job.posterId;
    const userId = currentUserId();
    if (posterId === userId) return null;

    if (isRestBackendEnabled()) {
      return joymeeChatsRepository.start(jobId);
    }

    const allChats = await getAllChats();
    const existing = allChats.find(
      (chat) =>
        chat.jobId === jobId &&
        chat.participantIds.includes(userId) &&
        chat.participantIds.includes(posterId)
    );

    if (existing) return existing;

    const newChat: Chat = {
      id: `chat-user-${Date.now()}`,
      participantIds: [userId, posterId],
      jobId,
      lastMessageId: '',
      updatedAt: new Date().toISOString(),
    };

    if (isBackendEnabled()) {
      return firebaseChatsRepository.createChat(newChat);
    }

    if (typeof window !== 'undefined') {
      chatStore.saveThread(newChat);
    }

    return newChat;
  },

  subscribeToMessages(chatId: string, onInsert: (message: Message) => void): (() => void) | null {
    if (isRestBackendEnabled()) {
      let cleanup = () => {};
      let active = true;
      void (async () => {
        const socket = await getJoymeeSocket();
        if (!socket || !active) return;

        const connect = () => {
          socket.emit('chat:subscribe', chatId);
        };
        if (socket.connected) connect();
        else socket.once('connect', connect);

        const onMessage = (payload: {
          id: string;
          chatId: string;
          senderId: string;
          body: string;
          createdAt: string;
          readAt: string | null;
        }) => {
          if (payload.chatId !== chatId) return;
          onInsert({
            id: payload.id,
            chatId: payload.chatId,
            senderId: payload.senderId,
            body: payload.body,
            createdAt: payload.createdAt,
            read: payload.readAt != null,
          });
        };
        socket.on('chat:message', onMessage);
        cleanup = () => {
          socket.emit('chat:unsubscribe', chatId);
          socket.off('chat:message', onMessage);
        };
      })();
      return () => {
        active = false;
        cleanup();
      };
    }
    if (!isBackendEnabled()) return null;
    return firebaseChatsRepository.subscribeToMessages(chatId, onInsert);
  },

  /**
   * Listen for "chat:read" events from the backend — fired when the other
   * party opens the thread. The handler receives the readAt timestamp so the
   * UI can flip "seen" markers on every message sent at or before that time.
   */
  subscribeToReads(
    chatId: string,
    onRead: (ev: { readerId: string; readAt: string }) => void,
  ): (() => void) | null {
    if (!isRestBackendEnabled()) return null;
    let cleanup = () => {};
    let active = true;
    void (async () => {
      const socket = await getJoymeeSocket();
      if (!socket || !active) return;
      const onPayload = (payload: { chatId: string; readerId: string; readAt: string }) => {
        if (payload.chatId !== chatId) return;
        onRead({ readerId: payload.readerId, readAt: payload.readAt });
      };
      socket.on('chat:read', onPayload);
      cleanup = () => socket.off('chat:read', onPayload);
    })();
    return () => {
      active = false;
      cleanup();
    };
  },

  getOtherParticipantId(chat: Chat): string | undefined {
    return getOtherParticipantId(chat);
  },
};
