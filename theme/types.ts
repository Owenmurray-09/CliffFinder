import type {
  ACCENTS,
  AccentKey,
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

export type AccentHex = (typeof ACCENTS)[AccentKey];

export type ColorPalette = typeof lightColors | typeof darkColors;

export type Palette = ColorPalette & {
  accent: AccentHex;
  pin: typeof PIN;
  star: typeof STAR;
  danger: typeof DANGER;
  on: typeof ON;
  /** Text color for the dark `ink` surface — paper, varies by mode. */
  onInk: ColorPalette['paper'];
};

export type Theme = {
  dark: boolean;
  accent: AccentHex;
  accentKey: AccentKey;
  palette: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
  glass: typeof glass;
  setDark: (dark: boolean) => void;
  setAccent: (accent: AccentKey) => void;
  toggleDark: () => void;
};

export type { AccentKey };
export { ACCENTS };
