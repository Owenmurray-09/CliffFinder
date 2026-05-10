import type { LogEntry, SavedSpot } from './types';

/** User's own jump log — most recent first. Powers the Logbook screen. */
export const LOG_ENTRIES: ReadonlyArray<LogEntry> = [
  {
    id: 'l1',
    spotId: 'eagle',
    date: '2026-05-04',
    heightJumped_m: 18,
    waterTemp_c: 14,
    rating: 5,
    notes: 'Best jump of the season. Wind was calm; entry felt clean.',
    tricks: ['cannonball', 'backflip'],
  },
  {
    id: 'l2',
    spotId: 'hidden',
    date: '2026-04-28',
    heightJumped_m: 12,
    waterTemp_c: 11,
    rating: 4,
    notes: 'Surface was choppy after the wind. Mid-day visibility was great.',
    tricks: ['gainer'],
  },
  {
    id: 'l3',
    spotId: 'vista',
    date: '2026-04-19',
    heightJumped_m: 15,
    waterTemp_c: 13,
    rating: 4,
    tricks: ['swan', 'backflip', 'gainer'],
  },
  {
    id: 'l4',
    spotId: 'riverside',
    date: '2026-04-10',
    heightJumped_m: 8,
    waterTemp_c: 12,
    rating: 4,
    tricks: [],
  },
];

/** Spots the user has saved, with the date they saved them. */
export const SAVED_SPOTS: ReadonlyArray<SavedSpot> = [
  { spotId: 'mossy', savedAt: '2026-04-22' },
  { spotId: 'vista', savedAt: '2026-03-30' },
];

/** Just the ids — kept for compatibility with the Map screen filter. */
export const SAVED_SPOT_IDS: ReadonlyArray<string> = SAVED_SPOTS.map((s) => s.spotId);
