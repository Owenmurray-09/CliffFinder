import type { LogEntry } from './types';

/** User's own jump log — most recent first. Powers Logbook screen. */
export const LOG_ENTRIES: ReadonlyArray<LogEntry> = [
  {
    id: 'l1',
    spotId: 'eagle',
    date: '2026-05-04',
    heightJumped_m: 18,
    waterTemp_c: 14,
    rating: 5,
    notes: 'Best jump of the season. Wind was calm; entry felt clean.',
  },
  {
    id: 'l2',
    spotId: 'hidden',
    date: '2026-04-28',
    heightJumped_m: 12,
    waterTemp_c: 11,
    rating: 4,
    notes: 'Surface was choppy after the wind. Mid-day visibility was great.',
  },
  {
    id: 'l3',
    spotId: 'vista',
    date: '2026-04-19',
    heightJumped_m: 15,
    waterTemp_c: 13,
    rating: 4,
  },
];

/** IDs of spots the user has saved (separate list per HANDOFF schema). */
export const SAVED_SPOT_IDS: ReadonlyArray<string> = ['hidden', 'vista'];
