'use client';

import Link from 'next/link';
import { KeyRound, MessageCircle, Search, ShoppingBag } from 'lucide-react';
import { DEMO_LISTINGS } from '@/data/listings';
import { ROUTES } from '@/lib/navigation/routes';
import { formatListingDate, formatListingPrice, getListingIntent } from '@/lib/listings/format';
import { useUserListings } from '@/lib/listings/user-listings';
import { useListingModeration } from '@/lib/listings/moderation';
import { cn } from '@/lib/utils';

/** "Xaridorlar nima qidiryapti" — buyer / renter requests as compact cards. */
export function BuyerRequests() {
  const userListings = useUserListings();
  const { isVisible } = useListingModeration();
  const requests = [...userListings, ...DEMO_LISTINGS].filter((l) => l.seeking && isVisible(l.id)).slice(0, 2);

  return (
    <section aria-labelledby="home-req-heading" className="mt-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="home-req-heading" className="text-[28px] font-extrabold tracking-[-0.025em] text-[var(--color-secondary)]">
            Xaridorlar nima qidiryapti
          </h2>
          <p className="mt-1 text-[var(--color-muted)]">Mulkingiz mos kelsa — soʻrov egasiga bevosita taklif yuboring.</p>
        </div>
        <Link href={ROUTES.uyJoy.buy} className="font-semibold text-[var(--color-brand-green)] hover:underline">
          Barcha soʻrovlar →
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((r) => {
          const intent = getListingIntent(r);
          const isRent = r.deal === 'ijara';
          return (
            <article key={r.id} className="card flex flex-col gap-3 rounded-[22px] p-[22px]">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'flex h-[30px] items-center gap-1.5 rounded-full pl-2.5 pr-3 text-[13px] font-bold',
                    isRent
                      ? 'bg-[var(--color-accent-light)] text-[#7A5A12]'
                      : 'bg-[var(--color-primary-light)] text-[var(--color-brand-green)]'
                  )}
                >
                  {isRent ? (
                    <KeyRound className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
                  ) : (
                    <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
                  )}
                  {isRent ? 'Ijaraga oladi' : 'Sotib oladi'}
                </span>
                <time dateTime={r.postedAt} className="text-[13px] text-[var(--color-muted)]">
                  {formatListingDate(r.postedAt)}
                </time>
              </div>
              <h3 className="text-lg font-bold tracking-[-0.01em] text-[var(--color-secondary)]">{r.title}</h3>
              <p className="line-clamp-2 text-sm text-[var(--color-muted)]">{r.description}</p>
              <p className="flex items-baseline gap-1.5">
                <span className="text-[13px] text-[var(--color-muted)]">Byudjet</span>
                <span className="tabular text-xl font-extrabold text-[var(--color-secondary)]">{formatListingPrice(r)}</span>
                {!isRent && <span className="text-[13px] text-[var(--color-muted)]">gacha</span>}
              </p>
              {r.features.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label={`${intent.badge} shartlari`}>
                  {r.features.map((f) => (
                    <li key={f} className="rounded-full bg-[var(--color-field)] px-2.5 py-1 text-xs font-medium">
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={ROUTES.listing(r.id)}
                className="mt-auto flex h-[46px] items-center justify-center gap-2 rounded-[14px] bg-[var(--color-primary-light)] font-bold text-[var(--color-brand-green)] transition-colors hover:bg-[var(--color-brand-green)] hover:text-white"
              >
                <MessageCircle className="h-[17px] w-[17px]" />
                Taklif yuborish
              </Link>
            </article>
          );
        })}
        <article className="flex flex-col justify-between gap-4 rounded-[22px] border-[1.5px] border-dashed border-[#C9CBC3] bg-[var(--color-surface)] p-[22px]">
          <div className="flex flex-col gap-2.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-brand-green)]">
              <Search className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <h3 className="text-lg font-bold tracking-[-0.01em] text-[var(--color-secondary)]">Kerakli uyni topa olmadingizmi?</h3>
            <p className="text-sm text-[var(--color-muted)]">Soʻrov qoldiring — mos mulk egalari oʻzlari siz bilan bogʻlanadi.</p>
          </div>
          <Link
            href={`${ROUTES.createListing}&bitim=olish`}
            className="flex h-[46px] items-center justify-center rounded-[14px] bg-[#0B0B0C] font-bold text-white transition-colors hover:bg-[#23262B]"
          >
            Soʻrov qoldirish
          </Link>
        </article>
      </div>
    </section>
  );
}
