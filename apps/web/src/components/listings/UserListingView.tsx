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
import { apiListingToProperty } from '@/lib/listings/api-mapping';
import type { PropertyListing } from '@/types/listing';

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
