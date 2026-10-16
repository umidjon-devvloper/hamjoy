import type { Chat, Message } from '@/types';

/**
 * Chat repository interface — implement with Firebase, Supabase, or REST later.
 * chatsService currently uses chatStore (localStorage) + seed data as the mock adapter.
 */
export interface ChatRepository {
  listChats(userId: string): Promise<Chat[]>;
  getChat(chatId: string): Promise<Chat | undefined>;
  listMessages(chatId: string): Promise<Message[]>;
  sendMessage(chatId: string, body: string, senderId: string): Promise<Message>;
  markAsRead(chatId: string, userId: string): Promise<void>;
  getOrCreateChat(participantIds: string[], jobId: string): Promise<Chat>;
  subscribeToMessages?(
    chatId: string,
    onMessage: (message: Message) => void
  ): () => void;
}
