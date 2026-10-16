export interface Chat {
  id: string;
  participantIds: string[];
  jobId?: string;
  lastMessageId: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  body: string;
  createdAt: string;
  read: boolean;
}

/** UI preview for chat list rows */
export interface ChatPreview {
  id: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  time: string;
  unread?: number;
  jobId?: string;
  jobTitle?: string;
  jobCompany?: string;
  /** Whether the current user posted the linked job */
  isJobPoster?: boolean;
}

/** Header data for chat detail — includes linked job */
export interface ChatHeaderInfo {
  chatId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
  otherUserTitle?: string;
  job?: {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
  };
}

export interface ChatThreadView {
  chat: Chat;
  header: ChatHeaderInfo;
  preview: ChatPreview;
  messages: Message[];
}

export interface SendMessageInput {
  chatId: string;
  body: string;
  senderId: string;
}

export interface CreateChatInput {
  participantIds: string[];
  jobId: string;
}
