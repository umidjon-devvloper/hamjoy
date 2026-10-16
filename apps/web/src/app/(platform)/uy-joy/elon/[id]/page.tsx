import { notFound } from 'next/navigation';
import { ListingDetail } from '@/components/listings/ListingDetail';
import { UserListingView } from '@/components/listings/UserListingView';
import { ListingVisibilityGate } from '@/components/listings/ListingVisibilityGate';
import { DEMO_LISTINGS, getDemoListing } from '@/data/listings';
import { ROUTES } from '@/lib/navigation/routes';
import { createPageMetadata } from '@/lib/seo/metadata';

export function generateStaticParams() {
  return DEMO_LISTINGS.map((l) => ({ id: l.id }));
}

export async function generateMetadata(props: PageProps<'/uy-joy/elon/[id]'>) {
  const { id } = await props.params;
  const listing = getDemoListing(id);
  return createPageMetadata({
    title: listing ? listing.title : 'Uy-joy eʼloni',
    description: listing?.description.slice(0, 155) ?? 'Uy-joy eʼloni',
    path: ROUTES.listing(id),
  });
}

export default async function ListingPage(props: PageProps<'/uy-joy/elon/[id]'>) {
  const { id } = await props.params;
  const listing = getDemoListing(id);

  // Listings posted from this app live in the browser store (ids start with "u-").
  if (!listing && !id.startsWith('u-')) notFound();

  return (
    <>
      {listing ? (
        <ListingVisibilityGate id={listing.id}>
          <ListingDetail
            listing={listing}
            isDemo
            similar={DEMO_LISTINGS.filter((l) => l.deal === listing.deal && l.id !== listing.id).slice(0, 4)}
          />
        </ListingVisibilityGate>
      ) : (
        <ListingVisibilityGate id={id}>
          <UserListingView id={id} />
        </ListingVisibilityGate>
      )}
    </>
  );
}
