import type { MapProviderId } from '@/types';
import { getActiveMapProvider } from '../config';

export interface MapProviderMeta {
  id: MapProviderId;
  label: string;
  description: string;
}

const PROVIDERS: Record<MapProviderId, MapProviderMeta> = {
  placeholder: {
    id: 'placeholder',
    label: 'Placeholder',
    description: 'Demo map UI without external APIs',
  },
  google: {
    id: 'google',
    label: 'Google Maps',
    description: 'Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  },
  yandex: {
    id: 'yandex',
    label: 'Yandex Maps',
    description: 'Requires NEXT_PUBLIC_YANDEX_MAPS_API_KEY',
  },
  leaflet: {
    id: 'leaflet',
    label: 'Leaflet',
    description: 'Open-source maps via Leaflet + OSM tiles',
  },
};

export function getMapProviderMeta(id: MapProviderId = getActiveMapProvider()): MapProviderMeta {
  return PROVIDERS[id];
}

/**
 * Hook point for future provider-specific map runtimes.
 * JobMap reads this and renders the matching implementation.
 */
export function resolveMapImplementation(): MapProviderId {
  return getActiveMapProvider();
}
