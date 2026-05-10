import type { Difficulty, LogEntry, SavedSpot, Spot, SpotCategory, WaterType } from './types';

export type SpotRow = {
  id: string;
  user_id: string | null;
  name: string;
  area: string;
  lat: number;
  lng: number;
  height_m: number;
  depth_m: number;
  rating: number;
  review_count: number;
  difficulty: Difficulty;
  category: SpotCategory;
  photos: string[];
  description: string;
  water_type: WaterType;
  notes: string | null;
  created_at: string;
};

export type SavedSpotRow = {
  user_id: string;
  spot_id: string;
  saved_at: string;
};

export type LogEntryRow = {
  id: string;
  user_id: string;
  spot_id: string;
  date: string;
  height_jumped_m: number;
  water_temp_c: number;
  rating: number;
  notes: string | null;
  tricks: string[];
  photos: string[];
  created_at: string;
};

export const spotFromRow = (r: SpotRow): Spot => ({
  id: r.id,
  name: r.name,
  area: r.area,
  lat: r.lat,
  lng: r.lng,
  height_m: r.height_m,
  depth_m: r.depth_m,
  rating: r.rating,
  reviewCount: r.review_count,
  difficulty: r.difficulty,
  category: r.category,
  photos: r.photos,
  description: r.description,
  waterType: r.water_type,
  ...(r.notes ? { notes: r.notes } : {}),
});

export const spotInsertRow = (
  s: Omit<Spot, 'rating' | 'reviewCount'>,
  userId: string,
): Omit<SpotRow, 'created_at'> => ({
  id: s.id,
  user_id: userId,
  name: s.name,
  area: s.area,
  lat: s.lat,
  lng: s.lng,
  height_m: s.height_m,
  depth_m: s.depth_m,
  rating: 0,
  review_count: 0,
  difficulty: s.difficulty,
  category: s.category,
  photos: s.photos,
  description: s.description,
  water_type: s.waterType,
  notes: s.notes ?? null,
});

export const savedSpotFromRow = (r: SavedSpotRow): SavedSpot => ({
  spotId: r.spot_id,
  savedAt: r.saved_at,
});

export const logEntryFromRow = (r: LogEntryRow): LogEntry => ({
  id: r.id,
  spotId: r.spot_id,
  date: r.date,
  heightJumped_m: r.height_jumped_m,
  waterTemp_c: r.water_temp_c,
  rating: r.rating,
  ...(r.notes ? { notes: r.notes } : {}),
  ...(r.tricks ? { tricks: r.tricks } : {}),
  ...(r.photos?.length ? { photos: r.photos } : {}),
});

export const logEntryInsertRow = (
  e: Omit<LogEntry, 'id'>,
  userId: string,
): Omit<LogEntryRow, 'id' | 'created_at'> => ({
  user_id: userId,
  spot_id: e.spotId,
  date: e.date,
  height_jumped_m: e.heightJumped_m,
  water_temp_c: e.waterTemp_c,
  rating: e.rating,
  notes: e.notes ?? null,
  tricks: e.tricks ?? [],
  photos: e.photos ?? [],
});
