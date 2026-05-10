// Native fallback: a topographic Unsplash photo with absolutely-positioned
// pins. The web version (MapBackdrop.web.tsx) renders a real Leaflet map
// with ESRI World Topo tiles via an iframe — Metro picks up the .web.tsx
// extension automatically when bundling for web.
import { useState } from 'react';
import { Image, type LayoutChangeEvent, Pressable, View } from 'react-native';
import { PinMarker } from './PinMarker';
import type { Spot } from '@/data/types';
import { project, SPOTS_BBOX } from '@/map/projection';

const BACKDROP_URI =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80';

export type MapBackdropProps = {
  spots: ReadonlyArray<Spot>;
  onSpotPress: (spot: Spot) => void;
};

export function MapBackdrop({ spots, onSpotPress }: MapBackdropProps) {
  return (
    <View style={{ flex: 1 }}>
      <Image
        source={{ uri: BACKDROP_URI }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      <PinOverlay spots={spots} onSpotPress={onSpotPress} />
    </View>
  );
}

function PinOverlay({ spots, onSpotPress }: MapBackdropProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ width, height });
  };
  return (
    <View
      onLayout={onLayout}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {layout.width > 0
        ? spots.map((spot) => {
            const { x, y } = project(spot, SPOTS_BBOX);
            return (
              <Pressable
                key={spot.id}
                onPress={() => onSpotPress(spot)}
                accessibilityRole="button"
                accessibilityLabel={`${spot.name} pin`}
                style={{
                  position: 'absolute',
                  left: x * layout.width - 16,
                  top: y * layout.height - 16,
                }}
              >
                <PinMarker category={spot.category} />
              </Pressable>
            );
          })
        : null}
    </View>
  );
}
