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

**Loop status**: pending

**Acceptance criteria**:
- [ ] All tokens from "Distilled implementation details" exist in `theme/tokens.ts`
- [ ] Light + dark palettes both exported; dark mode bg uses radial gradient definition (consumable as gradient stops)
- [ ] `--sheet-soft` is a distinct token (not `paper-2 + opacity`)
- [ ] Pin colors (`#E07A2C`, `#E8B742`, `#D17EA8`) are semantic, not driven by accent
- [ ] 4 accent options exposed: `#E07A2C`, `#2E7D32`, `#7BA7C8`, `#1E2F23`
- [ ] `ThemeProvider` exposes `{ palette, accent, dark, setAccent, setDark }`
- [ ] `useTheme()` hook returns resolved values
- [ ] Accent state managed via Zustand store
- [ ] Visual: compare against `Components.html` "Foundations" panel — colors match within 1 LSB
- [ ] Both light + dark resolve correctly
- [ ] All 4 accent options switchable

**Tests**: `theme/__tests__/tokens.test.ts` — accent switching produces correct resolved color; light vs dark resolves correct paper/ink.

**Out of scope**: persisting theme choice across app launches (covered by Settings later).
