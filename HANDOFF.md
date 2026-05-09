# HANDOFF: CliffFinder Implementation

You are taking over a project. Read this top-to-bottom before doing anything else.

## Mission

Implement the CliffFinder mobile app from the designs in `design_handoff_clifffinder/`. Stack: **React Native + Expo + TypeScript**. Target: pixel-faithful MVP of all 11 screens for v1. Use a strict **spec-driven, small-loop** discipline (defined below) — not a top-down "scaffold and pour code" approach.

## Working environment

- **Working directory**: `/Users/owen/Documents/CliffFinder`
- **GitHub repo**: https://github.com/Owenmurray-09/CliffFinder (public, **empty**, `origin` already configured in `.git/`)
- **gh CLI**: authenticated as `Owenmurray-09` (account email `owen.murray.music@googlemail.com`, primary user email `murraymusic@gmail.com`)
- **Permissions mode**: this session is `--dangerously-skip-permissions`. No confirmation prompts — **be deliberate about destructive actions despite the lack of gating**. Never `rm -rf`, force-push, or overwrite work without thinking.
- **MCP**: Chrome DevTools MCP is configured. Use it for visual fidelity checks (see "Chrome DevTools usage" below).
- **Today's date**: 2026-05-09

## State of the directory

```
CliffFinder/
├── .git/                              # initialized, no commits, origin → GitHub
├── design_handoff_clifffinder/        # design source of truth — DO NOT MODIFY
│   ├── README.md
│   ├── CliffFinder Components.html
│   ├── CliffFinder Map.html
│   ├── CliffFinder Photography Brief.html
│   └── CliffFinder v2 (Wireframes).html
└── HANDOFF.md                         # this file
```

A previous session started a partial scaffold (package.json, tokens.ts) and discarded it before handing off. **Start fresh** — don't assume any prior decisions are correct except those documented here.

## Read these first, in order

1. This file (HANDOFF.md) — fully
2. `design_handoff_clifffinder/README.md` — full design brief, 11 screens, design tokens, schema, scope. **This is the design spec.**
3. The "Distilled implementation details" section below — one-time research already done; don't repeat it
4. `design_handoff_clifffinder/CliffFinder Components.html` — token + component visual source of truth (open in Chrome via MCP and keep open as reference)

---

## Methodology: the loop

For **each feature** (one component, or one screen, or one cohesive flow), execute these seven steps:

### 1. Spec
Update `SPEC.md` (create if missing — template below) with a new section. Acceptance criteria must be **testable** and reference the specific HTML panel to compare against.

### 2. Tests (logic only)
Write tests for pure / deterministic behavior:
- Form validation
- Store reducers / state transitions
- Filter math, sheet snap-point math, distance/sort logic

**Skip TDD for visual fidelity** (border-radius, padding, shadow values). Visual is verified in step 4 via Chrome DevTools side-by-side, and ultimately by the user on a simulator.

### 3. Implement
- Pull tokens from the theme module; never hard-code colors outside it
- One file per component; one screen per route file
- Keep diffs small — one feature per loop

### 4. Verify
- `npx tsc --noEmit` passes
- `npm test` passes
- For features with web-renderable surface: use **Chrome DevTools MCP** to load the Expo web build (`npx expo start --web`) AND the design HTML in adjacent tabs. Compare layout, computed colors, spacing.
- **Native-only features** (`BlurView` native impl, `react-native-gesture-handler`, `expo-haptics`, native map) won't render faithfully on web — flag these for the user to verify on a simulator.

### 5. Independent review
Spawn a **fresh `general-purpose` Agent** (no context from your work) with:
- The relevant `SPEC.md` section (paste it)
- The diff of files changed in this loop (paste `git diff`)
- Instruction: *"Compare the implementation against the spec. List gaps, mismatched tokens, missing edge cases, and anything you'd reject in code review. Be skeptical — assume there's a problem."*

Address review findings before moving on.

### 6. Commit
- One commit per loop (or 2–3 if review surfaced fixes)
- Conventional commit style: `feat(theme): add design tokens`, `feat(map): pin markers`, `fix(button): outline border in dark mode`
- **Don't push to GitHub** unless the user explicitly asks

### 7. Mark done
Update `SPEC.md` to check off acceptance criteria. Move to the next item in the implementation order.

---

## Stack

- **Framework**: Expo SDK (latest stable). Scaffold via `npx create-expo-app@latest . --template default` (use `.` to scaffold in the current directory; you'll need to handle the non-empty-dir case — temp-dir-and-merge is fine, just preserve `.git/`, `design_handoff_clifffinder/`, `HANDOFF.md`).
- **Routing**: Expo Router (file-based)
- **Language**: TypeScript, strict mode
- **State**: Zustand for UI state. **Skip TanStack Query** for v1 — there's no real backend; mock data only.
- **Icons**: `lucide-react-native`
- **Fonts**: Poppins, Inter, Montserrat via `@expo-google-fonts/poppins`, `@expo-google-fonts/inter`, `@expo-google-fonts/montserrat`
- **Glass / blur**: `expo-blur` (`BlurView`)
- **Gestures**: `react-native-gesture-handler`
- **Animations**: `react-native-reanimated` (Reanimated babel plugin **must be last** in `babel.config.js`)
- **Map for v1**: render a static placeholder backdrop (image or simplified vector) with absolutely-positioned pin markers. **Do not wire Mapbox native** — defer to post-MVP per the README.
- **Bottom sheet**: hand-rolled with Reanimated + GestureHandler (the design specifies exact snap behavior — easier to control than a third-party library).
- **Tests**: Jest (`jest-expo` preset). Co-locate tests as `__tests__/` next to source.

## Implementation order (per README)

Each numbered item is one loop (sometimes more for complex screens).

1. **Project scaffold** — `create-expo-app`, TypeScript strict, Expo Router, install deps
2. **Theme system** — `theme/tokens.ts`, `ThemeProvider` (light/dark + 3 accent options), `useTheme` hook. Verify accent + dark switching works.
3. **Component library** — build in this order, one loop each:
   - Button (primary / ghost / outline / link variants + busy state)
   - Field (default / focus / error states)
   - Chip pill (default / on)
   - Toggle
   - Slider
   - Card / GlassPanel (BlurView-based)
   - Avatar
   - StatBox
   - StarRow (read-only + interactive variants)
   - SegmentedControl
   - PinMarker (3 categories)
   - FAB
   - ListRow (chevron + toggle variants)
   - EmptyState
   - SearchBar (glass)
   - Sheet (bottom, drag-to-dismiss, snap points)
   - PhotoCarousel (page dots)
4. **Mock data** — `data/spots.ts`, `data/friends.ts`, `data/logEntries.ts`, `data/user.ts`
5. **Navigation shell** — tab bar (Map, Logbook, Radar, Profile) + center FAB
6. **Sign-in flow** — signin → signup → forgot → sent → done; location prompt
7. **Map screen** — pins, glass search bar, filter chips, legend, FAB
8. **Filters bottom sheet**
9. **Spot Details** — carousel, stats, tabs, sticky CTA
10. **Log Entry**
11. **Logbook** — Visited / Saved segmented
12. **Radar feed**
13. **Profile** + Friend's Profile
14. **Settings**
15. **Add Spot wizard** — location → form → photos → confirm

---

## Distilled implementation details (don't re-research)

### Complete CSS custom property block

**Light** (`:root`):
```css
--paper:#F2EAD0; --paper-2:#E8DDBE; --sheet-soft:#EFE5C2;
--ink:#1E2F23; --ink-2:#3a4a3e; --ink-3:#7a8579;
--line:rgba(30,47,35,.12); --line-2:rgba(30,47,35,.06);
--accent:#7BA7C8;  /* user-pickable: #E07A2C, #2E7D32, #7BA7C8, #1E2F23 */
```

**Dark** (`body.dark`):
```css
--paper:#0F1A14; --paper-2:#1A2820; --sheet-soft:#21302A;
--ink:#EAE2C8; --ink-2:#cfc7af; --ink-3:#9AB096;
--line:rgba(234,226,200,.14); --line-2:rgba(234,226,200,.06);
/* dark mode bg uses radial gradient centered at 30%/0% — not flat */
```

**Glass UI** (`expo-blur`):
- Search/filter bar: tint `rgba(255,255,255,0.85)` light / `rgba(30,47,35,0.62)` dark, intensity ~24
- Topbar: lighter blur (~18)
- Tab bar: blur ~20 with saturate

### Pin colors (semantic — never substitute with accent)

- Trending: `#E07A2C` (orange)
- Saved: `#E8B742` (yellow — use dark text for contrast)
- Friends: `#D17EA8` (pink)

### Other colors

- Danger: `#B0413E`
- Star fill (interactive): `#E8B742`
- Star fill (read-only/stat): `#C9A227`

### Typography

- Display: Poppins 700 / 28–32
- Title: Poppins 700 / 20
- Card title: Poppins 600 / 15
- Button: Poppins 400 / 14.5–15
- Nav label: Poppins 600 / 11
- Body: Inter 400 / 14
- Label: Inter 500 / 12
- **Field label**: Inter 500 / 11, uppercase, `letterSpacing: 0.6` (~0.05em), color `--ink-3`
- Stat number: Montserrat 700 / 22

### Spacing scale

`4 · 8 · 12 · 16 · 22 · 28 · 40` — prefer flex `gap` over margins.

### Border radius

- Chips/pills: 999
- Cards/fields/buttons: 12–14
- Sheet: 28 (top corners only)

### Shadows

- `sm`: `0 1px 3px rgba(0,0,0,.06)`
- `md`: `0 4px 12px rgba(0,0,0,.10)`
- `lg`: `0 10px 28px rgba(0,0,0,.18)`
- Sheet: `0 -10px 40px rgba(0,0,0,.18)` (upward)
- FAB: `0 8px 22px ${accent}66` (alpha-keyed to current accent)
- Tab bar: `0 12px 36px rgba(30,47,35,.18)`

### Component variant matrix

- **Field**: default / focus (accent border) / error (`#B0413E` border + ⚠ message below)
- **Button**: primary (accent fill) / ghost (soft bg) / outline (accent border, transparent bg) / link (text-only, accent color). Sign-in busy state ~700ms.
- **FAB**: 54×54, accent fill, `marginTop: -22` to float above tab bar
- **Toggle**: 44×26 track, 18px thumb translate
- **Slider**: 6px track, 20×20 thumb with accent ring
- **Chip pill**: `borderRadius: 999`, `.on` = accent bg

### Sign-in flow

- 5 sub-views: `signin` → `signup` → `forgot` → `sent` → `done`
- Email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Password ≥ 6 chars
- Sign-in success: 700ms simulated busy → location prompt
- **Location prompt**: radar graphic (3 concentric rings, decreasing opacity, central pin icon) + "Allow while using app" (primary) + "Maybe later" (link)

### Bottom sheet

- Max height: 78% of viewport
- Handle: 40×4, `rgba(30,47,35,0.2)`, centered, 10px from top
- Top corners: 28px
- Backdrop: `rgba(0,0,0,0.35)`, 0.3s fade
- Slide: `translateY(100%) → 0` over 0.35s, easing `Easing.bezier(0.2, 0.8, 0.2, 1)` in Reanimated

### Map UI layout

- Search bar (top, 48px tall, glass, radius 16)
- Filter button (top-right, square glass)
- Filter chips row below search, scrollable horizontally
- Legend bottom-left: 10×10 dots, glass card
- Tab bar: 64px tall, glass, 24 corner radius, 12px inset from edges, `bottom: 24`
- FAB centered above tab bar

### Spot data schema

```ts
type Spot = {
  id: string;
  name: string;
  area: string;             // "Squamish, BC"
  lat: number; lng: number;
  height_m: number;
  depth_m: number;
  rating: number;           // 0-5
  reviewCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'trending' | 'saved' | 'friends';
  photos: string[];
  description: string;
  waterType: 'lake' | 'ocean' | 'river' | 'quarry' | 'falls';
};
```

### Surprising / easily missed

- Leaflet attribution is `display:none` in the prototype — implement none or your own.
- `--sheet-soft` is its own variable, not `--paper-2` with opacity.
- Dark mode background uses a **radial gradient**, not flat color.
- Pin colors are **semantic** — they do not change with the user's accent setting.
- The 4th accent option (`#1E2F23`) is the ink color itself ("monochrome" mode).

---

## Chrome DevTools MCP usage

Most powerful pattern: **side-by-side comparison.**

1. Open `design_handoff_clifffinder/CliffFinder Map.html` (or `Components.html`) in one Chrome tab via MCP — this is the design source of truth.
2. Open `http://localhost:8081` (Expo web) in an adjacent tab.
3. Use the DevTools to inspect computed styles, measure box sizes, sample colors with the eyedropper.
4. For each panel in the design, find its counterpart in your build and verify spacing, color, typography, radius.

**Limits**: native-only behaviors don't render faithfully on web. Flag these explicitly when handing back to the user for simulator verification:
- `BlurView` (uses CSS `backdrop-filter` on web; native iOS/Android implementations differ)
- Gesture-handler interactions (pan/swipe on bottom sheet, photo carousel)
- Haptics
- Native map (when added)

---

## SPEC.md template

Create `SPEC.md` at the project root. One section per feature, appended as you go. Example:

```markdown
# CliffFinder Implementation Spec

Living document. Each feature loop appends a section. Check off acceptance criteria as completed.

---

## Feature: Theme system

**Loop status**: complete

**Acceptance criteria**:
- [x] All tokens from "Distilled implementation details" exist in `theme/tokens.ts`
- [x] `ThemeProvider` exposes `{ palette, accent, dark, setAccent, setDark }`
- [x] `useTheme()` hook returns resolved values
- [x] Accent persists across app re-render (Zustand)
- [x] Compare against `Components.html` "Foundations" panel — colors match within 1 LSB
- [x] Both light + dark render correctly
- [x] All 4 accent options switchable

**Tokens used**: full token block

**Tests**: `theme/__tests__/tokens.test.ts` — accent switching produces correct resolved color

**Out of scope for this loop**: persisting theme choice across app launches (covered later by Settings)

---

## Feature: Button component

**Loop status**: in progress

**Acceptance criteria**:
- [ ] Variants: primary, ghost, outline, link
- [ ] Busy state with 700ms simulated delay (used in Sign-in)
- [ ] Disabled state at 0.5 opacity
- [ ] Visual: matches `Components.html` "Buttons" panel
- ...
```

---

## Definition of done (v1)

- All 11 screens implemented and reachable from navigation
- Light + dark modes both work
- All 4 accent options switchable from Settings
- Empty states render for: no jumps, no friends, no saved spots
- Sign-in / sign-up validation works (inline errors)
- Mock data populates everything — no white screens
- `npx tsc --noEmit` clean
- `npm test` passes for all logic
- User has run on simulator and visually signed off

## Out of scope for v1 (do not implement)

- Onboarding value-prop carousel (3 screens before sign-in)
- Unsafe-spot reporting / moderation flow
- Comments on jumps in the Logbook
- Real backend — mock data only
- Mapbox native integration — placeholder map only
- Production photography — Unsplash hotlinks are fine for dev, flag as launch blocker

## Hard rules

- **Never** hard-code colors outside `theme/tokens.ts`
- **Never** push to GitHub without explicit user request
- **Never** use destructive operations (`rm -rf`, `git reset --hard`, force-push) without an explicit user request — `--dangerously-skip-permissions` does not authorize destruction
- **Never** add features beyond v1 scope
- **Always** flag native-only features for user simulator verification when finishing a loop
- **Always** spawn a fresh reviewer agent per loop — your own review is biased

## First actions

1. Read `design_handoff_clifffinder/README.md`
2. Open `CliffFinder Components.html` in Chrome via MCP — keep it open
3. Create `SPEC.md` with the template above
4. Begin loop 1: project scaffold (create-expo-app, install deps, verify it boots to web)

Good luck.
