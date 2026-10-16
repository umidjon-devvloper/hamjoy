import type { MapBounds, MapCoordinates, MapMarkerPosition } from '@/types';
import { DEFAULT_MAP_VIEWPORT } from './config';

export function coordsToPercent(
  lat: number,
  lng: number,
  bounds: MapBounds = DEFAULT_MAP_VIEWPORT.bounds
): MapMarkerPosition {
  const latSpan = bounds.north - bounds.south;
  const lngSpan = bounds.east - bounds.west;

  const topPct = ((bounds.north - lat) / latSpan) * 100;
  const leftPct = ((lng - bounds.west) / lngSpan) * 100;

  return {
    top: `${clampPercent(topPct)}%`,
    left: `${clampPercent(leftPct)}%`,
  };
}

export function percentToCoords(
  top: string,
  left: string,
  bounds: MapBounds = DEFAULT_MAP_VIEWPORT.bounds
): MapCoordinates {
  const topPct = parseFloat(top) / 100;
  const leftPct = parseFloat(left) / 100;
  const latSpan = bounds.north - bounds.south;
  const lngSpan = bounds.east - bounds.west;

  return {
    lat: bounds.north - topPct * latSpan,
    lng: bounds.west + leftPct * lngSpan,
  };
}

function clampPercent(value: number): number {
  return Math.min(90, Math.max(10, Math.round(value * 10) / 10));
}

/** Stable scatter for jobs without coordinates */
export function fallbackPositionForId(id: string, index = 0): MapMarkerPosition {
  let hash = index * 17;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % 1000;
  }

  const row = Math.floor(hash / 5) % 4;
  const col = hash % 5;

  return {
    top: `${18 + row * 18}%`,
    left: `${12 + col * 16}%`,
  };
}

/** Remote jobs cluster along the top edge */
export function remoteMarkerPosition(index: number): MapMarkerPosition {
  const col = index % 6;
  const row = Math.floor(index / 6);
  return {
    top: `${10 + row * 8}%`,
    left: `${8 + col * 14}%`,
  };
}

export function pickerDemoPoints(): Array<MapMarkerPosition & MapCoordinates> {
  return [
    { top: '30%', left: '25%', lat: 40.7128, lng: -74.006 },
    { top: '45%', left: '55%', lat: 40.758, lng: -73.9855 },
    { top: '62%', left: '38%', lat: 40.6892, lng: -74.0445 },
  ];
}
