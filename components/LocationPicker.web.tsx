import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';

export type LatLng = { lat: number; lng: number };
export type LocationPickerProps = {
  value: LatLng | null;
  onChange: (v: LatLng) => void;
};

const DEFAULT_CENTER: LatLng = { lat: 9.9333, lng: -84.0833 };
const PIN_COLOR = '#E07A2E';

/**
 * Web-only interactive map picker. Lets the user pan/zoom and tap anywhere to
 * drop or move a single pin; the chosen coordinate is reported back to the
 * parent via postMessage. Same iframe + Leaflet pattern as MapBackdrop so we
 * don't bundle Leaflet into our main JS.
 *
 * Important: the iframe HTML is built ONCE per mount (not on every value
 * change) so the user's pan/zoom state survives between pin drops.
 */
export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const initialValue = useRef(value);
  const html = useMemo(() => buildHtml(initialValue.current), []);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: MessageEvent) => {
      const data = e.data;
      if (
        data &&
        data.type === 'cf-pin-drop' &&
        typeof data.lat === 'number' &&
        typeof data.lng === 'number'
      ) {
        onChangeRef.current({ lat: data.lat, lng: data.lng });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <View style={{ height: 280, borderRadius: 14, overflow: 'hidden' }}>
      <iframe
        title="Pick spot location"
        srcDoc={html}
        style={{ width: '100%', height: '100%', border: 0 }}
        sandbox="allow-scripts allow-same-origin"
      />
    </View>
  );
}

/** Pure: build the Leaflet picker HTML, optionally with an initial pin. */
export function buildHtml(initial: LatLng | null): string {
  const center = initial ?? DEFAULT_CENTER;
  const initialMarker = initial
    ? `marker = L.marker([${initial.lat}, ${initial.lng}], { icon: pin() }).addTo(map);`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #cfd8d3; cursor: crosshair; }
  .cf-pin { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 99px; border: 3px solid #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.25); }
  .leaflet-control-attribution { font-size: 10px; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>
  var map = L.map('map', { zoomControl: true, attributionControl: true }).setView([${center.lat}, ${center.lng}], 11);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN',
  }).addTo(map);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    pane: 'overlayPane',
  }).addTo(map);

  function pin() {
    return L.divIcon({
      className: '',
      html: '<div class="cf-pin" style="background:${PIN_COLOR};"></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }

  var marker = null;
  ${initialMarker}

  map.on('click', function (e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng], { icon: pin() }).addTo(map);
    }
    if (window.parent && window.parent.postMessage) {
      window.parent.postMessage({ type: 'cf-pin-drop', lat: lat, lng: lng }, '*');
    }
  });
</script>
</body>
</html>`;
}
