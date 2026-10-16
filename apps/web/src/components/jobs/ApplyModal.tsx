'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ApplyModalProps {
  open: boolean;
  jobTitle: string;
  company: string;
  onClose: () => void;
  onSubmit: (coverNote: string) => Promise<void>;
}

export function ApplyModal({ open, jobTitle, company, onClose, onSubmit }: ApplyModalProps) {
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(coverNote.trim());
      setCoverNote('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[var(--color-secondary)]">Ariza yuborish</h2>
                <p className="truncate text-sm text-[var(--color-muted)]">
                  {jobTitle} · {company}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[var(--color-muted)] hover:bg-gray-200"
                aria-label="Yopish"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="mb-1.5 block text-sm font-medium text-[var(--color-secondary)]">
              Qisqa xat <span className="font-normal text-[var(--color-muted)]">(ixtiyoriy)</span>
            </label>
            <textarea
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="O'zingiz haqingizda qisqacha yozing — nega aynan siz mos kelasiz?"
              className="w-full resize-none rounded-xl border border-[var(--color-border)] p-3 text-sm outline-none focus:border-[var(--color-primary)]/40 focus:ring-2 focus:ring-[var(--color-primary)]/15"
            />

            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
                Bekor qilish
              </Button>
              <Button className="flex-1 gap-2" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Yuborish
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
