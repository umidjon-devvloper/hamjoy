'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserRound } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { SellerReviewsPanel } from '@/components/listings/SellerReviewsPanel';
import { UserHistoryPanel } from '@/components/user/UserHistoryPanel';
import { joymeeReviews, type UserStats } from '@/lib/joymee/reviews';
import { isRestBackendEnabled } from '@/lib/api/config';

/**
 * Omma uchun foydalanuvchi sahifasi — reyting, sharhlar va e'lonlar tarixi.
 */
export default function UserPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [stats, setStats] = useState<UserStats>({ avg: 0, count: 0 });

  useEffect(() => {
    if (!isRestBackendEnabled() || !id) return;
    void joymeeReviews.stats(id).then(setStats);
  }, [id]);

  if (!isRestBackendEnabled()) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <p className="text-center text-[var(--color-muted)]">
          Omma profil faqat haqiqiy backend yoqilganda ko'rinadi.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-brand-green)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Orqaga
      </Link>

      <section className="card mb-6 rounded-[22px] p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-brand-green)]">
            <UserRound className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold tracking-[-0.02em] text-[var(--color-secondary)]">
              Foydalanuvchi
            </h1>
            <p className="text-sm text-[var(--color-muted)]">Omma profil</p>
            <div className="mt-2">
              <StarRating value={stats.avg} count={stats.count} />
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <UserHistoryPanel userId={id} />
        <SellerReviewsPanel sellerUserId={id} />
      </div>
    </main>
  );
}
