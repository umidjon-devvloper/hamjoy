import type { Chat } from '@/types';

export const chats: Chat[] = [
  {
    id: 'chat-1',
    participantIds: ['user-alex', 'user-sarah'],
    jobId: 'job-1',
    lastMessageId: 'msg-3',
    updatedAt: '2026-06-24T10:30:00.000Z',
  },
  {
    id: 'chat-2',
    participantIds: ['user-alex', 'user-mike'],
    jobId: 'job-2',
    lastMessageId: 'msg-5',
    updatedAt: '2026-06-23T16:00:00.000Z',
  },
  {
    id: 'chat-3',
    participantIds: ['user-alex', 'user-emily'],
    jobId: 'job-3',
    lastMessageId: 'msg-7',
    updatedAt: '2026-06-22T09:15:00.000Z',
  },
  {
    id: 'chat-4',
    participantIds: ['user-alex', 'user-jordan'],
    jobId: 'job-5',
    lastMessageId: 'msg-8',
    updatedAt: '2026-06-24T14:00:00.000Z',
  },
];
