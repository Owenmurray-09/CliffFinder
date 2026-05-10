import type { Router } from 'expo-router';

type Href = Parameters<Router['replace']>[0];

/**
 * router.back() that won't silently no-op when the navigation stack is empty
 * (e.g. the user landed on a detail screen via router.replace, a deep link,
 * or a hard reload). Falls back to a sensible parent route instead.
 */
export function safeBack(router: Router, fallback: Href = '/'): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
