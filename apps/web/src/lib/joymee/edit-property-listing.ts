import type { Listing } from '@joymee/types';
import type { ListingCurrency, ListingDeal, ListingPropertyType, PropertyListing } from '@/types/listing';
import { EMPTY_LISTING_FORM, type ListingFormData } from '@/lib/validations/listing.validation';
import { getJoymeeClient } from './client';
import { LISTING_INTENTS } from '@/lib/listings/format';

/**
 * Backend's categoryId lookup table (mirrors create-property-listing.ts).
 * We only need the uy-joy slice here.
 */
const CATEGORY_BY_PROPERTY_DEAL: Record<string, number> = {
  'kvartira-ijara': 10,
  'kvartira-sotuv': 11,
  'uy-sotuv': 12,
  'tijorat-ijara': 10,
  'tijorat-sotuv': 11,
  'yer-sotuv': 12,
};

function readAttr(l: Listing, key: string): string {
  const v = l.attrs?.[key];
  return v == null ? '' : String(v);
}

function dealFromType(t: Listing['type']): ListingDeal {
  if (t === 'rent') return 'ijara';
  if (t === 'sale') return 'sotuv';
  // Non-uy-joy listings don't open in this form, so just pick a safe default.
  return 'sotuv';
}

function propertyTypeFromCategory(categoryId: number, attrs: Listing['attrs']): ListingPropertyType {
  // Prefer the attr the create form stored; fall back to categoryId mapping.
  const raw = String(attrs?.property_type ?? '').trim();
  if (raw === 'kvartira' || raw === 'uy' || raw === 'tijorat' || raw === 'yer') return raw;
  if (categoryId === 12) return 'uy';
  return 'kvartira';
}

/** Build ListingFormData from a backend Listing so the create form can edit it. */
export function listingToFormData(l: Listing, sellerName: string, phone: string): ListingFormData {
  const type = propertyTypeFromCategory(l.categoryId, l.attrs);
  const deal = dealFromType(l.type);
  const rentPeriod = readAttr(l, 'ijara_davri') as 'oy' | 'kun' | '';
  const intent =
    LISTING_INTENTS.find(
      (i) => i.deal === deal && (i.rentPeriod ?? '') === rentPeriod && !i.seeking,
    )?.id ?? (deal === 'sotuv' ? 'sotuv' : 'ijara');

  const price = l.price?.amount ?? 0;
  const currency: ListingCurrency = (l.price?.currency as ListingCurrency) ?? 'USD';

  return {
    ...EMPTY_LISTING_FORM,
    intent,
    type,
    title: l.title,
    description: l.description,
    price: price > 0 ? String(price) : '',
    currency,
    rooms: readAttr(l, 'xonalar'),
    area: readAttr(l, 'maydon'),
    landArea: readAttr(l, 'yer_maydoni'),
    floor: readAttr(l, 'qavat'),
    totalFloors: readAttr(l, 'qavatlar_soni'),
    region: readAttr(l, 'hudud'),
    district: readAttr(l, 'tuman'),
    features: [],
    images: (l.media ?? []).filter((m) => m.kind === 'image').map((m) => m.url),
    sellerName,
    sellerType: 'mulkdor',
    phone,
  };
}

function categoryIdFor(listing: PropertyListing): number {
  return CATEGORY_BY_PROPERTY_DEAL[`${listing.type}-${listing.deal}`] ?? 10;
}

export async function updatePropertyListing(id: string, listing: PropertyListing): Promise<PropertyListing> {
  const client = getJoymeeClient();
  const type: 'rent' | 'sale' = listing.deal === 'ijara' ? 'rent' : 'sale';

  const attrs: Record<string, string> = { property_type: listing.type };
  if (listing.rooms != null) attrs.xonalar = String(listing.rooms);
  if (listing.area != null) attrs.maydon = String(listing.area);
  if (listing.landArea != null) attrs.yer_maydoni = String(listing.landArea);
  if (listing.floor != null) attrs.qavat = String(listing.floor);
  if (listing.totalFloors != null) attrs.qavatlar_soni = String(listing.totalFloors);
  if (listing.region) attrs.hudud = listing.region;
  if (listing.district) attrs.tuman = listing.district;
  if (listing.rentPeriod) attrs.ijara_davri = listing.rentPeriod;

  await client.listings.update(id, {
    type,
    categoryId: categoryIdFor(listing),
    title: listing.title.trim(),
    description: listing.description.trim(),
    price:
      listing.price > 0
        ? { amount: listing.price, currency: listing.currency === 'USD' ? 'USD' : 'UZS', negotiable: false }
        : null,
    media: (listing.images ?? []).map((url) => ({ url, kind: 'image' as const })),
    attrs,
  } as never);

  return { ...listing, id };
}
