'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (body: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled,
  placeholder = 'Xabar yozing...',
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  const submit = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    if (trimmed.length > 2000) return;
    onSend(trimmed);
    setMessage('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border-t border-[var(--color-border)] p-3 sm:p-4 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex gap-2 max-w-3xl mx-auto items-end">
        <textarea
          rows={1}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 bg-gray-100 border border-transparent rounded-xl px-4 py-3 min-h-[48px] max-h-32',
            'outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:bg-white focus:border-[var(--color-border)] transition-all text-sm resize-none'
          )}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
          onKeyDown={handleKeyDown}
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="w-12 h-12 bg-[var(--color-primary)] text-white rounded-xl flex items-center justify-center hover:bg-[var(--color-primary-hover)] transition-colors shrink-0 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
