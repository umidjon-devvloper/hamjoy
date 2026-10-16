import type { Chat, Message } from '@/types';
import {
  CHAT_MESSAGES_STORAGE_KEY,
  CHAT_THREADS_STORAGE_KEY,
} from '@/data/constants';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const chatStore = {
  getThreads(): Chat[] {
    return readJson<Chat[]>(CHAT_THREADS_STORAGE_KEY, []);
  },

  saveThread(chat: Chat): Chat {
    const threads = this.getThreads();
    const index = threads.findIndex((c) => c.id === chat.id);
    if (index >= 0) threads[index] = chat;
    else threads.unshift(chat);
    writeJson(CHAT_THREADS_STORAGE_KEY, threads);
    return chat;
  },

  getMessages(): Message[] {
    return readJson<Message[]>(CHAT_MESSAGES_STORAGE_KEY, []);
  },

  saveMessage(message: Message): Message {
    const messages = this.getMessages();
    messages.push(message);
    writeJson(CHAT_MESSAGES_STORAGE_KEY, messages);
    return message;
  },

  updateMessages(mutator: (messages: Message[]) => Message[]): void {
    writeJson(CHAT_MESSAGES_STORAGE_KEY, mutator(this.getMessages()));
  },
};
