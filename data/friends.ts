import type { Friend, RadarItem } from './types';

export const FRIENDS: ReadonlyArray<Friend> = [
  { id: 'maya', name: 'Maya Lin', handle: '@mayajumps' },
  { id: 'jordan', name: 'Jordan Reyes', handle: '@jordanr' },
  { id: 'sasha', name: 'Sasha Petrov', handle: '@sashap' },
  { id: 'noor', name: 'Noor Ahmadi', handle: '@noorah' },
  { id: 'leo', name: 'Leo Chen', handle: '@leoc' },
];

export const getFriendById = (id: string): Friend | undefined =>
  FRIENDS.find((f) => f.id === id);

/**
 * Friend activity feed — most recent first. Drives the Radar screen.
 * Dates are ISO strings in the past relative to today (2026-05-09).
 */
export const RADAR_FEED: ReadonlyArray<RadarItem> = [
  {
    kind: 'jump',
    id: 'r1',
    friendId: 'maya',
    spotId: 'eagle',
    rating: 5,
    when: '2026-05-08T14:22:00Z',
  },
  {
    kind: 'spot_added',
    id: 'r2',
    friendId: 'jordan',
    spotId: 'mossy',
    when: '2026-05-07T09:15:00Z',
  },
  {
    kind: 'jump',
    id: 'r3',
    friendId: 'sasha',
    spotId: 'hidden',
    rating: 4,
    when: '2026-05-05T18:40:00Z',
  },
  {
    kind: 'follow',
    id: 'r4',
    friendId: 'noor',
    when: '2026-05-04T11:02:00Z',
  },
  {
    kind: 'jump',
    id: 'r5',
    friendId: 'leo',
    spotId: 'vista',
    rating: 4,
    when: '2026-05-03T16:30:00Z',
  },
];
