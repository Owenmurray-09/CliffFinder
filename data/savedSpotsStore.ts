import { create } from 'zustand';
import { useAuthStore } from '@/auth/store';
import { supabase } from '@/lib/supabase';
import { savedSpotFromRow, type SavedSpotRow } from './rowMappers';
import type { SavedSpot } from './types';

type SavedSpotsState = {
  saved: SavedSpot[];
  loading: boolean;
  error: string | null;
  loadSavedSpots: () => Promise<void>;
  isSaved: (spotId: string) => boolean;
  toggleSaved: (spotId: string) => Promise<void>;
  clear: () => void;
};

export const useSavedSpotsStore = create<SavedSpotsState>((set, get) => ({
  saved: [],
  loading: false,
  error: null,

  loadSavedSpots: async () => {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) return;
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('saved_spots')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ saved: (data as SavedSpotRow[]).map(savedSpotFromRow), loading: false });
  },

  isSaved: (spotId) => get().saved.some((s) => s.spotId === spotId),

  toggleSaved: async (spotId) => {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) {
      set({ error: 'Not signed in' });
      return;
    }
    const wasSaved = get().isSaved(spotId);

    // Optimistic update so the heart flips instantly.
    if (wasSaved) {
      set((state) => ({ saved: state.saved.filter((s) => s.spotId !== spotId) }));
    } else {
      const optimistic: SavedSpot = { spotId, savedAt: new Date().toISOString() };
      set((state) => ({ saved: [optimistic, ...state.saved] }));
    }

    const { error } = wasSaved
      ? await supabase.from('saved_spots').delete().eq('user_id', userId).eq('spot_id', spotId)
      : await supabase.from('saved_spots').insert({ user_id: userId, spot_id: spotId });

    if (error) {
      // Roll the optimistic change back if the server rejected us.
      if (wasSaved) {
        const restored: SavedSpot = { spotId, savedAt: new Date().toISOString() };
        set((state) => ({ saved: [restored, ...state.saved], error: error.message }));
      } else {
        set((state) => ({
          saved: state.saved.filter((s) => s.spotId !== spotId),
          error: error.message,
        }));
      }
    }
  },

  clear: () => set({ saved: [], error: null }),
}));
