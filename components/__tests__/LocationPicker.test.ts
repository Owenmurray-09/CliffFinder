import { buildHtml } from '../LocationPicker.web';

describe('LocationPicker buildHtml', () => {
  test('uses ESRI satellite + labels (matches MapBackdrop)', () => {
    const html = buildHtml(null);
    expect(html).toContain(
      'server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    );
    expect(html).toContain(
      'server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    );
  });

  test('with no value, opens centered on San José and renders no initial marker', () => {
    const html = buildHtml(null);
    expect(html).toContain('setView([9.9333, -84.0833]');
    // The click handler creates a marker on first tap (using the JS vars
    // lat/lng), but at script-load time the initial-marker slot stays empty
    // and `marker` starts as null.
    expect(html).toContain('var marker = null;');
    expect(html).not.toMatch(/L\.marker\(\[-?\d+\.?\d*,\s*-?\d+\.?\d*\]/);
  });

  test('with a value, opens centered on the pin and renders the marker', () => {
    const html = buildHtml({ lat: 10.205, lng: -84.298 });
    expect(html).toContain('setView([10.205, -84.298]');
    expect(html).toContain('L.marker([10.205, -84.298]');
  });

  test('subscribes to map clicks and posts back to the parent with lat/lng', () => {
    const html = buildHtml(null);
    expect(html).toContain("map.on('click'");
    expect(html).toContain("type: 'cf-pin-drop'");
    expect(html).toContain('window.parent.postMessage');
  });
});
