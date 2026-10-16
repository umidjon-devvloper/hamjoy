'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ChatPreview } from '@/types';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatListItemProps {
  chat: ChatPreview;
  index?: number;
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function ChatListItem({ chat, index = 0 }: ChatListItemProps) {
  return (
    <Link href={`/chat/${chat.id}`} className="block touch-manipulation">
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
        whileTap={{ scale: 0.99 }}
        className="card card-hover p-4 flex items-center gap-3.5"
      >
        <div className="relative shrink-0">
          <UserAvatar src={chat.userAvatar} alt={chat.userName} size="lg" />
          {chat.unread ? (
            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[var(--color-accent)] rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold px-1">
              {chat.unread}
            </div>
          ) : null}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-0.5 gap-2">
            <h3 className="font-semibold text-[var(--color-secondary)] text-sm truncate">
              {chat.userName}
            </h3>
            <span className="text-[10px] text-[var(--color-muted)] whitespace-nowrap shrink-0">
              {chat.time}
            </span>
          </div>

          {chat.jobTitle && (
            <p className="text-[11px] text-[var(--color-primary)] font-medium truncate flex items-center gap-1 mb-0.5">
              <Briefcase className="w-3 h-3 shrink-0" />
              {chat.jobTitle}
              {chat.jobCompany ? ` · ${chat.jobCompany}` : ''}
              {chat.isJobPoster ? (
                <span className="text-[var(--color-muted)] font-normal">(your listing)</span>
              ) : null}
            </p>
          )}

          <p
            className={cn(
              'text-sm truncate',
              chat.unread
                ? 'font-medium text-[var(--color-secondary)]'
                : 'text-[var(--color-muted)]'
            )}
          >
            {chat.lastMessage}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
