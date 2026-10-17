import type { Chat, Message } from '@/types';
import { getJoymeeClient } from './client';

interface JoymeeChatRow {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  lastMessageAt: string | null;
  unreadCounts: Record<string, number>;
  createdAt: string;
  listing: { id: string; title: string; status: string } | null;
  unread: number;
}

interface JoymeeMessage {
  id: string;
  chatId: string;
  senderId: string;
  body: string;
  mediaUrl: string | null;
  readAt: string | null;
  createdAt: string;
}

function toChat(row: JoymeeChatRow): Chat {
  return {
    id: row.id,
    participantIds: [row.buyerId, row.sellerId],
    jobId: row.listingId,
    lastMessageId: '', // filled from latest message if needed
    updatedAt: row.lastMessageAt ?? row.createdAt,
  };
}

function toMessage(m: JoymeeMessage): Message {
  return {
    id: m.id,
    chatId: m.chatId,
    senderId: m.senderId,
    body: m.body,
    createdAt: m.createdAt,
    read: m.readAt != null,
  };
}

export const joymeeChatsRepository = {
  async listMine(): Promise<{ chats: Chat[]; rawRows: JoymeeChatRow[] }> {
    const rows = (await getJoymeeClient().chats.list()) as unknown as JoymeeChatRow[];
    return { chats: rows.map(toChat), rawRows: rows };
  },

  async start(listingId: string): Promise<Chat> {
    const row = (await getJoymeeClient().chats.start(listingId)) as unknown as JoymeeChatRow;
    return toChat(row);
  },

  async messages(chatId: string): Promise<Message[]> {
    const res = (await getJoymeeClient().chats.messages(chatId)) as unknown as {
      items: JoymeeMessage[];
      cursor: string | null;
    };
    return res.items.map(toMessage);
  },

  async send(chatId: string, body: string): Promise<Message> {
    const m = (await getJoymeeClient().chats.send(chatId, body)) as unknown as JoymeeMessage;
    return toMessage(m);
  },

  async markRead(chatId: string): Promise<void> {
    await getJoymeeClient().chats.read(chatId);
  },
};
