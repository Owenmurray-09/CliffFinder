import type { TextStyle, ViewStyle } from 'react-native';

// Accent values verified against design HTML's swatch-pick data-c attributes.
// HANDOFF distilled section had `#E07A2C` (typo from README); design source
// uses `#E07A2E` for orange. The 4th option (`ink`) is the HANDOFF's
// "monochrome" mode and is not present in the design's 3-swatch picker.
export const ACCENTS = {
  blue: '#7BA7C8',
  orange: '#E07A2E',
  green: '#2E7D32',
  ink: '#1E2F23',
} as const;

export type AccentKey = keyof typeof ACCENTS;
export const ACCENT_KEYS: AccentKey[] = ['blue', 'orange', 'green', 'ink'];

// `sheetSoft` and `sheetBg` are sourced from Map.html (lines 16–17 in the
// design HTML), where they're defined as scoped overrides on `body` /
// `body.dark`. `sheetSoft` is an alpha overlay used for tinted controls
// inside sheets (close button bg, stat tile bg). `sheetBg` is the sheet's
// own background — distinct from `paper` (sheet bg is creamier in light;
// equals paper2 in dark).
export const lightColors = {
  paper: '#F2EAD0',
  paper2: '#E8DDBE',
  sheetBg: '#FBF8EE',
  sheetSoft: 'rgba(30,47,35,0.06)',
  ink: '#1E2F23',
  ink2: '#3a4a3e',
  ink3: '#7a8579',
  line: 'rgba(30,47,35,0.12)',
  line2: 'rgba(30,47,35,0.06)',
} as const;

export const darkColors = {
  paper: '#0F1A14',
  paper2: '#1A2820',
  sheetBg: '#1A2820',
  sheetSoft: 'rgba(234,226,200,0.08)',
  ink: '#EAE2C8',
  ink2: '#cfc7af',
  ink3: '#9AB096',
  line: 'rgba(234,226,200,0.14)',
  line2: 'rgba(234,226,200,0.06)',
} as const;

// Dark mode background uses a radial gradient centered at 30%/0%, not flat.
// Components rendering the dark bg should consume these stops.
export const darkBgGradient = {
  centerX: 0.3,
  centerY: 0,
  // Outer → inner. Subtle: paper2 fading to paper.
  stops: [darkColors.paper2, darkColors.paper] as [string, string],
} as const;

// Pin colors are SEMANTIC — they do not change with the user's accent.
// Verified against design HTML's `.pin.tr/.sv/.fr` computed backgroundColor.
export const PIN = {
  trending: '#E07A2E',
  saved: '#E8B742',
  friends: '#D17EA8',
} as const;

export const STAR = {
  interactive: '#E8B742',
  readonly: '#C9A227',
} as const;

export const DANGER = '#B0413E';

// Text colors for high-saturation surfaces. The design hard-codes white
// on accent (`.btn-primary{color:#fff}`), pin (`.pin{color:#fff}`), and
// chip-on (`.chip-pill.on{color:#fff}`). `onInk` is paper, used for text
// on the dark `var(--ink)` surface (`.seg button.on{color:var(--paper)}`).
export const ON = {
  accent: '#FFFFFF',
  pin: '#FFFFFF',
  // onInk varies between light + dark — derive from palette at consume time.
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  '2xl': 28,
  '3xl': 40,
} as const;

export const radius = {
  pill: 999,
  card: 14,
  cardSm: 12,
  // Tab bar / segmented control / sheet-mock visual radius (Components.html:123).
  tabBar: 22,
  // Sheet top corners (Map.html:54).
  sheet: 28,
} as const;

// Display fontSize set to 28 to match Components.html's type-row example.
// HANDOFF range was "28–32"; the lead size 32 is reserved for a future
// `displayLg` token if a screen needs it.
export const typography = {
  display: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    fontWeight: '700',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    fontWeight: '700',
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
  },
  button: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14.5,
    fontWeight: '400',
  },
  navLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    fontWeight: '600',
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    fontWeight: '500',
  },
  fieldLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statNumber: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 22,
    fontWeight: '700',
  },
} as const satisfies Record<string, TextStyle>;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  // Sheet shadow projects upward (negative Y offset).
  sheet: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: -10 },
    elevation: 12,
  },
  tabBar: {
    shadowColor: 'rgba(30,47,35,0.18)',
    shadowOpacity: 1,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const satisfies Record<string, ViewStyle>;

// FAB shadow alpha 0.45 (Components.html:120 → `rgba(224,122,46,.45)`).
// HANDOFF said `${accent}66` ≈ 0.4 — design HTML wins.
export function fabShadow(accentHex: string): ViewStyle {
  return {
    shadowColor: accentHex,
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  };
}

// Glass surfaces (expo-blur).
// - search/filter bar (Components.html:92 `.glass{...background:rgba(255,255,255,.85)...}`)
// - topbar (Components.html:36 `color-mix(in srgb, var(--paper) 78%, transparent)`)
//   color-mix isn't available in React Native; resolve to a paper-tinted rgba
//   per mode at consume time.
// - tab bar — design uses opaque `var(--paper-2)` underneath; intensity 20.
// `saturate` is a CSS-only filter unavailable through expo-blur and is documented
// as an aspirational nicety; we approximate via tint alpha on native.
export const glass = {
  search: {
    intensity: 24,
    tint: {
      light: 'rgba(255,255,255,0.85)',
      dark: 'rgba(30,47,35,0.62)',
    },
  },
  topbar: {
    intensity: 18,
    // Paper-tinted at 78% per design HTML's color-mix.
    tint: {
      light: 'rgba(242,234,208,0.78)',
      dark: 'rgba(15,26,20,0.78)',
    },
  },
  tabBar: {
    intensity: 20,
    tint: {
      light: 'rgba(232,221,190,0.92)',
      dark: 'rgba(26,40,32,0.92)',
    },
  },
} as const;
