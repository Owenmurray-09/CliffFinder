import { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from './store';

type Props = { children: React.ReactNode };

/**
 * Seeds `dark` from the system color scheme on first resolved value, then
 * gets out of the way. `useColorScheme()` returns `null` on first render
 * (RN web + iOS resolve asynchronously), so we wait for a non-null scheme
 * before guarding. Once a real value lands, we never re-seed — Settings
 * will own subsequent toggles.
 *
 * Theme state itself lives in the Zustand store; consumers read via
 * `useTheme()` and don't need this provider for context plumbing.
 */
export function ThemeProvider({ children }: Props) {
  const scheme = useColorScheme();
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    if (scheme == null) return;
    seeded.current = true;
    useThemeStore.getState().setDark(scheme === 'dark');
  }, [scheme]);

  return <>{children}</>;
}
