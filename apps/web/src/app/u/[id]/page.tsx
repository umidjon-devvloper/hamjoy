'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Flag, UserRound, UserX } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { SellerReviewsPanel } from '@/components/listings/SellerReviewsPanel';
import { UserHistoryPanel } from '@/components/user/UserHistoryPanel';
import { joymeeReviews, type UserStats } from '@/lib/joymee/reviews';
import { isRestBackendEnabled } from '@/lib/api/config';
import { joymeeTokens } from '@/lib/joymee/client';
import { useAuth } from '@/context/AuthContext';
import { appToast } from '@/lib/feedback/toast';

const apiBase = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';

async function authHeader(): Promise<Record<string, string>> {
  const token = await joymeeTokens.getAccess();
  return token
    ? { authorization: `Bearer ${token}`, 'content-type': 'application/json' }
    : { 'content-type': 'application/json' };
}

/**
 * Omma uchun foydalanuvchi sahifasi — reyting, sharhlar va e'lonlar tarixi.
 */
export default function UserPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<UserStats>({ avg: 0, count: 0 });
  const [blocked, setBlocked] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isRestBackendEnabled() || !id) return;
    void joymeeReviews.stats(id).then(setStats);
  }, [id]);

  useEffect(() => {
    if (!isRestBackendEnabled() || !isAuthenticated || !id) return;
    void (async () => {
      try {
        const res = await fetch(`${apiBase()}/users/me/blocks`, { headers: await authHeader() });
        if (res.ok) {
          const rows = (await res.json()) as { blockedId: string }[];
          setBlocked(rows.some((r) => r.blockedId === id));
        }
      } catch {
        /* ignore */
      }
    })();
  }, [id, isAuthenticated]);

  const isSelf = user.id === id;

  const report = async () => {
    const reason = window.prompt('Shikoyat sababini qisqa yozing:');
    if (!reason || reason.trim().length < 3) return;
    try {
      const res = await fetch(`${apiBase()}/reports`, {
        method: 'POST',
        headers: await authHeader(),
        body: JSON.stringify({ targetType: 'user', targetId: id, reason: reason.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      appToast.success("Shikoyat yuborildi — moderator ko'rib chiqadi");
    } catch (err) {
      appToast.error(err, "Yuborib bo'lmadi");
    }
  };

  const toggleBlock = async () => {
    setBusy(true);
    try {
      const method = blocked ? 'DELETE' : 'POST';
      const res = await fetch(`${apiBase()}/users/${id}/block`, {
        method,
        headers: await authHeader(),
      });
      if (!res.ok) throw new Error(await res.text());
      setBlocked(!blocked);
      appToast.success(blocked ? 'Blok olib tashlandi' : 'Bloklandi');
    } catch (err) {
      appToast.error(err, 'Amal bajarilmadi');
    } finally {
      setBusy(false);
    }
  };

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
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-brand-green)]">
            <UserRound className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-extrabold tracking-[-0.02em] text-[var(--color-secondary)]">
              Foydalanuvchi
            </h1>
            <p className="text-sm text-[var(--color-muted)]">Omma profil</p>
            <div className="mt-2">
              <StarRating value={stats.avg} count={stats.count} />
            </div>
          </div>
          {isAuthenticated && !isSelf ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={report}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-secondary)]"
              >
                <Flag className="h-3.5 w-3.5" />
                Shikoyat
              </button>
              <button
                type="button"
                onClick={toggleBlock}
                disabled={busy || blocked === null}
                className={
                  blocked
                    ? 'inline-flex items-center gap-1.5 rounded-full border border-[#B42318]/40 bg-[#FBECEB] px-3 py-1.5 text-xs font-semibold text-[#B42318] disabled:opacity-60'
                    : 'inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[#B42318] hover:bg-[#FBECEB] disabled:opacity-60'
                }
              >
                <UserX className="h-3.5 w-3.5" />
                {blocked ? 'Blokdan chiqarish' : 'Bloklash'}
              </button>
            </div>
          ) : null}
        </div>
        {blocked ? (
          <p className="mt-3 rounded-xl bg-[#FBECEB] px-3 py-2 text-xs text-[#B42318]">
            Siz ushbu foydalanuvchini blokladingiz — chat ochish va baho qoldirish mumkin emas.
          </p>
        ) : null}
      </section>

      <div className="space-y-6">
        <UserHistoryPanel userId={id} />
        <SellerReviewsPanel sellerUserId={id} />
      </div>
    </main>
  );
}
