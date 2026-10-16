'use client';

import { MessageCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface ChatEmptyStateProps {
  variant?: 'list' | 'detail';
}

export function ChatEmptyState({ variant = 'list' }: ChatEmptyStateProps) {
  if (variant === 'detail') {
    return null;
  }

  return (
    <EmptyState
      icon={MessageCircle}
      title="Hali xabar yoʻq"
      description="Ish eʼlonidagi “Bogʻlanish” tugmasi orqali ish beruvchi bilan suhbatni boshlang."
      action={
        <Link href="/search">
          <Button>Ishlarni koʻrish</Button>
        </Link>
      }
    />
  );
}
