'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchX, Trash2, Loader2 } from 'lucide-react';
import { DEMO_LISTINGS } from '@/data/listings';
import { useAuth } from '@/context/AuthContext';
import { appToast } from '@/lib/feedback/toast';
import { removeUserListing, useIsClient, useUserListings } from '@/lib/listings/user-listings';
import { ROUTES } from '@/lib/navigation/routes';
import { isRestBackendEnabled } from '@/lib/api/config';
import { ListingDetail } from './ListingDetail';
import type { PropertyListing, ListingDeal, ListingPropertyType, ListingCurrency } from '@/types/listing';

function apiListingToProperty(raw: any): PropertyListing {
  const priceAmount = raw.price?.amount ?? (raw.priceAmount != null ? Number(raw.priceAmount) : 0);
  const priceCurrency: ListingCurrency = (raw.price?.currency ?? raw.priceCurrency ?? 'UZS') as ListingCurrency;

  const typeMap: Record<string, ListingDeal> = { rent: 'ijara', sale: 'sotuv' };
  const deal: ListingDeal = typeMap[raw.type] ?? 'sotuv';

  const propTypeMap: Record<string, ListingPropertyType> = { apartment: 'kvartira', house: 'uy', commercial: 'tijorat', land: 'yer' };
  const propertyType: ListingPropertyType = propTypeMap[raw.attrs?.propertyType] ?? 'kvartira';

  const images: string[] = Array.isArray(raw.media)
    ? raw.media
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        .map((m: any) => m.url)
        .filter(Boolean)
    : Array.isArray(raw.images) ? raw.images : [];

  const publishedAt = raw.publishedAt ?? raw.createdAt ?? '';
  const postedAt = typeof publishedAt === 'string' ? publishedAt.slice(0, 10) : '';

  const a = raw.attrs ?? {};
  const num = (v: unknown) => (v != null ? Number(v) : undefined);

  return {
    id: raw.id,
    deal,
    type: propertyType,
    title: raw.title ?? '',
    description: raw.description ?? '',
    price: Number.isFinite(priceAmount) ? priceAmount : 0,
    currency: priceCurrency,
    rentPeriod: deal === 'ijara' ? (a.rentPeriod ?? 'oy') : undefined,
    rooms: num(a.rooms ?? a.xonalar),
    area: num(a.area ?? a.maydon),
    landArea: num(a.landArea ?? a.yerMaydoni),
    floor: num(a.floor ?? a.qavat),
    totalFloors: num(a.totalFloors ?? a.qavatlar),
    region: a.region ?? a.viloyat ?? '',
    district: a.district ?? a.tuman ?? '',
    images,
    features: Array.isArray(a.features) ? a.features : [],
    postedAt,
    seller: {
      name: a.sellerName ?? 'Egasi',
      type: a.sellerType === 'agentlik' ? 'agentlik' : 'mulkdor',
      phone: a.phone ?? '',
    },
    ownerId: raw.userId,
    sold: raw.status === 'sold',
  };
}

export function UserListingView({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const isClient = useIsClient();
  const userListings = useUserListings();
  const localListing = userListings.find((l) => l.id === id);

  const [apiListing, setApiListing] = useState<PropertyListing | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);

  useEffect(() => {
    if (localListing || !isClient || !isRestBackendEnabled()) return;
    let cancelled = false;
    setApiLoading(true);
    import('@/lib/joymee/client').then(({ getJoymeeClient }) =>
      getJoymeeClient().listings.get(id)
    ).then((data) => {
      if (cancelled) return;
      setApiListing(apiListingToProperty(data));
    }).catch(() => {
      if (!cancelled) setApiFailed(true);
    }).finally(() => {
      if (!cancelled) setApiLoading(false);
    });
    return () => { cancelled = true; };
  }, [id, isClient, localListing]);

  const listing = localListing ?? apiListing;

  if (!isClient || apiLoading) {
    return (
      <div className="mx-auto mt-8 flex w-full max-w-6xl items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-muted)]" />
      </div>
    );
  }

  if (!listing) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-16 text-center">
        <SearchX className="mb-4 h-12 w-12 text-[var(--color-muted)]" />
        <h1 className="text-xl font-bold text-[var(--color-secondary)]">Eʼlon topilmadi</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">U oʻchirilgan yoki boshqa qurilmada joylangan boʻlishi mumkin.</p>
        <Link href={ROUTES.home} className="mt-6 rounded-xl bg-[var(--color-secondary)] px-5 py-3 text-sm font-semibold text-white">
          Bosh sahifaga
        </Link>
      </main>
    );
  }

  const similar = [...userListings, ...DEMO_LISTINGS]
    .filter((l) => l.deal === listing.deal && l.id !== listing.id)
    .slice(0, 4);

  const remove = () => {
    if (!window.confirm('Eʼlon oʻchirilsinmi?')) return;
    if (localListing) {
      removeUserListing(listing.id);
    }
    appToast.success('Eʼlon oʻchirildi');
    router.replace(ROUTES.home);
  };

  const isOwner = listing.ownerId === user?.id;

  return (
    <ListingDetail
      listing={listing}
      similar={similar}
      isDemo={false}
      ownerActions={
        isOwner ? (
          <button
            type="button"
            onClick={remove}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Eʼlonni oʻchirish
          </button>
        ) : null
      }
    />
  );
}
