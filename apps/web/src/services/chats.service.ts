import type { Chat, ChatThreadView, Message } from '@/types';
import { chats as seedChats, messages as seedMessages } from '@/data';
import { authService } from '@/services/auth.service';
import { chatStore } from '@/services/chat.store';
import { isBackendEnabled } from '@/lib/backend/config';
import { firebaseChatsRepository } from '@/lib/firebase/repositories/chats.repository';
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
  if (isBackendEnabled()) {
    return firebaseChatsRepository.getChatsForUser(currentUserId());
  }
  return getAllChatsMock();
}

async function getAllMessages(): Promise<Message[]> {
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
    const messages = isBackendEnabled()
      ? sortMessagesAsc(await firebaseChatsRepository.getMessages(chatId))
      : sortMessagesAsc(getAllMessagesMock().filter((m) => m.chatId === chatId));
    const allMessages = isBackendEnabled() ? messages : getAllMessagesMock();
    const preview = buildChatPreview(chat, allMessages, job);
    const header = buildChatHeader(chat, job);

    return { chat, header, preview, messages };
  },

  async getMessages(chatId: string): Promise<Message[]> {
    if (isBackendEnabled()) {
      return sortMessagesAsc(await firebaseChatsRepository.getMessages(chatId));
    }
    return sortMessagesAsc(getAllMessagesMock().filter((m) => m.chatId === chatId));
  },

  async markAsRead(chatId: string): Promise<boolean> {
    const userId = currentUserId();

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
    if (!isBackendEnabled()) return null;
    return firebaseChatsRepository.subscribeToMessages(chatId, onInsert);
  },

  getOtherParticipantId(chat: Chat): string | undefined {
    return getOtherParticipantId(chat);
  },
};
