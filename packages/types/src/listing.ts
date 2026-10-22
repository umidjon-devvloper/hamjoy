import type { Currency, GeoPoint, Timestamp, UUID } from './common';

export type ListingType = 'job' | 'rent' | 'sale' | 'service';
export type ListingStatus = 'draft' | 'pending' | 'active' | 'sold' | 'archived' | 'blocked';

export interface ListingMedia {
  id: UUID;
  url: string;
  kind: 'image' | 'video';
  order: number;
}

export interface Listing {
  id: UUID;
  userId: UUID;
  type: ListingType;
  categoryId: number;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: Currency;
    negotiable: boolean;
  } | null;
  locationId: number;
  geo: GeoPoint | null;
  status: ListingStatus;
  media: ListingMedia[];
  attrs: Record<string, string | number | boolean>;
  viewsCount: number;
  favoritesCount: number;
  createdAt: Timestamp;
  publishedAt: Timestamp | null;
  expiresAt: Timestamp | null;
}

export interface ListingSearchQuery {
  q?: string;
  type?: ListingType;
  categoryId?: number;
  locationId?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  priceMin?: number;
  priceMax?: number;
  currency?: Currency;
  cursor?: string;
  limit?: number;
}
