# Handoff: CliffFinder

## Overview
CliffFinder is a mobile app for cliff jumpers to **discover spots, log jumps, and follow friends.** Imagine Strava for cliff jumping. Users can browse a map of curated jump spots, view safety details (height, water depth, difficulty), photograph and submit new spots, log a jump with conditions/rating, and see what friends are doing in their Radar feed.

This bundle is the design output for the **MVP / v1 launch.** It contains 11 hi-fi screens, a complete component inventory, low-fidelity wireframes for context, and a photography brief.

## About the Design Files
The HTML files in this bundle are **design references** — interactive prototypes showing intended visual design, layout, and behavior. They are **not production code to copy directly.**

The task is to **recreate these designs in a real mobile codebase** (React Native, Expo, SwiftUI, or Flutter — whichever the team prefers) using that environment's idiomatic patterns. If no codebase exists yet, **React Native + Expo** is recommended — it matches the prototype's design vocabulary closely and gets to App Store / Play Store fastest for a small team.

## Fidelity
**High-fidelity.** All screens have final colors, typography, spacing, photography, and interaction details. The component inventory (`CliffFinder Components.html`) is the source of truth for design tokens. Pixel-perfect implementation against the hi-fi mocks is expected.

## Screens / Views

The hi-fi prototype lives in `CliffFinder Map.html` and shows 11 phones side-by-side. Each represents one screen.

### 1. Sign-in
- **Purpose**: Authenticate existing users; entry point to Sign-up and Forgot-password
- **Layout**: 280px waterfall hero photo at top, fading into paper background. Below: "Welcome back" title, Email + Password fields, Sign in button, Forgot password link, divider, Create account outline button
- **Components**: `Field` (email, password with show/hide toggle), `Button.primary` (Sign in), `Button.link` (Forgot password), `Button.outline` (Create account)
- **Validation**: Email regex; password ≥ 6 chars; inline ⚠ error below field
- **Sub-views**: `signup` (Name + Email + Password + Confirm), `forgot` (Email → Send reset link), `sent` (Check inbox confirmation), `done` (Signed in confirmation)

### 2. Map (default home)
- **Purpose**: Discover spots geographically
- **Layout**: Full-bleed Leaflet map (ESRI World Topo tiles). Floating glass UI: top search bar + filter chip row. Pins for 5 spots in 3 colors (trending/saved/friends). Bottom legend card. FAB above tab bar. Tap pin → bottom sheet
- **Components**: `Search bar (glass)`, `Chip pill` (filter), `Pin marker` (3 categories), `Legend card`, `FAB`, `Sheet` (bottom)

### 3. Filters
- **Purpose**: Narrow map results by height, difficulty, water temp, distance
- **Layout**: Bottom sheet with handle. Sections for each filter (Slider components), category chips, Apply button at bottom
- **Components**: `Slider`, `Chip pill`, `Button.primary`

### 4. Spot Details
- **Purpose**: Decide whether to visit a spot; log a jump
- **Layout**: Photo carousel hero (4 photos with page dots, dark overlay bottom for title). Below: title + rating + meta. 3 stat boxes (Height, Depth, Water). Description. Tabs (Photos / Reviews / Map). Recent jumps list. "Log a jump" sticky button
- **Components**: `Photo carousel`, `Star row`, `Stat box`, `Segmented control`, `Friend row`, `Button.primary`

### 5. Add Spot
- **Purpose**: Submit a new spot
- **Layout**: Multi-step. Step 1: tap location on map. Step 2: form (Name, Height, Depth, Difficulty, Water type, Description). Step 3: photo upload (1–6 photos). Step 4: confirmation
- **Components**: `Field`, `Slider`, `Chip pill` (difficulty pick), `Photo card`, `Button.primary`

### 6. Log Entry
- **Purpose**: Record a jump
- **Layout**: Spot title + date. Sliders for height-jumped, water-temp. Star rating (interactive). Notes textarea. Save button
- **Components**: `Slider`, `Star row` (interactive), `Field` (textarea variant), `Button.primary`

### 7. Logbook
- **Purpose**: User's history of jumps + saved spots
- **Layout**: Top bar with title. Segmented control (Visited / Saved). List of cards with photo thumbnail + title + meta + date. Empty state when none
- **Components**: `Segmented control`, `Logbook entry`, `Empty state`

### 8. Radar
- **Purpose**: Activity feed from friends
- **Layout**: Top bar. List of friend-activity rows (avatar + name + action + when). Tap → friend's profile or spot. Empty state when no friends
- **Components**: `Friend row`, `Avatar`, `Empty state`

### 9. Profile
- **Purpose**: User's own profile
- **Layout**: Cover photo + avatar + name + stats row (jumps / spots added / followers). List sections: My jumps, Achievements, Settings link
- **Components**: `Avatar`, `Stat box`, `List row`

### 10. Settings
- **Purpose**: Account preferences
- **Layout**: Top bar with back. Grouped list (Account, Notifications, Display, About, Sign out). Each row = `List row` with chevron or toggle
- **Components**: `List row`, `Toggle`

### 11. Friend's Profile
- **Purpose**: View another user
- **Layout**: Same shell as own Profile, with Follow / Following button instead of Edit
- **Components**: same as Profile + `Button.outline`

## Interactions & Behavior

- **Sign in success**: validate → 600ms simulated request → navigate to Map
- **Map pin tap**: pin scales to 1.15× with shadow lift (250ms ease-out) → bottom sheet slides up (350ms cubic-bezier(.2,.8,.2,1))
- **Sheet dismiss**: drag down OR tap backdrop OR tap close → slide down + backdrop fade
- **Heart tap (save)**: scale 1 → 1.3 → 1 over 250ms; color fills; persists locally
- **Photo carousel swipe**: 350ms transform translation; page dots animate width
- **Filter chip tap**: pill fills accent color; map pins re-filter immediately
- **FAB tap**: opens Add Spot flow
- **Tab bar tap**: 200ms color crossfade on icon + label

## State Management

For a React Native implementation, recommend:
- **Server state**: TanStack Query (React Query) — spots, user profile, friend activity, jump logs
- **Client UI state**: Zustand or React Context — current map filters, sheet open/closed, sign-in form state, theme (dark/light + accent)
- **Auth**: any standard provider (Auth0 / Firebase Auth / Supabase Auth) — design assumes email + password only for v1

State variables visible in the design:
- `user` — current authenticated user
- `spots[]` — array of spot objects (see schema below)
- `selectedSpotId` — for sheet/details
- `mapFilters` — { height: [min,max], difficulty: [], water: [], distance: max }
- `logEntries[]` — user's logged jumps
- `savedSpotIds[]` — user's saved spots
- `friends[]`, `radarFeed[]`
- `theme` — { dark: bool, accent: hex }

## Spot data schema
```ts
type Spot = {
  id: string;
  name: string;
  area: string;          // "Squamish, BC"
  lat: number; lng: number;
  height_m: number;      // jump height in meters
  depth_m: number;       // water depth in meters
  rating: number;        // 0-5
  reviewCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'trending' | 'saved' | 'friends';   // semantic, drives pin color
  photos: string[];      // URLs to spot-{id}-hero-{1..4}.jpg
  description: string;
  waterType: 'lake' | 'ocean' | 'river' | 'quarry' | 'falls';
};
```

## Design Tokens

All tokens are documented visually in `CliffFinder Components.html`. Core values:

### Colors
| Token | Value | Use |
|---|---|---|
| `--ink` (charcoal) | `#1E2F23` | Primary text, dark surfaces |
| `--paper` | `#F2EAD0` | App background (light mode) |
| `--paper-2` | `#E8DDBE` | Card surfaces (light mode) |
| `--ink-3` | `#7a8579` | Muted text |
| `--accent` (default) | `#7BA7C8` | Light blue — primary CTAs, links |
| Accent · alt | `#E07A2E` | Orange (Tweak option) |
| Accent · alt | `#2E7D32` | Forest green (Tweak option) |
| Pin · trending | `#E07A2C` | Orange — semantic, do not substitute with accent |
| Pin · saved | `#F2C94C` | Yellow — semantic |
| Pin · friends | `#7BA7C8` | Pink/blue — semantic |
| Dark · paper | `#0F1A14` | Background (dark mode) |
| Dark · paper-2 | `#1A2820` | Card surface (dark mode) |
| Dark · ink | `#EAE2C8` | Primary text (dark mode) |
| Danger | `#B0413E` | Errors |

### Typography
- **Poppins** (400 / 600 / 700) — titles, buttons
- **Inter** (400 / 500 / 600) — body, labels
- **Montserrat** (600 / 700) — stat numbers (height, depth, ratings)

| Style | Family / weight / size |
|---|---|
| Display | Poppins 700 / 28-32 |
| Title | Poppins 700 / 20 |
| Card title | Poppins 600 / 15 |
| Button | Poppins 400 / 14.5-15 |
| Body | Inter 400 / 14 |
| Caption / label | Inter 500 / 12 |
| Stat number | Montserrat 700 / 22 |

### Spacing scale
4 · 8 · 12 · 16 · 22 · 28 · 40 (px). Use `gap` on flex/grid, not margins, where possible.

### Border radius
- Chips / pills: `999px`
- Cards / fields / buttons: `12-14px`
- Sheet: `22px` (top corners only)
- Phone screen: `36px`

### Shadows
- `sm`: `0 1px 3px rgba(0,0,0,.06)` — subtle card lift
- `md`: `0 4px 12px rgba(0,0,0,.10)` — elevated card / sheet
- `lg`: `0 10px 28px rgba(0,0,0,.18)` — FAB / modal

### Theme
Two CSS custom properties drive all theming: `--accent` (3 user-pickable values) and `body.dark` (boolean). No component should hard-code colors outside these tokens.

## Assets

### Photography
- See `CliffFinder Photography Brief.html` for the full production spec
- The mockup uses **Unsplash hotlinks as placeholders** — these are not licensed for production
- v1 launch needs **6 must-have photos** (1 sign-in hero + 5 spot heroes), license budget ~$300 stock OR ~$1.5–4K commissioned shoot
- File naming: `spot-{id}-hero-{1..4}.jpg`, `ui-signin-hero.jpg`
- Format: JPEG, sRGB, 2400×1600 @ q80, < 400KB

### Icons
The prototype uses inline SVG icons. For production, use a single icon library — recommend `lucide-react-native` (matches the line-weight aesthetic of the prototype). Icons in use: `back`, `close`, `search`, `gear`, `moon`, `star`, `heart`, `pin`, `compass`, `bell`, `chevron-right`, `camera`, `plus`, `trash`, `check`, `edit`, `filter`.

### Map tiles
Prototype uses **ESRI World Topo** (Leaflet) for the satellite/terrain look. Production options:
- **Mapbox** (recommended) — `outdoors-v12` style approximates the look closely; native SDK on iOS / Android
- **Apple MapKit** (iOS) — free, native feel, less terrain detail
- **Google Maps** — most familiar but visually generic

## Files in this bundle

| File | What it is |
|---|---|
| `CliffFinder Map.html` | Hi-fi prototype — all 11 screens rendered as iOS phones with the Sign-in flow fully interactive. Toggle Tweaks (top-right) for dark mode + accent color. **Source of truth for visual design.** |
| `CliffFinder Components.html` | Component inventory — 34 reusable pieces grouped into Foundations, Buttons, Inputs, Navigation, Surfaces, Lists, Indicators, States. Light/dark + accent toggles. **Source of truth for design tokens.** |
| `CliffFinder Photography Brief.html` | Production photography spec — what to shoot/license, dimensions, mood, sourcing paths, pre-launch checklist. |
| `CliffFinder v2 (Wireframes).html` | Earlier low-fi wireframes — flow context. Use as reference for screen relationships, not styling. |

## Out of scope for v1

These were considered and explicitly **descoped** for the launch build:
- **Onboarding** — no 3-screen value-prop carousel before sign-in. App lands directly on Sign-in
- **Unsafe-spot reporting / moderation flow** — no flag/report UI in v1
- **Comments on jumps** — Logbook entries are personal-only at launch

## Recommended implementation order

1. Design tokens (colors, type, spacing) as theme provider — match `CliffFinder Components.html`
2. Component library — Buttons, Fields, Chips, Toggles, Cards (the inventory in order)
3. Navigation shell + tab bar
4. Map screen with mock data
5. Sign-in flow (already fully spec'd in the prototype)
6. Spot Details + Log Entry
7. Logbook + Radar
8. Profile + Settings
9. Add Spot wizard
10. Real backend integration

Build each component in isolation against the inventory page, then compose into screens. The screens are simpler than they look once the components are right.
