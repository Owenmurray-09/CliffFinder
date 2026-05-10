import { buildHtml } from '../MapBackdrop.web';
import type { Spot } from '@/data/types';

const spot = (overrides: Partial<Spot>): Spot =>
  ({
    id: 'eagle',
    name: 'Eagle Cliff',
    area: 'Squamish, BC',
    lat: 49.7016,
    lng: -123.1558,
    height_m: 18,
    depth_m: 6,
    rating: 4.6,
    reviewCount: 128,
    difficulty: 'intermediate',
    category: 'trending',
    photos: [],
    description: '',
    waterType: 'ocean',
    ...overrides,
  }) as Spot;

describe('buildHtml — Leaflet iframe srcDoc', () => {
  test('embeds the Leaflet CSS + JS from unpkg', () => {
    const html = buildHtml([spot({})]);
    expect(html).toContain('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
    expect(html).toContain('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
  });

  test('uses ESRI World Topo tiles per HANDOFF', () => {
    const html = buildHtml([spot({})]);
    expect(html).toContain(
      'server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    );
  });

  test('serializes spots into the SPOTS JS array', () => {
    const html = buildHtml([spot({ id: 'eagle', lat: 49.7, lng: -123.15 })]);
    expect(html).toContain('"id":"eagle"');
    expect(html).toContain('"lat":49.7');
    expect(html).toContain('"lng":-123.15');
  });

  test('maps category → pin color', () => {
    const html = buildHtml([
      spot({ id: 't', category: 'trending' }),
      spot({ id: 's', category: 'saved' }),
      spot({ id: 'f', category: 'friends' }),
    ]);
    expect(html).toContain('"color":"#E07A2E"');
    expect(html).toContain('"color":"#E8B742"');
    expect(html).toContain('"color":"#D17EA8"');
  });

  test('saved category gets dark text outline (yellow contrast)', () => {
    const html = buildHtml([spot({ category: 'saved' })]);
    expect(html).toContain('"saved":true');
  });

  test('centers the map on the centroid of provided spots', () => {
    // Two spots: lat 49 and lat 51 → centroid 50; lng -124 and -122 → centroid -123
    const html = buildHtml([
      spot({ id: 'a', lat: 49, lng: -124 }),
      spot({ id: 'b', lat: 51, lng: -122 }),
    ]);
    expect(html).toContain('setView([50, -123]');
  });

  test('falls back to a sensible default when given no spots', () => {
    const html = buildHtml([]);
    // Default 49.5, -123.1
    expect(html).toContain('setView([49.5, -123.1]');
  });

  test('emits postMessage on marker click with the spot id', () => {
    const html = buildHtml([spot({ id: 'eagle' })]);
    expect(html).toContain("window.parent.postMessage({ type: 'cf-spot-click', id: s.id }");
  });
});
