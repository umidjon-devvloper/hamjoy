'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, Handshake, Home, Hourglass, type LucideIcon } from 'lucide-react';
import type { ListingIntent } from '@/types/listing';
import { LISTING_INTENTS } from '@/lib/listings/format';
import { sideGroupLabelClass, sideIconClass, sideItemClass as itemClass } from './side-nav-styles';
import { ROUTES } from '@/lib/navigation/routes';

const ICONS: Record<ListingIntent, LucideIcon> = {
  'kunlik-ijara': Home,
  ijara: Hourglass,
  sotuv: Handshake,
  'ijaraga-olish': Hourglass,
  'sotib-olish': Handshake,
};

/** Posting speaks for the poster ("Sotaman"); browsing describes the listings ("Sotuv"). */
const COPY = {
  post: {
    groups: { sotuvchi: 'Sotuvchi sifatida', xaridor: 'Xaridor sifatida' },
    labels: {} as Partial<Record<ListingIntent, string>>,
  },
  browse: {
    groups: { sotuvchi: 'Takliflar', xaridor: 'Xaridor soʻrovlari' },
    labels: {
      'kunlik-ijara': 'Kunlik ijara',
      ijara: 'Uzoq muddatli ijara',
      sotuv: 'Sotuv',
      'ijaraga-olish': 'Ijaraga olmoqchi',
      'sotib-olish': 'Sotib olmoqchi',
    } as Partial<Record<ListingIntent, string>>,
  },
};

/**
 * Seller / buyer intents as a side menu (desktop) or a chip row (mobile).
 * Pass `onSelect` to use it as a picker, or `hrefs` to use it as navigation.
 */
export function IntentNav({
  variant,
  active,
  onSelect,
  hrefs,
  label,
}: {
  variant: 'post' | 'browse';
  active: ListingIntent | null;
  onSelect?: (intent: ListingIntent) => void;
  hrefs?: Partial<Record<ListingIntent, string>>;
  label: string;
}) {
  const copy = COPY[variant];

  return (
    <nav
      aria-label={label}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:flex-col lg:gap-4 lg:overflow-visible"
    >
      {(['sotuvchi', 'xaridor'] as const).map((group) => (
        <div key={group} className="contents lg:block">
          <p className={sideGroupLabelClass}>{copy.groups[group]}</p>
          <ul className="contents lg:flex lg:flex-col lg:gap-0.5">
            {LISTING_INTENTS.filter((i) => i.group === group).map((intent) => {
              const Icon = ICONS[intent.id];
              const isActive = active === intent.id;
              const content = (
                <>
                  <Icon className={sideIconClass} strokeWidth={2} />
                  {copy.labels[intent.id] ?? intent.label}
                </>
              );
              const href = hrefs?.[intent.id];
              return (
                <li key={intent.id} className="contents lg:block">
                  {onSelect ? (
                    <button
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => onSelect(intent.id)}
                      className={itemClass(isActive)}
                    >
                      {content}
                    </button>
                  ) : href ? (
                    <Link href={href} aria-current={isActive ? 'page' : undefined} className={itemClass(isActive)}>
                      {content}
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Posting also covers jobs — one entry point for every listing type. */}
      {variant === 'post' && (
        <div className="contents lg:block lg:border-t lg:border-[var(--color-border)] lg:pt-3">
          <p className={sideGroupLabelClass}>Ish</p>
          <Link href={ROUTES.createJob} className={itemClass(false)}>
            <Briefcase className={sideIconClass} strokeWidth={2} />
            Vakansiya joylash
          </Link>
        </div>
      )}
    </nav>
  );
}
