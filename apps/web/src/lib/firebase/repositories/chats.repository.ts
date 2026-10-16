import type { Chat, Message } from '@/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
  getCountFromServer,
} from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase/client';
import { mapChatRow, mapMessageRow } from '@/lib/firebase/mappers';
import type { ChatRow, MessageRow } from '@/lib/firebase/document.types';

const CHATS = 'chats';
const MESSAGES = 'messages';

function chatRef(chatId: string) {
  return doc(getFirestoreDb(), CHATS, chatId);
}

function messagesRef(chatId: string) {
  return collection(getFirestoreDb(), CHATS, chatId, MESSAGES);
}

function chatRowFromSnap(id: string, data: Record<string, unknown>): ChatRow {
  return { id, ...data } as ChatRow;
}

function messageRowFromSnap(id: string, data: Record<string, unknown>): MessageRow {
  return { id, ...data } as MessageRow;
}

export const firebaseChatsRepository = {
  async getChatsForUser(userId: string): Promise<Chat[]> {
    const q = query(
      collection(getFirestoreDb(), CHATS),
      where('participant_ids', 'array-contains', userId)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => mapChatRow(chatRowFromSnap(d.id, d.data())))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getChatById(chatId: string): Promise<Chat | undefined> {
    const snap = await getDoc(chatRef(chatId));
    if (!snap.exists()) return undefined;
    return mapChatRow(chatRowFromSnap(snap.id, snap.data()));
  },

  async getMessages(chatId: string): Promise<Message[]> {
    const snap = await getDocs(messagesRef(chatId));
    return snap.docs
      .map((d) => mapMessageRow(messageRowFromSnap(d.id, d.data())))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async sendMessage(message: Message): Promise<Message> {
    const row: MessageRow = {
      id: message.id,
      chat_id: message.chatId,
      sender_id: message.senderId,
      body: message.body,
      read: message.read,
      created_at: message.createdAt,
    };

    const batch = writeBatch(getFirestoreDb());
    batch.set(doc(messagesRef(message.chatId), message.id), row);
    batch.update(chatRef(message.chatId), {
      last_message_id: message.id,
      updated_at: message.createdAt,
    });
    await batch.commit();

    return mapMessageRow(row);
  },

  async markAsRead(chatId: string, readerId: string): Promise<void> {
    const snap = await getDocs(messagesRef(chatId));
    const batch = writeBatch(getFirestoreDb());
    let hasUpdates = false;

    snap.docs.forEach((d) => {
      const data = d.data() as MessageRow;
      if (data.sender_id !== readerId && !data.read) {
        batch.update(d.ref, { read: true });
        hasUpdates = true;
      }
    });

    if (hasUpdates) await batch.commit();
  },

  async createChat(chat: Chat): Promise<Chat> {
    const row: ChatRow = {
      id: chat.id,
      job_id: chat.jobId ?? null,
      last_message_id: chat.lastMessageId || null,
      updated_at: chat.updatedAt,
      created_at: chat.updatedAt,
      participant_ids: chat.participantIds,
    };
    await setDoc(chatRef(chat.id), row);
    return mapChatRow(row);
  },

  subscribeToMessages(chatId: string, onInsert: (message: Message) => void): () => void {
    const q = query(messagesRef(chatId));
    return onSnapshot(q, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          onInsert(mapMessageRow(messageRowFromSnap(change.doc.id, change.doc.data())));
        }
      });
    });
  },

  async count(): Promise<number> {
    const snap = await getCountFromServer(collection(getFirestoreDb(), CHATS));
    return snap.data().count;
  },
};
