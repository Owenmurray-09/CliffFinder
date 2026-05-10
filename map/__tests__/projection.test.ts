import { computeBoundingBox, distanceKm, formatDistance, project } from '../projection';

describe('computeBoundingBox', () => {
  test('single point: zero-area box gets defaults', () => {
    const box = computeBoundingBox([{ lat: 49, lng: -123 }], 0);
    expect(box.minLat).toBe(49);
    expect(box.maxLat).toBe(49);
    expect(box.minLng).toBe(-123);
    expect(box.maxLng).toBe(-123);
  });

  test('two points define the box', () => {
    const box = computeBoundingBox(
      [
        { lat: 49, lng: -123 },
        { lat: 50, lng: -122 },
      ],
      0,
    );
    expect(box).toEqual({ minLat: 49, maxLat: 50, minLng: -123, maxLng: -122 });
  });

  test('padding expands the box symmetrically', () => {
    const box = computeBoundingBox(
      [
        { lat: 0, lng: 0 },
        { lat: 10, lng: 10 },
      ],
      0.1,
    );
    expect(box.minLat).toBeCloseTo(-1, 5);
    expect(box.maxLat).toBeCloseTo(11, 5);
    expect(box.minLng).toBeCloseTo(-1, 5);
    expect(box.maxLng).toBeCloseTo(11, 5);
  });

  test('empty points: returns sensible default', () => {
    const box = computeBoundingBox([]);
    expect(box.minLat).toBe(-1);
    expect(box.maxLat).toBe(1);
  });
});

describe('project', () => {
  const box = { minLat: 49, maxLat: 50, minLng: -124, maxLng: -122 };

  test('north-west corner: x=0, y=0', () => {
    expect(project({ lat: 50, lng: -124 }, box)).toEqual({ x: 0, y: 0 });
  });

  test('south-east corner: x=1, y=1', () => {
    expect(project({ lat: 49, lng: -122 }, box)).toEqual({ x: 1, y: 1 });
  });

  test('center: x=0.5, y=0.5', () => {
    const r = project({ lat: 49.5, lng: -123 }, box);
    expect(r.x).toBeCloseTo(0.5, 5);
    expect(r.y).toBeCloseTo(0.5, 5);
  });

  test('y is flipped: northernmost lat maps to y=0', () => {
    expect(project({ lat: 50, lng: -123 }, box).y).toBe(0);
    expect(project({ lat: 49, lng: -123 }, box).y).toBe(1);
  });

  test('zero-area box: returns center', () => {
    const r = project({ lat: 49, lng: -123 }, { minLat: 49, maxLat: 49, minLng: -123, maxLng: -123 });
    expect(r).toEqual({ x: 0.5, y: 0.5 });
  });
});

describe('distanceKm', () => {
  test('same point is 0', () => {
    expect(distanceKm({ lat: 49, lng: -123 }, { lat: 49, lng: -123 })).toBe(0);
  });

  test('Vancouver to Squamish ≈ 47 km', () => {
    const km = distanceKm({ lat: 49.2827, lng: -123.1207 }, { lat: 49.7016, lng: -123.1558 });
    expect(km).toBeGreaterThan(40);
    expect(km).toBeLessThan(55);
  });

  test('Vancouver to Whistler ≈ 95 km', () => {
    const km = distanceKm({ lat: 49.2827, lng: -123.1207 }, { lat: 50.1163, lng: -122.9574 });
    expect(km).toBeGreaterThan(85);
    expect(km).toBeLessThan(105);
  });
});

describe('formatDistance', () => {
  test('< 10 km gets 1 decimal', () => {
    expect(formatDistance(2.143)).toBe('2.1 km');
    expect(formatDistance(9.9)).toBe('9.9 km');
  });
  test('>= 10 km gets integer', () => {
    expect(formatDistance(10)).toBe('10 km');
    expect(formatDistance(47.3)).toBe('47 km');
  });
});
