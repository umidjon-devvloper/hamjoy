'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const CONSENT_KEY = 'jobmarket:cookie-consent';

export function CookieConsent() {
  // Start hidden so SSR and the first client render match (both render null);
  // reading localStorage happens after mount to avoid a hydration mismatch.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(CONSENT_KEY) !== 'accepted') {
      // Intentional: localStorage is client-only, so we defer reading it to
      // after mount to keep SSR and the first client render identical.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie roziligi"
      className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[70] card p-4 shadow-lg border border-[var(--color-border)]"
    >
      <p className="text-sm text-[var(--color-secondary)] mb-3">
        Biz kirish va sozlamalar uchun kerakli cookie fayllaridan foydalanamiz.{' '}
        <Link href="/legal/privacy" className="text-[var(--color-primary)] underline">
          Maxfiylik siyosati
        </Link>
        .
      </p>
      <Button
        size="sm"
        onClick={() => {
          localStorage.setItem(CONSENT_KEY, 'accepted');
          setVisible(false);
        }}
      >
        Qabul qilish
      </Button>
    </div>
  );
}
