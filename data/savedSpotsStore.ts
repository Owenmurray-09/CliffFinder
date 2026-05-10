import { create } from 'zustand';
import type { SavedSpot } from './types';
import { SAVED_SPOTS as SEED } from './logEntries';

type SavedSpotsState = {
  saved: SavedSpot[];
  isSaved: (spotId: string) => boolean;
  toggleSaved: (spotId: string) => void;
  reset: () => void;
};

const today = (): string => new Date().toISOString().slice(0, 10);

export const useSavedSpotsStore = create<SavedSpotsState>((set, get) => ({
  saved: [...SEED],
  isSaved: (spotId) => get().saved.some((s) => s.spotId === spotId),
  toggleSaved: (spotId) =>
    set((state) => {
      const exists = state.saved.some((s) => s.spotId === spotId);
      return {
        saved: exists
          ? state.saved.filter((s) => s.spotId !== spotId)
          : [{ spotId, savedAt: today() }, ...state.saved],
      };
    }),
  reset: () => set({ saved: [...SEED] }),
}));
