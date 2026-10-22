'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageCircle, Phone, Share2 } from 'lucide-react';
import type { ListingSeller } from '@/types/listing';
import { appToast } from '@/lib/feedback/toast';
import { SaveListingButton } from './SaveListingButton';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { StarRating } from '@/components/ui/StarRating';
import { joymeeReviews, type UserStats } from '@/lib/joymee/reviews';
import { joymeeChatsRepository } from '@/lib/joymee/chats.repository';
import { useAuth } from '@/context/AuthContext';
import { isRestBackendEnabled } from '@/lib/api/config';

/** Seller block on the listing page: reveal-then-call phone, save, share. */
export function ListingContact({
  listingId,
  title,
  seller,
  sellerUserId,
}: {
  listingId: string;
  title: string;
  seller: ListingSeller;
  /** When present, we fetch the real user's rating stats and show stars. */
  sellerUserId?: string;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [phoneShown, setPhoneShown] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const masked = seller.phone.replace(/\d{2} \d{2}$/, 'XX XX');

  const [stats, setStats] = useState<UserStats | null>(null);
  useEffect(() => {
    if (!isRestBackendEnabled() || !sellerUserId) return;
    void joymeeReviews.stats(sellerUserId).then(setStats);
  }, [sellerUserId]);

  const chatEnabled = isRestBackendEnabled() && sellerUserId && user.id !== sellerUserId;
  const startChat = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setChatBusy(true);
    try {
      const chat = await joymeeChatsRepository.start(listingId);
      router.push(`/chat/${chat.id}`);
    } catch (err) {
      appToast.error(err, 'Chat ochib boʻlmadi');
      setChatBusy(false);
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      appToast.success('Havola nusxalandi');
    } catch (err) {
      // The user closing the share sheet is not an error.
      if (err instanceof DOMException && err.name === 'AbortError') return;
      appToast.info('Havolani nusxalab boʻlmadi');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-background)] p-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-lg font-bold text-white">
          {seller.name.charAt(0)}
        </span>
        <div className="min-w-0">
          {sellerUserId ? (
            <Link
              href={`/u/${sellerUserId}`}
              className="flex items-center gap-1.5 truncate font-semibold text-[var(--color-secondary)] hover:text-[var(--color-brand-green)]"
            >
              {seller.name}
              {seller.trusted ? <TrustBadge size="xs" /> : null}
            </Link>
          ) : (
            <p className="flex items-center gap-1.5 truncate font-semibold text-[var(--color-secondary)]">
              {seller.name}
              {seller.trusted ? <TrustBadge size="xs" /> : null}
            </p>
          )}
          <p className="text-xs text-[var(--color-muted)]">
            {seller.type === 'agentlik' ? 'Agentlik' : 'Mulkdor'}
            {seller.trusted ? ' · Ishonchli' : ''}
          </p>
          {stats && stats.count > 0 ? (
            <div className="mt-1">
              <StarRating value={stats.avg} count={stats.count} size={12} />
            </div>
          ) : null}
        </div>
      </div>

      {phoneShown ? (
        <a
          href={`tel:${seller.phone.replace(/\s/g, '')}`}
          className="flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] text-base font-bold text-white transition-colors hover:bg-[var(--color-brand-green-deep)]"
        >
          <Phone className="h-5 w-5" />
          {seller.phone}
        </a>
      ) : (
        <button
          type="button"
          onClick={() => setPhoneShown(true)}
          className="flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] text-base font-bold text-white transition-colors hover:bg-[var(--color-brand-green-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-green)]/40 focus-visible:ring-offset-2"
        >
          <Phone className="h-5 w-5" />
          <span>{masked}</span>
          <span className="text-sm font-medium opacity-85">Koʻrsatish</span>
        </button>
      )}

      {chatEnabled ? (
        <button
          type="button"
          onClick={startChat}
          disabled={chatBusy}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-brand-green)]/30 bg-[var(--color-primary-light)] text-sm font-semibold text-[var(--color-brand-green)] transition hover:bg-[var(--color-primary-light)]/80 disabled:opacity-60"
        >
          <MessageCircle className="h-4 w-4" />
          {chatBusy ? 'Ochilmoqda…' : 'Chatda yozish'}
        </button>
      ) : (
        <button
          type="button"
          disabled
          title={user.id === sellerUserId ? 'O\'z e\'loningizga chat ochib bo\'lmaydi' : 'Chat demo rejimda ishlamaydi'}
          className="flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] text-sm font-semibold text-[var(--color-muted)]"
        >
          <MessageCircle className="h-4 w-4" />
          Chatda yozish
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <SaveListingButton listingId={listingId} variant="outline" />
        <button
          type="button"
          onClick={share}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-secondary)] transition hover:bg-[var(--color-primary-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-green)]/40"
        >
          <Share2 className="h-4 w-4" />
          Ulashish
        </button>
      </div>
    </div>
  );
}
