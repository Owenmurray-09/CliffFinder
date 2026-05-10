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
