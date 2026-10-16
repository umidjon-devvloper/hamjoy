import type { Chat, ChatHeaderInfo, ChatPreview, Job, Message } from '@/types';
import { authService } from '@/services/auth.service';
import { formatPostedAt } from '@/lib/mappers/job.mapper';
import { formatSalary } from '@/lib/mappers/job.mapper';
import { usersService } from '@/services/users.service';

export function getOtherParticipantId(chat: Chat): string | undefined {
  const userId = authService.getCurrentUserId();
  return chat.participantIds.find((id) => id !== userId);
}

export function buildChatPreview(
  chat: Chat,
  messages: Message[],
  job?: Job
): ChatPreview {
  const otherId = getOtherParticipantId(chat);
  const other = otherId ? usersService.getById(otherId) : undefined;
  const chatMessages = messages
    .filter((m) => m.chatId === chat.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const lastMsg = chatMessages[0] ?? messages.find((m) => m.id === chat.lastMessageId);
  const userId = authService.getCurrentUserId();
  const unread = messages.filter(
    (m) => m.chatId === chat.id && m.senderId !== userId && !m.read
  ).length;

  const isJobPoster = job?.posterId === userId;

  return {
    id: chat.id,
    userName: other?.name ?? 'Unknown',
    userAvatar: other?.avatarUrl ?? '',
    lastMessage: lastMsg?.body ?? 'Start the conversation',
    time: lastMsg ? formatPostedAt(lastMsg.createdAt) : formatPostedAt(chat.updatedAt),
    unread: unread > 0 ? unread : undefined,
    jobId: chat.jobId,
    jobTitle: job?.title,
    jobCompany: job?.companyName,
    isJobPoster,
  };
}

export function buildChatHeader(chat: Chat, job?: Job): ChatHeaderInfo {
  const otherId = getOtherParticipantId(chat);
  const other = otherId ? usersService.getById(otherId) : undefined;

  return {
    chatId: chat.id,
    otherUserId: otherId ?? '',
    otherUserName: other?.name ?? 'Unknown',
    otherUserAvatar: other?.avatarUrl ?? '',
    otherUserTitle: other?.title,
    job: job
      ? {
          id: job.id,
          title: job.title,
          company: job.companyName,
          location: job.location.label,
          salary: formatSalary(job),
        }
      : undefined,
  };
}

export function sortChatsByRecent(chats: Chat[]): Chat[] {
  return [...chats].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function sortMessagesAsc(messages: Message[]): Message[] {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}
