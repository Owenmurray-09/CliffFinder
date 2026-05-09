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

---

## Feature: Font loading + Button component

**Loop status**: complete

**Files**:
- `app/_layout.tsx` — load Poppins (400/600/700), Inter (400/500), Montserrat (700) via `@expo-google-fonts/*`; render nothing until fonts load (or show splash)
- `components/Button.tsx` — `<Button>` with variants `primary` / `ghost` / `outline` / `link`, plus `busy` and `disabled` states
- `components/__tests__/Button.test.tsx` — variant + state behavior
- `app/index.tsx` — extend the debug screen with a Button gallery (one of each variant + a busy demo)

**Design source** (`CliffFinder Components.html` lines 111–117):
- Base `.btn-demo`: padding `13/18`, radius `14`, font `Poppins 14.5 / 400`, gap `8`, border none, `transition: transform .12s ease`
- `primary`: bg `var(--accent)`, color `#fff`, weight `400`
- `ghost`: bg `rgba(30,47,35,.06)` light / `rgba(234,226,200,.08)` dark (same as `sheetSoft`!), color `ink`
- `outline`: bg transparent, color `ink`, border `1.5px solid var(--line)`
- `link`: bg transparent, color `var(--accent)`, weight `600`, padding `6/8` (smaller)

**Acceptance criteria**:

Font loading:
- [x] `useFonts` loads `Poppins_400Regular`, `Poppins_600SemiBold`, `Poppins_700Bold`, `Inter_400Regular`, `Inter_500Medium`, `Montserrat_700Bold`
- [x] **`expo-splash-screen` integration**: `preventAutoHideAsync()` at module scope, `hideAsync()` on `loaded || error` so the OS splash holds until JS-side fonts resolve (no flash of blank screen on native)
- [x] Font-load errors don't hang the app — proceed with system fallbacks if `error` is non-null
- [x] On the local + deployed web build, the title and button labels render Poppins — verified via Chrome DevTools (`fontFamily` resolves to Poppins glyphs)

Button component:
- [x] `<Button label="..." variant="primary" />` renders accent fill + white label using `palette.on.accent`
- [x] `variant="ghost"` consumes `palette.sheetSoft` (the alpha overlay) for the bg — token reuse, no new color
- [x] `variant="outline"` renders 1.5px `palette.line` border, transparent bg, ink label
- [x] `variant="link"` renders no bg, accent label, smaller padding (6/8), weight 600 — also has `borderRadius: 14` so a future hover/pressed bg would round correctly
- [x] `busy={true}`: press is gated via `Pressable.disabled`; activity indicator replaces label + icon; variant chrome remains
- [x] `disabled={true}`: press is gated; opacity drops to 0.5
- [x] `busy && disabled` both gate the press; accessibilityState reflects both flags
- [x] Optional `icon` prop renders before label with `gap: t.spacing.sm` (8); icon hides under busy
- [x] Typography routed through `t.typography.button` (Poppins 400 / 14.5); `link` overrides weight to 600
- [x] No hard-coded colors in `components/Button.tsx` — every value flows from the theme (`'transparent'` is a CSS keyword, matches design's literal `background:transparent`)

Verification:
- [x] `npx tsc --noEmit` clean
- [x] `npm test` passes — **48 tests** across 3 suites (theme tokens 21 + theme store 4 + Button 23)
- [x] Design HTML's `.btn-primary/.ghost/.outline/.link` computed styles read via `getComputedStyle()` and matched byte-exact against impl
- [x] Light + dark both verified visually via Chrome DevTools side-by-side against `Components.html` Buttons panel
- [ ] Re-deploy to Vercel after commit (next step)

**Tests**:
- `Button.test.tsx`:
  - press fires `onPress` for normal state
  - press is no-op when `busy`
  - press is no-op when `disabled`
  - busy state mounts an activity indicator and unmounts the label
  - disabled root has opacity 0.5
  - each variant resolves to the expected `backgroundColor` / `color` / `borderWidth` (introspect via `findAllByType(View/Text)` and read style)

**Out of scope**: press/scale animation (`transform: scale`) — that's a Loop 3.5 polish item if it's not free with `Pressable`'s `pressed` prop; skip if non-trivial. Haptics on press — flagged for native only, deferred.

**Native-only verification deferred to simulator**: button press feedback (scale animation, haptic) once added.

---

## Feature: Field component

**Loop status**: in progress

**Files**:
- `components/Field.tsx` — `<Field>` with `label`, `value`, `onChangeText`, optional `error`, `placeholder`, plus `secureTextEntry` / `keyboardType` / `autoCapitalize` / `autoComplete` / `autoCorrect` passthrough
- `components/__tests__/Field.test.tsx` — state + a11y tests
- `app/index.tsx` — debug surface adds a Field gallery

**Design source** (`Components.html` lines 223–228):
- `.field`: padding `12/16`, bg `var(--paper-2)`, border `1px solid var(--line)`, radius `14`, width 100%
- `.field .lbl`: Inter 500 / 11px / uppercase / letter-spacing `.05em`, color `var(--ink-3)` — matches `typography.fieldLabel`
- `.field input`: bg transparent, color `var(--ink)`, Inter 14.5, margin-top `4`
- `.field.focus`: border-color `var(--accent)`
- `.field.error`: border-color `#B0413E`
- `.err-line` (rendered below): Inter / 12px, color `#B0413E`, ⚠ prefix, gap `6`, margin-top `6`

**Acceptance criteria**:
- [ ] Default state: bg `palette.paper2`, 1px `palette.line` border, radius 14
- [ ] Focus state: border flips to `palette.accent` while focused
- [ ] Error state: border flips to `palette.danger`; ⚠ helper line renders below at Inter 12 / danger color
- [ ] Error wins over focus visually (red beats accent when both true)
- [ ] Label uses `typography.fieldLabel` — uppercase, letter-spacing 0.6, ink3 color
- [ ] Input uses Inter 14.5, color `palette.ink`
- [ ] `onChangeText` fires correctly
- [ ] `secureTextEntry`, `keyboardType`, `autoCapitalize`, `autoComplete`, `autoCorrect` pass through to TextInput
- [x] Accessibility: input has `accessibilityLabel = label`; if error, `accessibilityHint = error` (RN does not support `accessibilityState.invalid` — switched to `accessibilityHint` per RN convention so screen readers announce label + error in sequence)
- [ ] No hard-coded colors in `components/Field.tsx`

Verification:
- [ ] `npx tsc --noEmit` clean
- [ ] `npm test` adds Field tests; total ≥ 60
- [ ] Visual side-by-side vs `Components.html` "Inputs" panel — default / focus / error all match
- [ ] Re-deploy to Vercel; spot-check on the live URL

**Tests**:
- default render: paper2 bg, line border, label text rendered
- typing fires onChangeText with the new value
- onFocus → border switches to accent
- onBlur → border returns to line
- error prop renders the error message text + danger border
- error overrides focus (red beats accent when both)
- secureTextEntry passes through (`props.secureTextEntry === true`)

**Out of scope**: password show/hide toggle — call site (sign-in) will wire its own; right-side icons; multiline/textarea variant (Loop 6 Log Entry can add).

**Native-only verification deferred to simulator**: keyboard show/hide affordances, autoFocus behavior, secure entry on iOS/Android.

---

## Feature: Chip pill component

**Loop status**: complete

**Files**:
- `components/Chip.tsx` — `<Chip>` with `label`, `selected`, `onPress`
- `components/__tests__/Chip.test.tsx` — default + selected + press
- `theme/tokens.ts` — adds `typography.chip` (Inter 500 / 12.5)
- `app/index.tsx` — debug surface adds a filter-chip row

**Design source** (`Components.html` lines 101–103):
- `.chip-pill` (light): bg `rgba(255,255,255,.85)`, border `1px solid var(--line)`, color ink
- `body.dark .chip-pill`: bg `rgba(30,47,35,.62)`, border `1px solid rgba(234,226,200,.12)`, color ink (dark mode ink)
- `.chip-pill.on` (any mode): bg `var(--accent)`, color `#fff`, border-color `transparent`
- padding: 7/12, radius: 999, typography: Inter 500 / 12.5, gap: 6 (icon ↔ label)

**Acceptance criteria**:
- [ ] Default: bg matches the search-glass tint per mode (`glass.search.tint`), 1px line border, ink label
- [ ] Selected (`selected={true}`): bg = `palette.accent`, label = `palette.on.accent` (`#FFFFFF`), border `transparent`
- [ ] Press fires `onPress`
- [ ] Padding `7/12`, radius `pill` (999)
- [ ] Typography from new `typography.chip` token (Inter 500 / 12.5)
- [ ] Optional `icon` slot before label with `gap: 6`
- [ ] No hard-coded colors in `components/Chip.tsx`
- [ ] Tests pass (≥ 8 chip tests)
- [ ] Visual side-by-side vs `Components.html` "Filter chip" panel

**Tests**:
- default state: glass tint bg, line border, ink label
- selected state: accent bg, on.accent label, transparent border
- press fires onPress
- selected accent flips when accent changes (orange/green/ink)
- dark mode: bg switches to dark glass tint
- icon renders before label
- typography uses `typography.chip` (12.5)
- accessibilityRole="button", accessibilityState.selected reflects prop

**Out of scope**: chip group / multi-select state mgmt — chip is a controlled toggle; group state lives at call site (Map filter row, Filters sheet). `disabled` state on chips not implemented (YAGNI for v1; flag for backlog if Filters needs it).

**Native-only verification deferred**: none; chip is pure styling + press.

**Discrepancy resolved during review**: HANDOFF + spec implied chip border = `palette.line`, but the design HTML's `body.dark .chip-pill` rule explicitly overrides to `rgba(234,226,200,0.12)` (NOT the `--line` 0.14 alpha). Added `chipBorder` to both palettes — light `rgba(30,47,35,0.12)` (coincides with light `line`), dark `rgba(234,226,200,0.12)` (deliberately distinct from dark `line` 0.14). Token test pins this divergence so it can't drift silently.

**Layout fix from review**: added `flexShrink: 0` to chip root style so chips don't squeeze inside horizontal-scroll filter rows (Map screen will use this).

---

## Feature: Toggle component

**Loop status**: complete

**Files**:
- `components/Toggle.tsx` — `<Toggle>` with `value`, `onValueChange`
- `components/__tests__/Toggle.test.tsx`
- `app/index.tsx` — adds toggle gallery

**Design source** (`Components.html` lines 153–157):
- `.toggle`: 44×26, radius 999, accent bg when on, line bg when off
- `.toggle:after` (thumb): 20×20, radius 999, top 3 / left 3, white bg, shadow `0 2px 4px rgba(0,0,0,.2)`, `transition: transform .15s`
- `.toggle.on:after`: `translateX(18px)`

**Acceptance criteria**:
- [ ] Track: 44×26, radius 999, bg = `palette.accent` when value=true / `palette.line` when value=false
- [ ] Thumb: 20×20, radius 999, white bg, shadow (0 2px 4px black 0.2), positioned absolutely top:3 left:3
- [ ] Animated thumb: translateX 0 → 18 over 150ms when value flips
- [ ] Press fires `onValueChange(!value)` with the new boolean
- [ ] Accessibility: `accessibilityRole="switch"`, `accessibilityState.checked` reflects value
- [ ] Disabled: `disabled` prop gates onValueChange and drops opacity to 0.5
- [ ] No hard-coded colors in `components/Toggle.tsx` (white thumb is allowed; design hard-codes `#fff` for the thumb)
- [ ] Visual side-by-side vs `Components.html` Toggle panel

**Tests**:
- value=false: track bg = line, thumb at translateX 0
- value=true: track bg = accent, thumb at translateX 18
- press fires onValueChange with the inverted value
- track bg respects accent change
- disabled gates the press + reduces opacity

**Out of scope**: spring animation tuning (use simple `Animated.timing` for now); haptic on toggle (native-only deferred).

**Native-only verification deferred**: thumb animation timing on simulator (web `Animated` performs differently).

---

## Feature: Slider component

**Loop status**: complete

**Files**:
- `components/Slider.tsx` — `<Slider>` with `value`, `onValueChange`, `min`, `max`, `step`
- `components/__tests__/Slider.test.tsx` — math + render + drag behavior

**Design source** (`Components.html` lines 148–151):
- `.slider-track`: height 6, width 100%, radius 999, bg `var(--line)`
- `.slider-fill`: absolute left:0, full height, radius 999, bg `var(--accent)`, width derived from value
- `.slider-thumb`: 20×20, white bg, 2px accent border, radius 999, shadow `0 2px 8px rgba(0,0,0,.18)`, `transform: translate(-50%,-50%)` so it centers on the value position

**Acceptance criteria**:
- [ ] Track 6px tall, line bg, pill radius
- [ ] Fill width = `(value - min) / (max - min)` × track width; bg = accent
- [ ] Thumb 20×20 white, 2px accent border, shadow per design; centered on the value position
- [ ] Drag (PanResponder) updates value; tap on track jumps to position
- [ ] `step` prop snaps to whole units (default 1)
- [ ] `min`/`max` clamp the value
- [ ] No hard-coded colors except `'#FFFFFF'` thumb (design uses `#fff`)
- [ ] Hit area extends vertically beyond the 6px track (12px each side via wrapper padding) so it's tappable
- [ ] Pure math helpers tested independently: `clamp`, `roundToStep`, `positionToValue`, `valueToRatio`

**Tests**:
- math: clamp below min / above max / inside range
- math: roundToStep: 5.4 step 1 → 5; 5.4 step 0.5 → 5.5; 5.4 step 5 → 5
- math: valueToRatio: at min → 0, at max → 1, halfway → 0.5
- math: positionToValue: 0 → min, full width → max, half → midpoint
- render: track has line bg, fill has accent bg, thumb has 2px accent border
- value=50 with min=0/max=100 places thumb at 50% of track width
- onValueChange fires on press with new value
- accent change updates fill + thumb border colors

**Out of scope**: range (dual-thumb) slider — single-thumb only. If Filters sheet needs range, build as a separate `<RangeSlider>` later.

**Native-only verification deferred**: PanResponder gesture smoothness on simulator; on web, dragging works via mouse events.

---

## Feature: Card + GlassPanel components

**Loop status**: complete

**Files**:
- `components/Card.tsx` — solid surface (paper2 bg, 1px line border, radius 16, padding 18, flex col gap 14)
- `components/GlassPanel.tsx` — `expo-blur` BlurView wrapper for floating UI (search bar, filter bar, tab bar)
- `components/__tests__/Card.test.tsx`
- `components/__tests__/GlassPanel.test.tsx`
- `theme/tokens.ts` — adds `palette.glassBorder` (light `rgba(30,47,35,0.08)` / dark `rgba(234,226,200,0.12)`); refactors `radius.card` from 14 → 16 to match design and adds `radius.control = 14` for the now-renamed buttons/fields use

**Design source**:
- `Components.html:63` → `.card{background:var(--paper-2);border:1px solid var(--line);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:14px}`
- `Components.html:92–93` → `.glass{backdrop-filter:blur(18px);background:rgba(255,255,255,.85);border:1px solid rgba(30,47,35,.08);border-radius:14px}` and `body.dark .glass{background:rgba(30,47,35,.62);border-color:rgba(234,226,200,.12)}`
- `Map.html:16–17` confirms `--ui-border` = `rgba(30,47,35,0.08)` light / `rgba(234,226,200,0.12)` dark

**Acceptance criteria**:

Card:
- [ ] bg `palette.paper2`, 1px `palette.line` border, `radius.card` (16), padding 18
- [ ] flex column with gap 14 by default
- [ ] `style` passthrough for overrides
- [ ] No hard-coded colors

GlassPanel:
- [ ] Wraps `expo-blur` `BlurView`
- [ ] `variant?: 'search' | 'topbar' | 'tabBar'` selects intensity (24 / 18 / 20) and tint
- [ ] BlurView `tint` prop set to `'light'` or `'dark'` based on theme dark mode (so it falls back gracefully on platforms without backdrop-filter)
- [ ] Wrapping View provides border `palette.glassBorder` and any radius/padding via passed style
- [ ] `style` passthrough — caller sets borderRadius to 14 (search/glass), 22 (tabBar), etc.
- [ ] children rendered inside the blur surface

Token corrections:
- [ ] `radius.card` changes from 14 → 16 (matches `.card` design)
- [ ] New `radius.control` = 14 (used by Button, Field, GlassPanel default)
- [ ] Button + Field switch from `radius.card` to `radius.control` (visible result unchanged — both still 14)
- [ ] `palette.glassBorder` added to both palettes; key-set + byte-exact tests updated

**Native-only verification deferred to simulator**: BlurView native blur (web uses CSS backdrop-filter, which differs visually). Flag the search bar, filter bar, and tab bar for simulator verification once Map screen lands.

**Out of scope**: animated card lift on press (deferred until Spot Details screen needs it), saturate filter on tab bar (CSS-only, expo-blur doesn't expose).

---

## Feature: Avatar component

**Loop status**: complete

**Files**:
- `components/Avatar.tsx` — `<Avatar name? uri? size? />`; renders an image or gradient + initial fallback
- `components/__tests__/Avatar.test.tsx`
- `app/index.tsx` — adds Avatar gallery

**Design source** (`Components.html:182`):
- `.avatar`: 64×64, radius 999, linear-gradient(160deg, #7d9b6e 0%, #3d5b34 100%) (default green), white text, Poppins 700 / 22, 3px solid `var(--paper)` border
- Smaller variant: 42×42, font 14 (`Components.html:727`)
- Alt gradient sample: #c89868 → #7a5230 (warm)

**Acceptance criteria**:
- [ ] `name` prop: shows the first letter (uppercased) over a deterministic gradient picked from a small palette
- [ ] `uri` prop: shows the image instead (covers); same circular shape + 3px paper border
- [ ] `size` prop: sets width/height (default 64); font size scales (`size * 22 / 64`)
- [ ] `gradient` prop: optional override `[from, to]`
- [ ] 3px solid `palette.paper` border (so the avatar pops from any bg)
- [ ] Hash function deterministic — same `name` → same gradient
- [ ] Linear gradient via `expo-linear-gradient` OR a single solid + tonal stack? **Decision**: use `expo-linear-gradient` (will need to add as a dep).
- [ ] No hard-coded colors — gradient palette + white initial color stay in this file (the white is design-specified `color:#fff`); border pulls from `palette.paper`

**Tests**:
- name="Alex" renders "A" initial
- name="alex" still renders "A" (uppercased)
- empty/missing name → falls back to "?" or no initial
- same name → same gradient (deterministic)
- different names usually pick different gradients (non-trivial palette)
- gradient prop overrides hash pick
- size scales font + dimensions
- uri renders Image instead of initial

**Out of scope**: status dot overlay (notification dot is a separate component flagged in HANDOFF as a future "Indicators" item); fancy fallback handling for image load errors.

**Native-only verification deferred**: `expo-linear-gradient` renders consistently on both web (SVG) and native (CAGradientLayer / Android). Should be fine, but flag.

---

## Feature: StatBox component

**Loop status**: complete

**Files**:
- `components/StatBox.tsx` — `<StatBox value="42m" label="Height" />`
- `components/__tests__/StatBox.test.tsx`
- `theme/tokens.ts` — corrects `typography.statNumber` from 22 → 18 to match design; adds `typography.statLabel` (Inter 400 / 10.5)
- `app/index.tsx` — adds StatBox row

**Design source** (`Components.html:185–187`):
- `.stat`: flex col, items center, gap 2, paper2 bg, 1px line border, radius 12, padding 10/14, min-width 68
- `.stat .v` (value): Montserrat 700 / **18** (HANDOFF said 22, design says 18 — design wins)
- `.stat .l` (label): Inter 400 / 10.5, ink3, uppercase, letterSpacing 0.06em

**Acceptance criteria**:
- [ ] Container: paper2 bg, 1px line border, radius 12 (`radius.cardSm`), padding 10/14, min-width 68, flex col items center, gap 2
- [ ] Value: `typography.statNumber` (Montserrat 700 / 18), ink color
- [ ] Label: `typography.statLabel` (Inter 400 / 10.5, uppercase, letterSpacing 0.6), ink3 color
- [ ] No hard-coded colors
- [ ] Visual side-by-side vs `Components.html` "Stat box" panel

**Tests**:
- renders value + label text
- container chrome: paper2 bg, line border, radius 12, padding 10/14, min-width 68
- value uses typography.statNumber (Montserrat 700 / 18)
- label uses typography.statLabel (uppercase, 10.5)
- ink/ink3 colors per mode

**Token corrections**:
- [ ] `typography.statNumber.fontSize`: 22 → 18 (matches design `.stat .v`)
- [ ] New `typography.statLabel`: Inter 400 / 10.5 / uppercase / letterSpacing 0.6
- [ ] tokens.test.ts updated

**Out of scope**: animated count-up on mount (defer to later); icon variant.

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
