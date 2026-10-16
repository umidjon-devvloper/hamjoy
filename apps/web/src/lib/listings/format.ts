import type {
  ListingDeal,
  ListingIntent,
  ListingPropertyType,
  ListingRentPeriod,
  PropertyListing,
} from '@/types/listing';

export const DEAL_LABELS: Record<ListingDeal, string> = {
  sotuv: 'Sotuv',
  ijara: 'Ijara',
};

export const PROPERTY_TYPE_LABELS: Record<ListingPropertyType, string> = {
  kvartira: 'Kvartira',
  uy: 'Hovli/dacha',
  tijorat: 'Tijorat binolari',
  yer: 'Yer',
};

export interface ListingIntentOption {
  id: ListingIntent;
  label: string;
  /** Short badge text on cards. */
  badge: string;
  group: 'sotuvchi' | 'xaridor';
  deal: ListingDeal;
  rentPeriod?: ListingRentPeriod;
  seeking: boolean;
}

/** OLX-style "what do you want to do" choices, grouped by seller / buyer. */
export const LISTING_INTENTS: ListingIntentOption[] = [
  { id: 'kunlik-ijara', label: 'Kunlik ijaraga beraman', badge: 'Kunlik ijara', group: 'sotuvchi', deal: 'ijara', rentPeriod: 'kun', seeking: false },
  { id: 'ijara', label: 'Ijaraga beraman', badge: 'Ijara', group: 'sotuvchi', deal: 'ijara', rentPeriod: 'oy', seeking: false },
  { id: 'sotuv', label: 'Sotaman', badge: 'Sotuv', group: 'sotuvchi', deal: 'sotuv', seeking: false },
  { id: 'ijaraga-olish', label: 'Ijaraga olaman', badge: 'Ijaraga olaman', group: 'xaridor', deal: 'ijara', rentPeriod: 'oy', seeking: true },
  { id: 'sotib-olish', label: 'Sotib olaman', badge: 'Sotib olaman', group: 'xaridor', deal: 'sotuv', seeking: true },
];

export function getListingIntent(listing: Pick<PropertyListing, 'deal' | 'rentPeriod' | 'seeking'>): ListingIntentOption {
  return (
    LISTING_INTENTS.find(
      (i) =>
        i.deal === listing.deal &&
        i.seeking === Boolean(listing.seeking) &&
        (i.seeking || i.deal === 'sotuv' || i.rentPeriod === (listing.rentPeriod ?? 'oy'))
    ) ?? LISTING_INTENTS[2]
  );
}

const MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];

/** 1234567 → "1 234 567". Done by hand so server and browser render the same string. */
export function groupDigits(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** "$89 000", "4 500 000 soʻm / oy". */
export function formatListingPrice(listing: Pick<PropertyListing, 'price' | 'currency' | 'rentPeriod'>): string {
  const amount =
    listing.currency === 'USD' ? `$${groupDigits(listing.price)}` : `${groupDigits(listing.price)} soʻm`;
  return listing.rentPeriod ? `${amount} / ${listing.rentPeriod}` : amount;
}

/** "2026-10-11" → "11-oktabr". Timezone-free so it never shifts a day between server and client. */
export function formatListingDate(iso: string): string {
  const [, month, day] = iso.split('-').map(Number);
  return `${day}-${MONTHS[month - 1] ?? ''}`;
}

/** Short spec line: ["3 xona", "78 m²", "5/9 qavat"]. */
export function listingSpecs(listing: PropertyListing): string[] {
  const specs: string[] = [];
  if (listing.rooms) specs.push(`${listing.rooms} xona`);
  if (listing.area) specs.push(`${listing.area} m²`);
  if (listing.landArea) specs.push(`${listing.landArea} sotix`);
  if (listing.floor && listing.totalFloors) specs.push(`${listing.floor}/${listing.totalFloors} qavat`);
  else if (listing.totalFloors) specs.push(`${listing.totalFloors} qavatli`);
  return specs;
}

/** URL filters the demo data can answer; the rest are shown but not applied yet. */
export const SUPPORTED_LISTING_FILTERS = ['tur', 'xona', 'muddat', 'bitim'] as const;

/** Where each intent lives when browsing (the left menu on /uy-joy/*). */
export const INTENT_BROWSE_HREFS: Record<ListingIntent, string> = {
  'kunlik-ijara': '/uy-joy/ijara?muddat=kunlik',
  ijara: '/uy-joy/ijara?muddat=oylik',
  sotuv: '/uy-joy/sotuv',
  'ijaraga-olish': '/uy-joy/olish?bitim=ijara',
  'sotib-olish': '/uy-joy/olish?bitim=sotuv',
};

/** Listing pages: offers under /uy-joy/sotuv|ijara, buyer requests under /uy-joy/olish. */
export type ListingSection = ListingDeal | 'olish';

export type ListingSearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function filterListings(
  listings: PropertyListing[],
  section: ListingSection,
  params: ListingSearchParams = {}
): PropertyListing[] {
  const type = first(params.tur);
  const rooms = first(params.xona);
  const period = first(params.muddat);
  const wantedDeal = first(params.bitim);

  return listings.filter((l) => {
    if (section === 'olish') {
      if (!l.seeking) return false;
    } else if (l.seeking || l.deal !== section) {
      return false;
    }
    if (section === 'olish' && wantedDeal && l.deal !== wantedDeal) return false;
    if (period === 'kunlik' && l.rentPeriod !== 'kun') return false;
    if (period === 'oylik' && l.rentPeriod !== 'oy') return false;
    if (type && l.type !== type) return false;
    if (rooms) {
      if (rooms.endsWith('+')) {
        if ((l.rooms ?? 0) < Number(rooms.slice(0, -1))) return false;
      } else if (l.rooms !== Number(rooms)) {
        return false;
      }
    }
    return true;
  });
}

/** Which intent the current listing page shows; null when it mixes several (e.g. all requests). */
export function activeBrowseIntent(section: ListingSection, params: ListingSearchParams): ListingIntent | null {
  if (section === 'sotuv') return 'sotuv';
  if (section === 'ijara') return first(params.muddat) === 'kunlik' ? 'kunlik-ijara' : 'ijara';
  const deal = first(params.bitim);
  return deal === 'ijara' ? 'ijaraga-olish' : deal === 'sotuv' ? 'sotib-olish' : null;
}

/** Keeps the intent params (muddat / bitim) and swaps the property type. */
export function propertyTypeHref(section: ListingSection, params: ListingSearchParams, type?: ListingPropertyType) {
  const next = new URLSearchParams();
  for (const key of ['muddat', 'bitim']) {
    const value = first(params[key]);
    if (value) next.set(key, value);
  }
  if (type) next.set('tur', type);
  const query = next.toString();
  return `/uy-joy/${section}${query ? `?${query}` : ''}`;
}
