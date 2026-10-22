'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { joymeeReviews, type Review, type UserStats } from '@/lib/joymee/reviews';
import { useAuth } from '@/context/AuthContext';
import { isRestBackendEnabled } from '@/lib/api/config';
import { appToast } from '@/lib/feedback/toast';
import { cn } from '@/lib/utils';

/**
 * Public reviews block for a seller — stats, list, and (when logged in and
 * not the owner) an inline "leave a review" form. Only wired to the real
 * backend when NEXT_PUBLIC_API_URL is set; in mock mode we render nothing
 * since there are no real sellers to review.
 */
export function SellerReviewsPanel({
  sellerUserId,
  listingId,
}: {
  sellerUserId: string;
  listingId?: string;
}) {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({ avg: 0, count: 0 });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    void joymeeReviews.stats(sellerUserId).then(setStats);
    void joymeeReviews.list(sellerUserId).then(setReviews);
  };

  useEffect(() => {
    if (!isRestBackendEnabled() || !sellerUserId) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerUserId]);

  if (!isRestBackendEnabled() || !sellerUserId) return null;

  const canReview = Boolean(user?.id) && user.id !== sellerUserId;

  const submit = async () => {
    setBusy(true);
    try {
      await joymeeReviews.create({ toUserId: sellerUserId, listingId, rating, comment: comment.trim() || undefined });
      appToast.success('Baho qoldirildi');
      setComment('');
      refresh();
    } catch (err) {
      appToast.error(err, 'Baho qoldirilmadi');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card mt-5 rounded-[22px] p-6 sm:p-[26px]">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-[-0.02em] text-[var(--color-secondary)]">
          Sotuvchi haqida
        </h2>
        <StarRating value={stats.avg} count={stats.count} />
      </header>

      {canReview ? (
        <div className="mb-5 rounded-[18px] border border-dashed border-[var(--color-border)] p-4">
          <p className="mb-2 text-sm font-semibold text-[var(--color-secondary)]">Baho qoldiring</p>
          <div className="mb-3 flex items-center gap-1" role="radiogroup" aria-label="Yulduz">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                onClick={() => setRating(n)}
                className="p-1"
              >
                <Star
                  width={28}
                  height={28}
                  strokeWidth={0}
                  className={cn(
                    'transition-colors',
                    n <= rating
                      ? 'fill-[var(--color-brand-gold,#c7a052)]'
                      : 'fill-[rgba(0,0,0,0.1)]',
                  )}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Qisqa izoh (ixtiyoriy)…"
            rows={2}
            maxLength={500}
            className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-white p-3 text-sm text-[var(--color-secondary)] outline-none focus:border-[var(--color-brand-green)]"
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 text-sm font-bold text-white transition-colors hover:bg-[var(--color-brand-green-deep)] disabled:opacity-60"
          >
            {busy ? 'Yuborilmoqda…' : 'Baho qoldirish'}
          </button>
        </div>
      ) : null}

      {reviews.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">Hali baho yoʻq.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-[18px] border border-[var(--color-border)] bg-white p-4"
            >
              <div className="mb-1 flex items-center gap-2">
                <StarRating value={r.rating} showNumber={false} size={12} />
                <time className="text-[11px] text-[var(--color-muted)]">
                  {new Date(r.createdAt).toLocaleDateString('uz-UZ')}
                </time>
              </div>
              {r.comment ? (
                <p className="text-sm leading-relaxed text-[var(--color-secondary)]">
                  {r.comment}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
