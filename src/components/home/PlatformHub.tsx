'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Carousel, type Slide } from '@/components/ui/Carousel';
import { ListingsSection } from '@/components/listings/ListingsSection';
import { DEMO_LISTINGS } from '@/data/listings';
import { formatListingPrice } from '@/lib/listings/format';
import { useUserListings } from '@/lib/listings/user-listings';
import { useListingModeration } from '@/lib/listings/moderation';
import { ROUTES } from '@/lib/navigation/routes';

const HERO_SLIDE_COUNT = 5;
const LISTING_SLIDE_PREFIX = 'listing:';

/** Hand-picked banner shown before the listing slides. */
const PROMO_SLIDE: Slide & { href: string } = {
  id: 'promo-uy-joy',
  title: 'Orzuingizdagi uyni toping',
  subtitle: 'Hovli va kvartiralar — sotuv va ijara',
  image: '/carousel/uy-joy-hovli.webp',
  cover: true,
  href: ROUTES.uyJoy.sale,
};

/** Uy-joy hero: the promo, then TOP / newest offers that have photos. */
function UyJoyCarousel() {
  const router = useRouter();
  const userListings = useUserListings();
  const { isVisible } = useListingModeration();

  const slides = useMemo<Slide[]>(() => {
    const offers = [...userListings, ...DEMO_LISTINGS]
      .filter((l) => !l.seeking && l.images.length > 0 && isVisible(l.id))
      .sort((a, b) => Number(Boolean(b.isTop)) - Number(Boolean(a.isTop)))
      .slice(0, HERO_SLIDE_COUNT)
      .map((l) => ({
        id: `${LISTING_SLIDE_PREFIX}${l.id}`,
        title: l.title,
        // The carousel's price slot only formats numbers; listings mix $ and soʻm.
        subtitle: `${formatListingPrice(l)} · ${l.district}`,
        image: l.images[0],
        cover: true,
      }));
    return [PROMO_SLIDE, ...offers];
  }, [userListings, isVisible]);

  return (
    <Carousel
      slides={slides}
      onSlideClick={(id) => {
        const key = String(id);
        router.push(
          key.startsWith(LISTING_SLIDE_PREFIX)
            ? ROUTES.listing(key.slice(LISTING_SLIDE_PREFIX.length))
            : PROMO_SLIDE.href
        );
      }}
    />
  );
}

/** Home in Uy-joy mode (the default). Jobs live in Ish mode: /home/ish. */
export function PlatformHub() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <UyJoyCarousel />
      <ListingsSection />
    </div>
  );
}
