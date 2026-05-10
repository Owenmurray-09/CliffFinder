import { useSpotsStore } from '../spotsStore';

describe('spotsStore', () => {
  beforeEach(() => {
    useSpotsStore.getState().reset();
  });

  test('seeds from SPOTS', () => {
    const { spots, getById } = useSpotsStore.getState();
    expect(spots.length).toBeGreaterThan(0);
    expect(getById('eagle')?.name).toBe('Eagle Cliff');
  });

  test('addSpot prepends and assigns slug-based id, default rating, default category', () => {
    const before = useSpotsStore.getState().spots.length;
    const created = useSpotsStore.getState().addSpot({
      name: 'Test Spot',
      area: 'Somewhere',
      lat: 49,
      lng: -123,
      height_m: 10,
      depth_m: 5,
      difficulty: 'beginner',
      photos: ['https://example.com/a.jpg'],
      description: 'Hello',
      waterType: 'lake',
    });

    const { spots, getById } = useSpotsStore.getState();
    expect(spots.length).toBe(before + 1);
    expect(spots[0].id).toBe(created.id);
    expect(created.id).toBe('test-spot');
    expect(created.rating).toBe(0);
    expect(created.reviewCount).toBe(0);
    expect(created.category).toBe('friends');
    expect(getById('test-spot')).toBeDefined();
  });

  test('addSpot deduplicates ids when slug collides', () => {
    const base = {
      name: 'Same Name',
      area: 'X',
      lat: 0,
      lng: 0,
      height_m: 1,
      depth_m: 1,
      difficulty: 'beginner' as const,
      photos: [],
      description: '',
      waterType: 'lake' as const,
    };
    const a = useSpotsStore.getState().addSpot(base);
    const b = useSpotsStore.getState().addSpot(base);
    expect(a.id).toBe('same-name');
    expect(b.id).not.toBe('same-name');
    expect(useSpotsStore.getState().getById(b.id)).toBeDefined();
  });

  test('reset restores seeded state', () => {
    useSpotsStore.getState().addSpot({
      name: 'Throwaway',
      area: '',
      lat: 0,
      lng: 0,
      height_m: 1,
      depth_m: 1,
      difficulty: 'beginner',
      photos: [],
      description: '',
      waterType: 'lake',
    });
    const seedLen = useSpotsStore.getState().spots.length - 1;
    useSpotsStore.getState().reset();
    expect(useSpotsStore.getState().spots.length).toBe(seedLen);
  });
});
