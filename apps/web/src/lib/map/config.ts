import type { MapProviderId, MapViewport } from '@/types';

/**
 * Map provider configuration.
 * Set NEXT_PUBLIC_MAP_PROVIDER to google | yandex | leaflet when API keys are added.
 * Defaults to placeholder (no API key required).
 */
export const MAP_PROVIDER: MapProviderId =
  (process.env.NEXT_PUBLIC_MAP_PROVIDER as MapProviderId | undefined) ?? 'placeholder';

export const MAP_API_KEYS = {
  google: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  yandex: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? '',
} as const;

/**
 * Raster tile template for real map imagery (no API key required by default).
 * OpenStreetMap suits development/portfolio scale; for production scale point
 * NEXT_PUBLIC_MAP_TILE_URL at your own tile CDN or a keyed provider.
 * `{z}/{x}/{y}` are slippy-map tile coordinates.
 */
export const MAP_TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MAP_TILE_ATTRIBUTION = '© OpenStreetMap';

/** Default focus for "jobs near me" when geolocation is unavailable — Tashkent. */
export const DEFAULT_MAP_CENTER = { lat: 41.2995, lng: 69.2401 };

export function isMapProviderConfigured(provider: MapProviderId): boolean {
  switch (provider) {
    case 'placeholder':
      return true;
    case 'leaflet':
      return true;
    case 'google':
      return MAP_API_KEYS.google.length > 0;
    case 'yandex':
      return MAP_API_KEYS.yandex.length > 0;
    default:
      return false;
  }
}

/** Active provider — falls back to placeholder when keys are missing */
export function getActiveMapProvider(): MapProviderId {
  if (MAP_PROVIDER !== 'placeholder' && isMapProviderConfigured(MAP_PROVIDER)) {
    return MAP_PROVIDER;
  }
  return 'placeholder';
}

/** Default viewport for coordinate → percent projection — Uzbekistan. */
export const DEFAULT_MAP_VIEWPORT: MapViewport = {
  center: { lat: 41.3775, lng: 64.5853 },
  zoom: 6,
  bounds: {
    north: 45.6,
    south: 37.2,
    west: 55.9,
    east: 73.2,
  },
};

/** Tighter bounds focused on Greater Tashkent, where most listings cluster. */
export const TASHKENT_VIEWPORT: MapViewport = {
  center: { lat: 41.2995, lng: 69.2401 },
  zoom: 11,
  bounds: {
    north: 41.42,
    south: 41.18,
    west: 69.1,
    east: 69.42,
  },
};
