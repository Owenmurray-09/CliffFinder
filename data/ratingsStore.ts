import { create } from 'zustand';
import { useAuthStore } from '@/auth/store';
import { supabase } from '@/lib/supabase';

export type SpotAggregate = { avg: number; count: number };

type RatingsState = {
  /** This user's rating per spot (1–5), if they've rated it. */
  userRatings: Record<string, number>;
  /** Aggregated avg + count per spot, populated on demand. */
  aggregates: Record<string, SpotAggregate>;
  loading: Record<string, boolean>;
  error: string | null;
  loadForSpot: (spotId: string) => Promise<void>;
  setRating: (spotId: string, value: number) => Promise<string | null>;
  clearRating: (spotId: string) => Promise<string | null>;
  clear: () => void;
};

export const useRatingsStore = create<RatingsState>((set, get) => ({
  userRatings: {},
  aggregates: {},
  loading: {},
  error: null,

  loadForSpot: async (spotId) => {
    const userId = useAuthStore.getState().session?.user.id;
    set((s) => ({ loading: { ...s.loading, [spotId]: true } }));

    // Aggregate (avg + count) for the spot.
    const aggPromise = supabase
      .from('spot_rating_aggregates')
      .select('avg_rating, review_count')
      .eq('spot_id', spotId)
      .maybeSingle();

    // The current user's own rating, if any.
    const minePromise = userId
      ? supabase
          .from('spot_ratings')
          .select('value')
          .eq('user_id', userId)
          .eq('spot_id', spotId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null });

    const [aggRes, mineRes] = await Promise.all([aggPromise, minePromise]);

    set((s) => {
      const next: Partial<RatingsState> = {
        loading: { ...s.loading, [spotId]: false },
      };
      if (!aggRes.error) {
        const row = aggRes.data as { avg_rating: number; review_count: number } | null;
        next.aggregates = {
          ...s.aggregates,
          [spotId]: row
            ? { avg: Number(row.avg_rating), count: row.review_count }
            : { avg: 0, count: 0 },
        };
      }
      if (!mineRes.error) {
        const row = mineRes.data as { value: number } | null;
        const ur = { ...s.userRatings };
        if (row) ur[spotId] = row.value;
        else delete ur[spotId];
        next.userRatings = ur;
      }
      return next;
    });
  },

  setRating: async (spotId, value) => {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) return 'Not signed in';
    if (value < 1 || value > 5) return 'Rating must be 1–5';
    const prev = get().userRatings[spotId];

    // Optimistic: set locally + bump aggregate (approximate; reloaded after).
    set((s) => ({
      userRatings: { ...s.userRatings, [spotId]: value },
    }));

    const { error } = await supabase
      .from('spot_ratings')
      .upsert(
        { user_id: userId, spot_id: spotId, value },
        { onConflict: 'user_id,spot_id' },
      );
    if (error) {
      // Roll back optimistic local change.
      set((s) => {
        const ur = { ...s.userRatings };
        if (prev === undefined) delete ur[spotId];
        else ur[spotId] = prev;
        return { userRatings: ur, error: error.message };
      });
      return error.message;
    }
    // Re-pull the aggregate so avg + count match the server.
    await get().loadForSpot(spotId);
    return null;
  },

  clearRating: async (spotId) => {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) return 'Not signed in';
    const prev = get().userRatings[spotId];
    if (prev === undefined) return null;

    set((s) => {
      const ur = { ...s.userRatings };
      delete ur[spotId];
      return { userRatings: ur };
    });

    const { error } = await supabase
      .from('spot_ratings')
      .delete()
      .eq('user_id', userId)
      .eq('spot_id', spotId);
    if (error) {
      set((s) => ({ userRatings: { ...s.userRatings, [spotId]: prev }, error: error.message }));
      return error.message;
    }
    await get().loadForSpot(spotId);
    return null;
  },

  clear: () => set({ userRatings: {}, aggregates: {}, loading: {}, error: null }),
}));
