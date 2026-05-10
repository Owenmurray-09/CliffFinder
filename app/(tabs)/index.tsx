import { useState } from 'react';
import {
  Image,
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { GlassPanel } from '@/components/GlassPanel';
import { PinMarker } from '@/components/PinMarker';
import { SearchBar } from '@/components/SearchBar';
import { Sheet } from '@/components/Sheet';
import { StatBox } from '@/components/StatBox';
import { SPOTS } from '@/data/spots';
import type { Spot, SpotCategory } from '@/data/types';
import { project, SPOTS_BBOX } from '@/map/projection';
import { useTheme } from '@/theme/useTheme';

const BACKDROP_URI =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80';

const FILTERS: ReadonlyArray<{ key: SpotCategory; label: string }> = [
  { key: 'trending', label: 'Trending' },
  { key: 'saved', label: 'Saved' },
  { key: 'friends', label: 'Friends' },
];

export default function MapScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [activeFilters, setActiveFilters] = useState<Set<SpotCategory>>(new Set());
  const [search, setSearch] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const onBackdropLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ width, height });
  };

  const visibleSpots = SPOTS.filter((s) => {
    const inFilter = activeFilters.size === 0 || activeFilters.has(s.category);
    const inSearch =
      search.length === 0 || s.name.toLowerCase().includes(search.toLowerCase());
    return inFilter && inSearch;
  });

  const toggleFilter = (key: SpotCategory) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.paper }}>
      <View
        onLayout={onBackdropLayout}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <Image
          source={{ uri: BACKDROP_URI }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        {layout.width > 0
          ? visibleSpots.map((spot) => {
              const { x, y } = project(spot, SPOTS_BBOX);
              return (
                <Pressable
                  key={spot.id}
                  onPress={() => setSelectedSpot(spot)}
                  style={{
                    position: 'absolute',
                    left: x * layout.width - 16,
                    top: y * layout.height - 16,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${spot.name} pin`}
                >
                  <PinMarker category={spot.category} />
                </Pressable>
              );
            })
          : null}
      </View>

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: Math.max(insets.top, 12),
          left: 12,
          right: 12,
          gap: 10,
        }}
      >
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search spots" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
        >
          {FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              selected={activeFilters.has(f.key)}
              onPress={() => toggleFilter(f.key)}
            />
          ))}
        </ScrollView>
      </View>

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          bottom: Math.max(insets.bottom, 24) + 88, // clear the tab bar (88 ≈ tab + FAB)
          left: 12,
        }}
      >
        <Legend />
      </View>

      <Sheet visible={selectedSpot !== null} onClose={() => setSelectedSpot(null)}>
        {selectedSpot ? <SpotPreview spot={selectedSpot} /> : null}
      </Sheet>
    </View>
  );
}

function Legend() {
  const t = useTheme();
  return (
    <GlassPanel style={{ borderRadius: t.radius.control, paddingVertical: 10, paddingHorizontal: 12, gap: 6 }}>
      {(['trending', 'saved', 'friends'] as const).map((cat) => (
        <View key={cat} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: t.palette.pin[cat],
            }}
          />
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 11,
              color: t.palette.ink,
              textTransform: 'capitalize',
            }}
          >
            {cat}
          </Text>
        </View>
      ))}
    </GlassPanel>
  );
}

function SpotPreview({ spot }: { spot: Spot }) {
  const t = useTheme();
  return (
    <View style={{ padding: 20, gap: 14 }}>
      <Image
        source={{ uri: spot.photos[0] }}
        style={{ width: '100%', height: 160, borderRadius: t.radius.card }}
        resizeMode="cover"
      />
      <View style={{ gap: 4 }}>
        <Text style={[t.typography.title, { color: t.palette.ink }]}>{spot.name}</Text>
        <Text style={[t.typography.body, { color: t.palette.ink3 }]}>{spot.area}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <StatBox value={`${spot.height_m}m`} label="Height" />
        <StatBox value={`${spot.depth_m}m`} label="Depth" />
        <StatBox value={spot.waterType} label="Water" />
      </View>
      <Button label="View details" variant="primary" onPress={() => {}} />
    </View>
  );
}
