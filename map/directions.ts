import { Linking, Platform } from 'react-native';

export type DirectionsTarget = {
  lat: number;
  lng: number;
  /** Spot name — used as the destination label where the platform supports it. */
  name?: string;
};

export type Platform_ = 'ios' | 'android' | 'web';

/**
 * Build a directions URL for the given platform.
 *
 * - **iOS**: `maps://` deep-links into Apple Maps with `daddr` set to the
 *   coordinates. Apple Maps doesn't take `place_id`, so the name is passed
 *   via the search query as a label.
 * - **Android**: `google.navigation:` opens Google Maps directly in
 *   navigation mode (turn-by-turn). Other apps won't intercept this URI.
 * - **Web**: the Google Maps universal `dir` URL works in every browser
 *   and on iOS / Android browsers as a fallback.
 *
 * Pure — no side effects. Tested in isolation.
 */
export function buildDirectionsUrl(
  target: DirectionsTarget,
  platform: Platform_,
): string {
  const { lat, lng, name } = target;
  const coords = `${lat},${lng}`;
  const label = name ? encodeURIComponent(name) : '';

  if (platform === 'ios') {
    // `daddr` = destination address; `q` adds a label.
    return `maps://?daddr=${coords}${label ? `&q=${label}` : ''}`;
  }
  if (platform === 'android') {
    return `google.navigation:q=${coords}`;
  }
  // Web fallback — Google Maps universal "dir" URL.
  const tail = label ? `&destination_name=${label}` : '';
  return `https://www.google.com/maps/dir/?api=1&destination=${coords}${tail}`;
}

/**
 * Open the platform's preferred directions surface for the target. Falls
 * back to the universal Google Maps web URL if the native scheme isn't
 * registered (e.g. user has uninstalled Google Maps on Android).
 */
export async function openDirections(target: DirectionsTarget): Promise<void> {
  const platform: Platform_ =
    Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
  const primary = buildDirectionsUrl(target, platform);
  const supported = await Linking.canOpenURL(primary).catch(() => false);
  if (supported) {
    await Linking.openURL(primary);
    return;
  }
  // Fall back to the web URL — every platform can open https.
  await Linking.openURL(buildDirectionsUrl(target, 'web'));
}
