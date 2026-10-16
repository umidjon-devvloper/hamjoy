import type { Timestamp, UUID } from './common';

export interface Chat {
  id: UUID;
  listingId: UUID;
  buyerId: UUID;
  sellerId: UUID;
  lastMessageAt: Timestamp | null;
  unreadFor: Record<UUID, number>;
}

export interface Message {
  id: UUID;
  chatId: UUID;
  senderId: UUID;
  body: string;
  mediaUrl: string | null;
  readAt: Timestamp | null;
  createdAt: Timestamp;
}
