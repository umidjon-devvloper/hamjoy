/** Real-estate listing (Uy-joy). Demo data lives in src/data/listings.ts until the API exists. */

export type ListingDeal = 'sotuv' | 'ijara';
export type ListingPropertyType = 'kvartira' | 'uy' | 'tijorat' | 'yer';
export type ListingCurrency = 'USD' | 'UZS';
export type ListingRentPeriod = 'oy' | 'kun';

/** What the poster wants — offers (sotuvchi) or requests (xaridor). */
export type ListingIntent = 'kunlik-ijara' | 'ijara' | 'sotuv' | 'ijaraga-olish' | 'sotib-olish';

export interface ListingSeller {
  name: string;
  type: 'mulkdor' | 'agentlik';
  phone: string;
}

export interface PropertyListing {
  id: string;
  deal: ListingDeal;
  type: ListingPropertyType;
  title: string;
  description: string;
  price: number;
  currency: ListingCurrency;
  /** Only for rentals. */
  rentPeriod?: ListingRentPeriod;
  rooms?: number;
  /** Living / usable area, m² (land plots use `landArea`). */
  area?: number;
  /** Land plot, sotix (houses and land). */
  landArea?: number;
  floor?: number;
  totalFloors?: number;
  region: string;
  district: string;
  /** Paths under /public; the first one is the cover. */
  images: string[];
  features: string[];
  /** ISO date (YYYY-MM-DD). */
  postedAt: string;
  isTop?: boolean;
  seller: ListingSeller;
  /** A buyer/renter request ("Sotib olaman", "Ijaraga olaman") rather than an offer. */
  seeking?: boolean;
  /** Set on listings posted from this app (not demo data). */
  ownerId?: string;
}
