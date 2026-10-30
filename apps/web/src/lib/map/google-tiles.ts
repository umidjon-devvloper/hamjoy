import { MAP_API_KEYS } from './config';

export function isGoogleTilesEnabled(): boolean {
  return MAP_API_KEYS.google.length > 0;
}

export function googleTileTemplate(): string {
  return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
}
