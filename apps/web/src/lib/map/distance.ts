import type { MapBounds, MapCoordinates } from '@/types';

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance in km between two coordinates (haversine). */
export function haversineKm(a: MapCoordinates, b: MapCoordinates): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** A square-ish bounding box of roughly `radiusKm` around a center point. */
export function boundsAround(center: MapCoordinates, radiusKm: number): MapBounds {
  const latDelta = radiusKm / 111.045;
  const cosLat = Math.cos(toRad(center.lat)) || 1e-9;
  const lngDelta = radiusKm / (111.045 * Math.abs(cosLat));
  return {
    north: center.lat + latDelta,
    south: center.lat - latDelta,
    west: center.lng - lngDelta,
    east: center.lng + lngDelta,
  };
}
