import { useMemo } from 'react';
import { useThemeStore } from './store';
import {
  ACCENTS,
  DANGER,
  ON,
  PIN,
  STAR,
  darkColors,
  glass,
  lightColors,
  radius,
  shadows,
  spacing,
  typography,
} from './tokens';
import type { Theme } from './types';

export function useTheme(): Theme {
  const dark = useThemeStore((s) => s.dark);
  const accentKey = useThemeStore((s) => s.accent);
  const setDark = useThemeStore((s) => s.setDark);
  const setAccent = useThemeStore((s) => s.setAccent);
  const toggleDark = useThemeStore((s) => s.toggleDark);

  return useMemo<Theme>(() => {
    const accent = ACCENTS[accentKey];
    const colors = dark ? darkColors : lightColors;
    return {
      dark,
      accent,
      accentKey,
      palette: {
        ...colors,
        accent,
        pin: PIN,
        star: STAR,
        danger: DANGER,
        on: ON,
        // text color for use on the dark `ink` surface — varies by mode
        onInk: colors.paper,
      },
      spacing,
      radius,
      typography,
      shadows,
      glass,
      setDark,
      setAccent,
      toggleDark,
    };
  }, [dark, accentKey, setDark, setAccent, toggleDark]);
}
