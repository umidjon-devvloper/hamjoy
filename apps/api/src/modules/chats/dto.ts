import { z } from 'zod';

export const StartChatSchema = z.object({
  listingId: z.string().uuid(),
  sellerId: z.string().uuid().optional(),
});
export type StartChatDto = z.infer<typeof StartChatSchema>;

export const SendMessageSchema = z.object({
  body: z.string().min(1).max(4000),
  mediaUrl: z.string().url().nullable().optional(),
});
export type SendMessageDto = z.infer<typeof SendMessageSchema>;

export const ListMessagesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export type ListMessagesQuery = z.infer<typeof ListMessagesQuerySchema>;
