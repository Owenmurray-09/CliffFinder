import { create } from 'zustand';
import { useAuthStore } from '@/auth/store';
import { supabase } from '@/lib/supabase';
import { spotFromRow, spotInsertRow, type SpotRow } from './rowMappers';
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
  loading: boolean;
  error: string | null;
  loadSpots: () => Promise<void>;
  addSpot: (input: NewSpotInput) => Promise<Spot | null>;
  getById: (id: string) => Spot | undefined;
  clear: () => void;
};

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'spot';

let nextSerial = 1;

export const useSpotsStore = create<SpotsState>((set, get) => ({
  spots: [],
  loading: false,
  error: null,

  loadSpots: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ spots: (data as SpotRow[]).map(spotFromRow), loading: false });
  },

  addSpot: async (input) => {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) {
      set({ error: 'Not signed in' });
      return null;
    }

    const explicitId = input.id?.trim();
    const baseId = explicitId || slugify(input.name);
    const existingIds = new Set(get().spots.map((s) => s.id));
    let id = baseId;
    while (existingIds.has(id)) {
      id = `${baseId}-${nextSerial++}`;
    }

    const draft: Omit<Spot, 'rating' | 'reviewCount'> = {
      ...input,
      id,
      category: input.category ?? 'friends',
    };

    const { data, error } = await supabase
      .from('spots')
      .insert(spotInsertRow(draft, userId))
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      return null;
    }
    const created = spotFromRow(data as SpotRow);
    set((state) => ({ spots: [created, ...state.spots], error: null }));
    return created;
  },

  getById: (id) => get().spots.find((s) => s.id === id),

  clear: () => set({ spots: [], error: null }),
}));

/** Non-React helper for code paths that don't have hook access (e.g. map projection). */
export const getSpotById = (id: string): Spot | undefined =>
  useSpotsStore.getState().getById(id);
