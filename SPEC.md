# CliffFinder Implementation Spec

Living document. Each feature loop appends a section. Check off acceptance criteria as completed.

Source design: `design_handoff_clifffinder/`
Visual references: `CliffFinder Components.html` (tokens + components), `CliffFinder Map.html` (screens).

---

## Feature: Project scaffold

**Loop status**: complete

**Acceptance criteria**:
- [x] Expo SDK 54 bootstrapped with TypeScript strict
- [x] Expo Router (file-based) wired in (`app/_layout.tsx`, `app/index.tsx`)
- [x] Existing `.git/`, `HANDOFF.md`, `design_handoff_clifffinder/`, and `SPEC.md` preserved
- [x] Core deps installed: `lucide-react-native@^1.14.0`, `@expo-google-fonts/{poppins,inter,montserrat}`, `expo-blur ~15.0.8`, `react-native-gesture-handler ~2.28.0`, `react-native-reanimated ~4.1.1`, `react-native-worklets 0.5.1`, `react-native-svg 15.12.1`, `zustand ^5.0.2`
- [x] **Babel config**: HANDOFF criterion specified the Reanimated babel plugin must be last in `babel.config.js`. With Expo SDK 54 + Reanimated 4 + `react-native-worklets`, the legacy `react-native-reanimated/plugin` is no longer required — `babel-preset-expo` and the Worklets Babel plugin are auto-applied by Metro. **Decision**: ship without a custom `babel.config.js`. Re-add only if a runtime worklet error appears. ⚠ flag for follow-up if Reanimated worklets misbehave on simulator.
- [x] Jest with `jest-expo` preset configured (in `package.json`); `npm test` runs cleanly (`passWithNoTests: true`)
- [x] `npx tsc --noEmit` passes (zero errors)
- [x] `npx expo start --web` boots; `http://localhost:8081` renders the index screen with paper bg + ink title + ink-3 subtitle
- [x] `tsconfig.json` has `"strict": true`, `@/*` path alias to project root
- [x] `.gitignore` from template covers `node_modules/`, `.expo/`, `dist/`, `web-build/`, `expo-env.d.ts`, env files, native folders

**Tests**: none for this loop (scaffold only).

**Out of scope for this loop**: theme tokens, components, screens, mock data, routes beyond the default index.

**Native-only verification deferred to simulator**: none yet — but Reanimated worklets and Gesture Handler will need first-run smoke testing once a sheet/animation lands.

**Review fixes applied**:
- Stripped placeholder hard-coded colors from `app/index.tsx` (per "no colors outside `theme/tokens.ts`" hard rule — colors will return in Loop 2 via the theme module).
- Wrapped `app/_layout.tsx` Stack in `GestureHandlerRootView` (required for gesture-handler on Android; cheaper to add now than debug later).
- Extended Jest `transformIgnorePatterns` to include `react-native-reanimated`, `react-native-worklets`, `react-native-gesture-handler` so future tests that pull these in transpile correctly.
- Reviewer's `baseUrl: "."` suggestion **not applied** — TypeScript 5.9+ resolves `paths` relative to the tsconfig file when no `baseUrl` is set, and `baseUrl` is now deprecated (will stop working in TS 7). The IDE confirmed this with a deprecation diagnostic when `baseUrl` was added.

**Notes carried forward**:
- `app.json` has `experiments.reactCompiler: true` (from create-expo-app template). Not in HANDOFF; could affect re-render parity vs. design HTMLs during Chrome side-by-side. Leave on for now; flag if a component looks "off" in later loops.
- Default `README.md` from create-expo-app references a `reset-project` script that was removed. Cosmetic, not blocking. Replace when a real project README is needed.

---

## Feature: Theme system

**Loop status**: complete (pending review)

**Files**:
- `theme/tokens.ts` — raw token constants (colors, accents, pin, spacing, radius, typography, shadows, glass)
- `theme/types.ts` — `AccentKey`, `Palette`, `Theme`
- `theme/store.ts` — Zustand store `{ dark, accent, setDark, setAccent, toggleDark }`
- `theme/ThemeProvider.tsx` — initializes `dark` from system color scheme on first mount, renders children
- `theme/useTheme.ts` — hook returning resolved `Theme`
- `theme/__tests__/tokens.test.ts` — token sanity
- `theme/__tests__/store.test.ts` — store accent + dark transitions

**Acceptance criteria**:

Token coverage (cross-referenced against HANDOFF + the design HTML; design HTML wins where they conflict):
- [x] Light palette: `paper #F2EAD0`, `paper2 #E8DDBE`, **`sheetBg #FBF8EE`**, **`sheetSoft rgba(30,47,35,0.06)`**, `ink #1E2F23`, `ink2 #3a4a3e`, `ink3 #7a8579`, `line rgba(30,47,35,0.12)`, `line2 rgba(30,47,35,0.06)` — verified byte-exact against `Components.html :root` and `Map.html` body rule
- [x] Dark palette: `paper #0F1A14`, `paper2 #1A2820`, **`sheetBg #1A2820`**, **`sheetSoft rgba(234,226,200,0.08)`**, `ink #EAE2C8`, `ink2 #cfc7af`, `ink3 #9AB096`, `line rgba(234,226,200,0.14)`, `line2 rgba(234,226,200,0.06)` — verified against `Components.html body.dark` rule and `Map.html body.dark` rule
- [x] Dark radial-gradient definition exported (`center 30%/0%`, stops `[paper2, paper]`); consumable by future gradient bg
- [x] `sheetSoft` is an **alpha overlay** (rgba), `sheetBg` is the sheet's solid background — both distinct tokens; `tokens.test.ts` asserts both shape and value
- [x] 4 accent options: `blue #7BA7C8` (default), `orange #E07A2E` (corrected from HANDOFF typo), `green #2E7D32`, `ink #1E2F23` ("monochrome")
- [x] Pin colors (semantic, never accent-driven): `trending #E07A2E` (corrected), `saved #E8B742`, `friends #D17EA8`
- [x] `danger #B0413E`, `star.interactive #E8B742`, `star.readonly #C9A227`
- [x] On-surface text: `on.accent #FFFFFF`, `on.pin #FFFFFF`, `onInk` (mode-resolved → `palette.paper`) — matches design's `.btn-primary{color:#fff}`, `.pin{color:#fff}`, `.seg button.on{color:var(--paper)}`
- [x] Spacing scale `4 · 8 · 12 · 16 · 22 · 28 · 40` exported as named keys (`xs..3xl`)
- [x] Radius `pill 999`, `card 14`, `cardSm 12`, **`tabBar 22`** (Components.html `.tabbar`), `sheet 28` (Map.html `.sheet`)
- [x] Typography for: `display` (Poppins 700 / **28**), `title`, `cardTitle`, `button`, `navLabel`, `body`, `label`, `fieldLabel` (uppercase, letterSpacing 0.6), `statNumber`
- [x] Shadows: `sm`, `md`, `lg`, `sheet` (upward, negative Y offset), `tabBar`, plus `fabShadow(accentHex)` builder with **alpha 0.45** (matches design `.fab` box-shadow)
- [x] Glass tints/intensities: `search` (intensity 24, white@85%), `topbar` (intensity 18, **paper@78% per mode**, matching design's `color-mix(--paper 78%, transparent)`), `tabBar` (intensity 20, paper2@92% per mode)

Provider + hook:
- [x] `ThemeProvider` initializes `dark` from `useColorScheme()` on first mount (guarded by ref)
- [x] `useTheme()` returns `{ palette, accent (resolved hex), accentKey, dark, spacing, radius, typography, shadows, glass, setDark, setAccent, toggleDark }`
- [x] Accent + dark state lives in a single Zustand store (single source of truth)
- [x] Default accent is `blue` (matches design's default `--accent: #7BA7C8`)

Verification:
- [x] `npx tsc --noEmit` passes
- [x] `npm test` passes new theme tests (14 passed: 11 tokens + 4 store; one of these tests covers all 4 transitions)
- [x] Visual side-by-side: web debug screen rendered both light + dark; design Components.html's `:root` and `body.dark` CSS variables read via `getComputedStyle` and matched byte-exact

**Tests**:
- `tokens.test.ts`:
  - light vs dark palettes have the same keys
  - all 4 accents are present and unique
  - pin colors do not match any accent (semantic separation)
  - spacing scale matches `[4, 8, 12, 16, 22, 28, 40]`
  - radius pill is 999, sheet is 28
- `store.test.ts`:
  - default state: `dark === false`, `accent === 'blue'`
  - `setAccent('orange')` updates accent
  - `setDark(true)` updates dark
  - `toggleDark()` flips dark

**Out of scope**: persisting theme choice across app launches (covered by Settings later); font loading (Loop 3 will load Poppins/Inter/Montserrat via expo-font).

**Native-only verification deferred to simulator**: none — colors are deterministic on web.

**Discrepancies found and resolved during visual verification + independent review**:
- HANDOFF distilled section says trending pin / orange accent = `#E07A2C`. Design HTML actual computed value (verified via `getComputedStyle` on `.pin.tr` and `[data-c]` swatch picker) = `#E07A2E`. Tokens corrected to match the design source. The README.md table also has `#E07A2C` for the pin row, so the typo originates upstream.
- HANDOFF distilled section says 4 accents (`blue`, `orange`, `green`, `ink`); design HTML's swatch picker exposes only 3 (`blue`, `orange`, `green`). HANDOFF "Surprising / easily missed" notes the 4th option is the ink color in "monochrome" mode. Kept 4 accents per HANDOFF; the Settings screen will be the surface where all 4 are user-pickable.
- **HANDOFF says `sheet-soft = #EFE5C2 / #21302A` (solid)**. Design's `Map.html` lines 16–17 define `--sheet-soft` as an **alpha overlay**: `rgba(30,47,35,0.06)` (light) / `rgba(234,226,200,0.08)` (dark). Used to tint controls inside sheets (close button bg, stat tile bg). Tokens corrected to alpha overlays per design source.
- **HANDOFF didn't mention `sheet-bg`**. Design's `Map.html` defines `--sheet-bg = #FBF8EE` (light) / `#1A2820` (dark) for the sheet's own background — distinct from `paper`. Added as `sheetBg` token in both palettes.
- **HANDOFF says fabShadow alpha = `${accent}66` (~0.4)**. Design's `.fab` uses `box-shadow: 0 8px 22px rgba(224,122,46,.45)`. Corrected to `0.45`.
- **HANDOFF says topbar tint is generic blur-and-go**. Design uses `background: color-mix(in srgb, var(--paper) 78%, transparent)` — paper-tinted at 78%. `glass.topbar.tint` corrected to `rgba(<paper>, 0.78)` per mode. (See "Implementation notes" below — these rgba values are hand-typed from the paper hexes; if `paper` ever changes, update by hand.)
- **HANDOFF says display fontSize is "28–32"**. Design's type-row example uses 28; the lead size 32 is reserved for a future `displayLg` if a screen needs it. Picked 28 as the canonical display size.
- **HANDOFF didn't list `radius.tabBar`**. Design's `.tabbar` and `.seg` use `border-radius: 22`. Added.
- Coincidentally `PIN.trending === ACCENTS.orange` (`#E07A2E`). The pin is still SEMANTIC (it does not change with user's accent choice). If a user later picks the orange accent + there's a trending pin nearby, they'll render the same color — a known UX quirk, not an impl bug. A regression-pin test (`tokens.test.ts`) flags drift if either changes independently.

**Implementation notes**:
- Dark radial-gradient is exported as a data structure (`darkBgGradient` with `centerX`, `centerY`, `stops`); the debug screen uses the flat `paper` color since Loop 2 doesn't depend on `expo-linear-gradient`. A future loop that adds the gradient surface will consume the exported stops.
- `ThemeProvider` is intentionally minimal — Zustand is the source of truth; the provider seeds `dark` from `useColorScheme()` on the **first non-null** value (web/iOS return `null` on first render before resolving). Subsequent app-level toggles (Settings) drive the store directly.
- `useTheme()` wraps its returned `Theme` object in `useMemo` keyed on `[dark, accentKey, store-setters]` so referential stability is preserved across renders.
- All four accent values are exposed via `ACCENTS` and `ACCENT_KEYS` and tested.
- `glass.topbar.tint` and `glass.tabBar.tint` use **hand-typed rgba values** derived from the paper/paper2 hexes at 0.78 / 0.92 alpha respectively. React Native's StyleSheet doesn't support CSS `color-mix()`, and we don't need a runtime `hexToRgba()` helper for two values. **If `paper` or `paper2` ever change, update these tints by hand** — the regression-key-set test will flag if `paper` changes but won't notice tint drift on its own.
- Typography `fontFamily` strings (`Poppins_700Bold`, etc.) won't resolve until Loop 3 loads them via `expo-font`. On web today, the title falls back to the browser's default font. This is expected and the visual will become correct once Loop 3 lands.
