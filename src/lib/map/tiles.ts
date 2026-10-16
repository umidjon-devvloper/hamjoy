import { MAP_TILE_URL } from './config';

/**
 * Slippy-map ("XYZ") tile math. Lets us render a real map thumbnail from a
 * single raster tile plus a CSS-positioned pin — no heavy map engine needed,
 * which is what makes per-card mini-maps cheap on a long list.
 *
 * Reference: https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
 */

export interface TilePreview {
  /** URL of the single raster tile that contains the coordinate. */
  url: string;
  /** Pin position inside that tile, as CSS percentages (0–100). */
  pin: { top: string; left: string };
  zoom: number;
}

function lngToTileXf(lng: number, z: number): number {
  return ((lng + 180) / 360) * 2 ** z;
}

function latToTileYf(lat: number, z: number): number {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z;
}

function fillTemplate(template: string, z: number, x: number, y: number): string {
  return template
    .replace('{z}', String(z))
    .replace('{x}', String(x))
    .replace('{y}', String(y));
}

/**
 * Resolve the tile + in-tile pin position for a coordinate at the given zoom.
 * Higher zoom = more detail / tighter area (12 ≈ city district).
 */
export function staticTileForCoords(lat: number, lng: number, zoom = 12): TilePreview {
  const n = 2 ** zoom;
  const xf = lngToTileXf(lng, zoom);
  const yf = latToTileYf(lat, zoom);
  const x = Math.floor(xf);
  const y = Math.floor(yf);

  const clamp = (v: number) => Math.min(99, Math.max(1, v));

  return {
    url: fillTemplate(MAP_TILE_URL, zoom, ((x % n) + n) % n, ((y % n) + n) % n),
    pin: {
      left: `${clamp((xf - x) * 100)}%`,
      top: `${clamp((yf - y) * 100)}%`,
    },
    zoom,
  };
}

/** A row of tiles covering [west,east] × [north,south] for a full map backdrop. */
export interface TileGrid {
  zoom: number;
  tiles: Array<{ url: string; left: string; top: string; width: string; height: string }>;
}

export function tileGridForBounds(
  bounds: { north: number; south: number; west: number; east: number },
  zoom: number
): TileGrid {
  const x0 = Math.floor(lngToTileXf(bounds.west, zoom));
  const x1 = Math.floor(lngToTileXf(bounds.east, zoom));
  const y0 = Math.floor(latToTileYf(bounds.north, zoom));
  const y1 = Math.floor(latToTileYf(bounds.south, zoom));

  const xfMin = lngToTileXf(bounds.west, zoom);
  const xfMax = lngToTileXf(bounds.east, zoom);
  const yfMin = latToTileYf(bounds.north, zoom);
  const yfMax = latToTileYf(bounds.south, zoom);
  const spanX = xfMax - xfMin || 1;
  const spanY = yfMax - yfMin || 1;

  const tiles: TileGrid['tiles'] = [];
  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      tiles.push({
        url: fillTemplate(MAP_TILE_URL, zoom, x, y),
        left: `${((x - xfMin) / spanX) * 100}%`,
        top: `${((y - yfMin) / spanY) * 100}%`,
        width: `${(1 / spanX) * 100}%`,
        height: `${(1 / spanY) * 100}%`,
      });
    }
  }

  return { zoom, tiles };
}

/**
 * Project a coordinate to a percent position inside `bounds` using the SAME
 * Mercator/tile math as `tileGridForBounds` — so markers align exactly with the
 * tiled backdrop (unlike the linear lat/lng projection in coordinates.ts).
 */
export function projectWithinBounds(
  lat: number,
  lng: number,
  bounds: { north: number; south: number; west: number; east: number },
  zoom: number
): { top: string; left: string; inView: boolean } {
  const xfMin = lngToTileXf(bounds.west, zoom);
  const xfMax = lngToTileXf(bounds.east, zoom);
  const yfMin = latToTileYf(bounds.north, zoom);
  const yfMax = latToTileYf(bounds.south, zoom);
  const left = ((lngToTileXf(lng, zoom) - xfMin) / (xfMax - xfMin || 1)) * 100;
  const top = ((latToTileYf(lat, zoom) - yfMin) / (yfMax - yfMin || 1)) * 100;
  return {
    left: `${left}%`,
    top: `${top}%`,
    inView: left >= -5 && left <= 105 && top >= -5 && top <= 105,
  };
}

/** Pick a zoom level so the bounds roughly fill `tilesAcross` tiles horizontally. */
export function fitZoomForBounds(
  bounds: { west: number; east: number },
  tilesAcross = 3
): number {
  for (let z = 14; z >= 2; z--) {
    const span = lngToTileXf(bounds.east, z) - lngToTileXf(bounds.west, z);
    if (span <= tilesAcross) return z;
  }
  return 2;
}
