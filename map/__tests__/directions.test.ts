import { buildDirectionsUrl } from '../directions';

const eagle = { lat: 49.7016, lng: -123.1558, name: 'Eagle Cliff' };

describe('buildDirectionsUrl', () => {
  test('iOS uses maps:// scheme with daddr + q label', () => {
    const url = buildDirectionsUrl(eagle, 'ios');
    expect(url).toBe('maps://?daddr=49.7016,-123.1558&q=Eagle%20Cliff');
  });

  test('iOS without name omits q', () => {
    const url = buildDirectionsUrl({ lat: 49.7, lng: -123.1 }, 'ios');
    expect(url).toBe('maps://?daddr=49.7,-123.1');
  });

  test('Android uses google.navigation: with q coords', () => {
    const url = buildDirectionsUrl(eagle, 'android');
    expect(url).toBe('google.navigation:q=49.7016,-123.1558');
  });

  test('Android ignores name (Google Maps native nav uses coords only)', () => {
    const withName = buildDirectionsUrl(eagle, 'android');
    const withoutName = buildDirectionsUrl({ lat: 49.7016, lng: -123.1558 }, 'android');
    expect(withName).toBe(withoutName);
  });

  test('Web uses Google Maps universal dir URL with destination_name', () => {
    const url = buildDirectionsUrl(eagle, 'web');
    expect(url).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=49.7016,-123.1558&destination_name=Eagle%20Cliff',
    );
  });

  test('Web without name omits destination_name', () => {
    const url = buildDirectionsUrl({ lat: 49.7, lng: -123.1 }, 'web');
    expect(url).toBe('https://www.google.com/maps/dir/?api=1&destination=49.7,-123.1');
  });

  test('encodes special characters in the name', () => {
    const url = buildDirectionsUrl({ lat: 0, lng: 0, name: "St. Mary's Falls & Pool" }, 'web');
    expect(url).toContain('destination_name=St.%20Mary');
    expect(url).toContain('Falls%20%26%20Pool');
  });

  test('handles negative coordinates correctly', () => {
    const south = buildDirectionsUrl({ lat: -33.8688, lng: 151.2093 }, 'web');
    expect(south).toContain('destination=-33.8688,151.2093');
  });
});
