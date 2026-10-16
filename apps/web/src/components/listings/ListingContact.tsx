'use client';

import React, { useState } from 'react';
import { MessageCircle, Phone, Share2 } from 'lucide-react';
import type { ListingSeller } from '@/types/listing';
import { appToast } from '@/lib/feedback/toast';
import { SaveListingButton } from './SaveListingButton';

/** Seller block on the listing page: reveal-then-call phone, save, share. */
export function ListingContact({
  listingId,
  title,
  seller,
}: {
  listingId: string;
  title: string;
  seller: ListingSeller;
}) {
  const [phoneShown, setPhoneShown] = useState(false);
  const masked = seller.phone.replace(/\d{2} \d{2}$/, 'XX XX');

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
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-lg font-bold text-[var(--color-brand-green)]">
          {seller.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--color-secondary)]">{seller.name}</p>
          <p className="text-xs text-[var(--color-muted)]">
            {seller.type === 'agentlik' ? 'Agentlik' : 'Mulkdor'}
          </p>
        </div>
      </div>

      {phoneShown ? (
        <a
          href={`tel:${seller.phone.replace(/\s/g, '')}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] text-[15px] font-bold text-white transition hover:brightness-110"
        >
          <Phone className="h-5 w-5" />
          {seller.phone}
        </a>
      ) : (
        <button
          type="button"
          onClick={() => setPhoneShown(true)}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] text-[15px] font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-gold)]/70"
        >
          <Phone className="h-5 w-5" />
          <span>{masked}</span>
          <span className="text-sm font-semibold opacity-80">· Raqamni koʻrsatish</span>
        </button>
      )}

      <button
        type="button"
        disabled
        title="Uy-joy eʼlonlari uchun chat tez orada"
        className="flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] text-sm font-semibold text-[var(--color-muted)]"
      >
        <MessageCircle className="h-4 w-4" />
        Chatda yozish · Tez orada
      </button>

      <div className="grid grid-cols-2 gap-2">
        <SaveListingButton listingId={listingId} variant="outline" />
        <button
          type="button"
          onClick={share}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-secondary)] transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-gold)]/70"
        >
          <Share2 className="h-4 w-4" />
          Ulashish
        </button>
      </div>
    </div>
  );
}
