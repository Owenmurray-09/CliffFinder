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
      'Granite cliff on the south side of the lake. Climb the trail, rope assist on the last 20 ft. Crystal-clear water and wide entry zone.',
    waterType: 'ocean',
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
      'Old quarry that fills with snowmelt. Calm flat surface, easy walk-in from the trailhead. Best on weekday mornings.',
    waterType: 'quarry',
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
      'Footbridge with a wide swimming hole below. Watch the current after rain — entry zone shifts. Popular weekend hangout.',
    waterType: 'river',
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
      'Two-tier waterfall with a deep plunge pool at the base. Advanced jumpers only — entry window is narrow. Cold year-round.',
    waterType: 'falls',
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
      'Lakeside cliff with a viewpoint at the top. Mid-range height, clean water, broad landing area. Great first-trip spot.',
    waterType: 'lake',
  },
];

export const getSpotById = (id: string): Spot | undefined =>
  SPOTS.find((s) => s.id === id);
