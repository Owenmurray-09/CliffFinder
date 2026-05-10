import { create } from 'zustand';
import { SPOTS as SEED } from './spots';
import type { Spot } from './types';

export type NewSpotInput = Omit<
  Spot,
  'id' | 'rating' | 'reviewCount' | 'category' | 'distLabel'
> & {
  id?: string;
  category?: Spot['category'];
};

type SpotsState = {
  spots: Spot[];
  getById: (id: string) => Spot | undefined;
  addSpot: (input: NewSpotInput) => Spot;
  reset: () => void;
};

let nextSerial = 1;
const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'spot';

export const useSpotsStore = create<SpotsState>((set, get) => ({
  spots: [...SEED],
  getById: (id) => get().spots.find((s) => s.id === id),
  addSpot: (input) => {
    const explicitId = input.id?.trim();
    const baseId = explicitId || slugify(input.name);
    const existingIds = new Set(get().spots.map((s) => s.id));
    let id = baseId;
    while (existingIds.has(id)) {
      id = `${baseId}-${nextSerial++}`;
    }
    const created: Spot = {
      ...input,
      id,
      rating: 0,
      reviewCount: 0,
      category: input.category ?? 'friends',
    };
    set((state) => ({ spots: [created, ...state.spots] }));
    return created;
  },
  reset: () => set({ spots: [...SEED] }),
}));

/** Non-React helper for code paths that don't have hook access. */
export const getSpotById = (id: string): Spot | undefined =>
  useSpotsStore.getState().getById(id);
