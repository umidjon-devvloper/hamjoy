export type Currency = 'UZS' | 'USD';

export type Locale = 'uz' | 'ru' | 'en';

export interface Paginated<T> {
  items: T[];
  total: number;
  cursor: string | null;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export type Timestamp = string;
export type UUID = string;
