import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import type { Spot } from '@/data/types';

export type MapBackdropProps = {
  spots: ReadonlyArray<Spot>;
  onSpotPress: (spot: Spot) => void;
};

const PIN_COLORS: Record<Spot['category'], string> = {
  trending: '#E07A2E',
  saved: '#E8B742',
  friends: '#D17EA8',
};

const SAVED_COLOR_OUTLINE = '#1E2F23';

/**
 * Web-only Leaflet map. Renders inside an iframe srcDoc so the Leaflet
 * runtime isn't bundled into our main JS — the iframe loads it from
 * unpkg on demand. Markers post {type:'cf-spot-click', id} back to the
 * parent window when tapped; the parent listens via window.addEventListener.
 *
 * Tiles: ESRI World Imagery (satellite base) + ESRI Boundaries & Places
 * (transparent labels overlay). Together they produce the Google-Maps
 * "Satellite" hybrid look. Both endpoints are keyless.
 */
export function MapBackdrop({ spots, onSpotPress }: MapBackdropProps) {
  // Build the iframe HTML once per spot list. The iframe is only re-rendered
  // when this string changes, so we DON'T want this in render-frequent
  // callbacks. Memoize on stable spot inputs.
  const html = useMemo(() => buildHtml(spots), [spots]);

  // Stable lookup map for incoming clicks → spot.
  const lookup = useRef<Map<string, Spot>>(new Map());
  useEffect(() => {
    lookup.current = new Map(spots.map((s) => [s.id, s] as const));
  }, [spots]);

  // The same handler stays attached for the component's lifetime; new
  // onSpotPress references are picked up via a ref so we don't churn the
  // listener on every render.
  const onPressRef = useRef(onSpotPress);
  useEffect(() => {
    onPressRef.current = onSpotPress;
  }, [onSpotPress]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: MessageEvent) => {
      const data = e.data;
      if (data && data.type === 'cf-spot-click' && typeof data.id === 'string') {
        const spot = lookup.current.get(data.id);
        if (spot) onPressRef.current(spot);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <iframe
        title="CliffFinder map"
        srcDoc={html}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          border: 0,
        }}
        sandbox="allow-scripts allow-same-origin"
      />
    </View>
  );
}

/** Pure: build the Leaflet iframe HTML for the given spots. */
export function buildHtml(spots: ReadonlyArray<Spot>): string {
  const markers = spots.map((s) => ({
    id: s.id,
    lat: s.lat,
    lng: s.lng,
    name: s.name,
    color: PIN_COLORS[s.category],
    saved: s.category === 'saved',
  }));
  // BC area fits all 5 spots — frame around the centroid with reasonable zoom.
  const lats = spots.map((s) => s.lat);
  const lngs = spots.map((s) => s.lng);
  const cLat = lats.length ? (Math.min(...lats) + Math.max(...lats)) / 2 : 49.5;
  const cLng = lngs.length ? (Math.min(...lngs) + Math.max(...lngs)) / 2 : -123.1;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #cfd8d3; }
  .cf-pin { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 99px; border: 3px solid #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.25); cursor: pointer; }
  .cf-pin:hover { transform: scale(1.08); transition: transform .15s ease; }
  .leaflet-control-attribution { font-size: 10px; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>
  var map = L.map('map', { zoomControl: true, attributionControl: true }).setView([${cLat}, ${cLng}], 11);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN',
  }).addTo(map);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    pane: 'overlayPane',
  }).addTo(map);
  var SPOTS = ${JSON.stringify(markers)};
  SPOTS.forEach(function (s) {
    var icon = L.divIcon({
      className: '',
      html: '<div class="cf-pin" style="background:' + s.color + ';' + (s.saved ? 'color:${SAVED_COLOR_OUTLINE};' : 'color:#fff;') + '"></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    var m = L.marker([s.lat, s.lng], { icon: icon, title: s.name }).addTo(map);
    m.on('click', function () {
      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({ type: 'cf-spot-click', id: s.id }, '*');
      }
    });
  });
</script>
</body>
</html>`;
}
