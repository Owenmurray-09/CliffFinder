import { SPOTS } from '@/data/spots';

/**
 * Bounding box that snugly fits the BC mock spots, with a 6% padding so
 * pins don't sit on the absolute edge of the placeholder backdrop.
 */
export type BoundingBox = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

const PAD = 0.06;

export function computeBoundingBox(
  points: ReadonlyArray<{ lat: number; lng: number }>,
  pad: number = PAD,
): BoundingBox {
  if (points.length === 0) {
    return { minLat: -1, maxLat: 1, minLng: -1, maxLng: 1 };
  }
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }
  const latPad = (maxLat - minLat) * pad;
  const lngPad = (maxLng - minLng) * pad;
  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLng: minLng - lngPad,
    maxLng: maxLng + lngPad,
  };
}

/**
 * Project a lat/lng to normalized (x, y) ∈ [0, 1] within the given box.
 * `y` is flipped so that the highest latitude lands at y=0 (top of screen).
 */
export function project(
  point: { lat: number; lng: number },
  box: BoundingBox,
): { x: number; y: number } {
  const dLat = box.maxLat - box.minLat;
  const dLng = box.maxLng - box.minLng;
  if (dLat === 0 || dLng === 0) return { x: 0.5, y: 0.5 };
  return {
    x: (point.lng - box.minLng) / dLng,
    y: 1 - (point.lat - box.minLat) / dLat,
  };
}

/** The default bounding box used by the Map screen, computed once. */
export const SPOTS_BBOX: BoundingBox = computeBoundingBox(SPOTS);

/**
 * Mock "home" point — Vancouver center. Used to fake a "distance from me"
 * label until real geolocation lands. The 5 mock spots all sit within
 * ~100km of this point.
 */
export const HOME_POINT = { lat: 49.2827, lng: -123.1207 };

/** Haversine distance in kilometers between two lat/lng points. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sin1 = Math.sin(dLat / 2);
  const sin2 = Math.sin(dLng / 2);
  const h = sin1 * sin1 + Math.cos(lat1) * Math.cos(lat2) * sin2 * sin2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Format kilometers as "2.1 km" (1 dp under 10) or "47 km" (integer). */
export function formatDistance(km: number): string {
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}
