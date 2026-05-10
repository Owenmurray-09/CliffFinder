import { FRIENDS, RADAR_FEED, getFriendById } from '../friends';
import { LOG_ENTRIES, SAVED_SPOT_IDS } from '../logEntries';
import { SPOTS, getSpotById } from '../spots';
import { CURRENT_USER } from '../user';
import type { SpotCategory } from '../types';

describe('SPOTS data', () => {
  test('exactly 5 spots (matches design source)', () => {
    expect(SPOTS).toHaveLength(5);
  });

  test('every spot has unique id', () => {
    const ids = SPOTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every spot has rating in [0, 5]', () => {
    for (const s of SPOTS) {
      expect(s.rating).toBeGreaterThanOrEqual(0);
      expect(s.rating).toBeLessThanOrEqual(5);
    }
  });

  test('every spot has at least one photo URL', () => {
    for (const s of SPOTS) {
      expect(s.photos.length).toBeGreaterThan(0);
      for (const p of s.photos) expect(p).toMatch(/^https?:\/\//);
    }
  });

  test('every spot has a sane lat/lng', () => {
    for (const s of SPOTS) {
      expect(s.lat).toBeGreaterThanOrEqual(-90);
      expect(s.lat).toBeLessThanOrEqual(90);
      expect(s.lng).toBeGreaterThanOrEqual(-180);
      expect(s.lng).toBeLessThanOrEqual(180);
    }
  });

  test('category covers all 3 semantic values', () => {
    const cats = new Set(SPOTS.map((s) => s.category));
    const expected: SpotCategory[] = ['trending', 'saved', 'friends'];
    for (const c of expected) expect(cats.has(c)).toBe(true);
  });

  test('difficulty covers all 3 values', () => {
    const diffs = new Set(SPOTS.map((s) => s.difficulty));
    expect(diffs.has('beginner')).toBe(true);
    expect(diffs.has('intermediate')).toBe(true);
    expect(diffs.has('advanced')).toBe(true);
  });

  test('getSpotById returns the right spot', () => {
    expect(getSpotById('eagle')?.name).toBe('Eagle Cliff');
    expect(getSpotById('does-not-exist')).toBeUndefined();
  });
});

describe('USER data', () => {
  test('current user has all required fields', () => {
    expect(CURRENT_USER.id).toBeTruthy();
    expect(CURRENT_USER.name).toBeTruthy();
    expect(CURRENT_USER.email).toMatch(/@/);
    expect(CURRENT_USER.handle.startsWith('@')).toBe(true);
  });
});

describe('FRIENDS data', () => {
  test('friends array is non-empty + ids unique', () => {
    expect(FRIENDS.length).toBeGreaterThan(0);
    const ids = FRIENDS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every friend handle starts with @', () => {
    for (const f of FRIENDS) expect(f.handle.startsWith('@')).toBe(true);
  });

  test('getFriendById round-trips', () => {
    expect(getFriendById('maya')?.name).toBe('Maya Lin');
    expect(getFriendById('does-not-exist')).toBeUndefined();
  });
});

describe('RADAR_FEED data', () => {
  test('non-empty', () => {
    expect(RADAR_FEED.length).toBeGreaterThan(0);
  });

  test('every item references a real friend', () => {
    for (const item of RADAR_FEED) {
      expect(getFriendById(item.friendId)).toBeDefined();
    }
  });

  test('jump/spot_added items reference a real spot', () => {
    for (const item of RADAR_FEED) {
      if (item.kind === 'jump' || item.kind === 'spot_added') {
        expect(getSpotById(item.spotId)).toBeDefined();
      }
    }
  });

  test('items are sorted most-recent first', () => {
    for (let i = 1; i < RADAR_FEED.length; i++) {
      expect(new Date(RADAR_FEED[i - 1]!.when).getTime()).toBeGreaterThanOrEqual(
        new Date(RADAR_FEED[i]!.when).getTime(),
      );
    }
  });
});

describe('LOG_ENTRIES data', () => {
  test('non-empty', () => {
    expect(LOG_ENTRIES.length).toBeGreaterThan(0);
  });

  test('every entry references a real spot', () => {
    for (const entry of LOG_ENTRIES) {
      expect(getSpotById(entry.spotId)).toBeDefined();
    }
  });

  test('every entry has rating in [0, 5]', () => {
    for (const entry of LOG_ENTRIES) {
      expect(entry.rating).toBeGreaterThanOrEqual(0);
      expect(entry.rating).toBeLessThanOrEqual(5);
    }
  });

  test('entries are sorted most-recent first', () => {
    for (let i = 1; i < LOG_ENTRIES.length; i++) {
      expect(LOG_ENTRIES[i - 1]!.date >= LOG_ENTRIES[i]!.date).toBe(true);
    }
  });

  test('SAVED_SPOT_IDS reference real spots', () => {
    for (const id of SAVED_SPOT_IDS) {
      expect(getSpotById(id)).toBeDefined();
    }
  });
});
