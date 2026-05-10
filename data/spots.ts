import type { Spot } from './types';

/**
 * Five mock spots sourced from `CliffFinder Map.html` line 2248 SPOTS array.
 * Photo URLs use Unsplash hotlinks (per HANDOFF — not licensed for production;
 * licensed photography is a launch blocker per the design brief).
 */
export const SPOTS: ReadonlyArray<Spot> = [
  {
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
    photos: [
      'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=1200&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
      'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    ],
    description:
      'Park at the trailhead lot. 15-min hike up the south path; rope assist on the last 20 ft.',
    waterType: 'ocean',
    notes: 'Watch for boats in summer. Check water level after heavy rain.',
    distLabel: '2.1 km',
  },
  {
    id: 'hidden',
    name: 'Hidden Quarry',
    area: 'Whistler, BC',
    lat: 50.1163,
    lng: -122.9574,
    height_m: 12,
    depth_m: 8,
    rating: 4.3,
    reviewCount: 64,
    difficulty: 'beginner',
    category: 'saved',
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
      'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=1200&q=80',
    ],
    description:
      'Old quarry that fills with snowmelt. Calm flat surface, easy walk-in from the trailhead.',
    waterType: 'quarry',
    notes: 'Best on weekday mornings. Surface stays choppy in afternoon wind.',
    distLabel: '5.4 km',
  },
  {
    id: 'riverside',
    name: 'Riverside Bridge',
    area: 'Vancouver, BC',
    lat: 49.2827,
    lng: -123.1207,
    height_m: 8,
    depth_m: 4,
    rating: 3.8,
    reviewCount: 41,
    difficulty: 'beginner',
    category: 'friends',
    photos: [
      'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1200&q=80',
    ],
    description:
      'Footbridge with a wide swimming hole below. Park along the path and walk down to the bank.',
    waterType: 'river',
    notes: 'Watch the current after rain — entry zone shifts. Popular weekend hangout.',
    distLabel: '7.8 km',
  },
  {
    id: 'mossy',
    name: 'Mossy Falls',
    area: 'North Shore, BC',
    lat: 49.3528,
    lng: -123.071,
    height_m: 22,
    depth_m: 10,
    rating: 4.8,
    reviewCount: 212,
    difficulty: 'advanced',
    category: 'trending',
    photos: [
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
      'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    ],
    description:
      'Hike 30 minutes from the road, scramble down the boulder field to the plunge pool at the falls base.',
    waterType: 'falls',
    notes: 'Advanced jumpers only — entry window is narrow. Cold year-round.',
    distLabel: '9.2 km',
  },
  {
    id: 'vista',
    name: 'Vista Point',
    area: 'Sea-to-Sky, BC',
    lat: 49.9844,
    lng: -123.1558,
    height_m: 15,
    depth_m: 7,
    rating: 4.4,
    reviewCount: 88,
    difficulty: 'intermediate',
    category: 'saved',
    photos: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80',
    ],
    description:
      'Lakeside cliff with a viewpoint at the top. 10-minute walk from the lakeshore trailhead.',
    waterType: 'lake',
    notes: 'Mid-range height, clean water, broad landing area. Great first-trip spot.',
    distLabel: '12 km',
  },
];

export const getSpotById = (id: string): Spot | undefined =>
  SPOTS.find((s) => s.id === id);
