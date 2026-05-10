export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type SpotCategory = 'trending' | 'saved' | 'friends';
export type WaterType = 'lake' | 'ocean' | 'river' | 'quarry' | 'falls';

export type Spot = {
  id: string;
  name: string;
  area: string; // "Squamish, BC"
  lat: number;
  lng: number;
  height_m: number;
  depth_m: number;
  rating: number; // 0-5
  reviewCount: number;
  difficulty: Difficulty;
  category: SpotCategory; // semantic, drives pin color
  photos: string[]; // URLs
  description: string;
  waterType: WaterType;
  /** Short tip / safety note shown in the "Notes" section of Spot Details. */
  notes?: string;
  /** Distance from "me" rendered next to the area on Spot Details + Map.
   * Hardcoded per design (Map.html SPOTS array) until real geolocation lands. */
  distLabel?: string;
};

export type User = {
  id: string;
  name: string;
  handle: string; // "@alexjumps"
  email: string;
  avatarUri?: string;
  bio?: string;
  joinedDate: string; // ISO
  jumpsCount: number;
  spotsAddedCount: number;
  followersCount: number;
};

export type Friend = {
  id: string;
  name: string;
  handle: string;
  avatarUri?: string;
};

export type LogEntry = {
  id: string;
  spotId: string;
  date: string; // ISO date
  heightJumped_m: number;
  waterTemp_c: number;
  rating: number; // 0-5
  notes?: string;
};

export type RadarItem =
  | { kind: 'jump'; id: string; friendId: string; spotId: string; rating: number; when: string }
  | { kind: 'spot_added'; id: string; friendId: string; spotId: string; when: string }
  | { kind: 'follow'; id: string; friendId: string; when: string };
