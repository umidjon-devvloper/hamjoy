'use client';

import { ChatListContent } from './ChatListContent';
import { RequireAuth } from '@/components/auth/RequireAuth';

export default function ChatListPage() {
  return (
    <RequireAuth>
      <ChatListContent />
    </RequireAuth>
  );
}
