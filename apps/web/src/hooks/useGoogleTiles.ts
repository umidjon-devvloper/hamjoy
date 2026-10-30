'use client';

import {
  isGoogleTilesEnabled,
  googleTileTemplate,
} from '@/lib/map/google-tiles';

export function useGoogleTiles(): string | undefined {
  if (!isGoogleTilesEnabled()) return undefined;
  return googleTileTemplate();
}
