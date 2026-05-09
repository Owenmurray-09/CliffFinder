import { create } from 'zustand';
import type { AccentKey } from './tokens';

type ThemeStore = {
  dark: boolean;
  accent: AccentKey;
  setDark: (dark: boolean) => void;
  setAccent: (accent: AccentKey) => void;
  toggleDark: () => void;
};

export const useThemeStore = create<ThemeStore>((set) => ({
  dark: false,
  accent: 'blue',
  setDark: (dark) => set({ dark }),
  setAccent: (accent) => set({ accent }),
  toggleDark: () => set((state) => ({ dark: !state.dark })),
}));
