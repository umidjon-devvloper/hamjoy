import type { PropertyListing } from '@/types/listing';
import { getJoymeeClient } from './client';

const DEFAULT_LOCATION_ID = 1; // Toshkent sh. (seed)

/**
 * Category map for the real-estate form.
 * Keep in sync with apps/api/src/db/seed.ts.
 */
const CATEGORY_BY_PROPERTY_DEAL: Record<string, number> = {
  'kvartira-ijara': 10,
  'kvartira-sotuv': 11,
  'uy-sotuv': 12,
  'tijorat-ijara': 10,
  'tijorat-sotuv': 11,
  'yer-sotuv': 12,
};

function categoryIdFor(listing: PropertyListing): number {
  return CATEGORY_BY_PROPERTY_DEAL[`${listing.type}-${listing.deal}`] ?? 10;
}

export async function postPropertyListing(listing: PropertyListing): Promise<PropertyListing> {
  const client = getJoymeeClient();
  const type: 'rent' | 'sale' = listing.deal === 'ijara' ? 'rent' : 'sale';

  const attrs: Record<string, string> = {};
  if (listing.rooms != null) attrs.xonalar = String(listing.rooms);
  if (listing.area != null) attrs.maydon = String(listing.area);
  if (listing.landArea != null) attrs.yer_maydoni = String(listing.landArea);
  if (listing.floor != null) attrs.qavat = String(listing.floor);
  if (listing.totalFloors != null) attrs.qavatlar_soni = String(listing.totalFloors);
  if (listing.region) attrs.hudud = listing.region;
  if (listing.district) attrs.tuman = listing.district;
  if (listing.rentPeriod) attrs.ijara_davri = listing.rentPeriod;

  const created = await client.listings.create({
    type,
    categoryId: categoryIdFor(listing),
    locationId: DEFAULT_LOCATION_ID,
    title: listing.title.trim(),
    description: listing.description.trim(),
    price:
      listing.price > 0
        ? { amount: listing.price, currency: listing.currency === 'USD' ? 'USD' : 'UZS', negotiable: false }
        : null,
    media: (listing.images ?? []).map((url: string) => ({ url, kind: 'image' as const })),
    attrs,
  } as never);

  await client.listings.publish(created.id);

  return {
    ...listing,
    id: created.id,
    postedAt: new Date().toISOString().slice(0, 10),
  };
}
