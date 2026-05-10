import { useRouter } from 'expo-router';
import { SlidersHorizontal } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import {
  EMPTY_FILTERS,
  Filters,
  type FilterValues,
  isFilterActive,
  passesFilters,
} from '@/components/Filters';
import { GlassPanel } from '@/components/GlassPanel';
import { MapBackdrop } from '@/components/MapBackdrop';
import { SearchBar } from '@/components/SearchBar';
import { Sheet } from '@/components/Sheet';
import { StatBox } from '@/components/StatBox';
import { useLogEntriesStore } from '@/data/logEntriesStore';
import { useSavedSpotsStore } from '@/data/savedSpotsStore';
import { useSpotsStore } from '@/data/spotsStore';
import type { Spot, SpotCategory } from '@/data/types';
import { useTheme } from '@/theme/useTheme';

const FILTERS: ReadonlyArray<{ key: SpotCategory; label: string }> = [
  { key: 'trending', label: 'Trending' },
  { key: 'saved', label: 'Saved' },
  { key: 'friends', label: 'Friends' },
];

export default function MapScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilters, setActiveFilters] = useState<Set<SpotCategory>>(new Set());
  const [search, setSearch] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const savedList = useSavedSpotsStore((s) => s.saved);
  const logEntries = useLogEntriesStore((s) => s.entries);
  const allSpots = useSpotsStore((s) => s.spots);
  const savedIds = useMemo(() => new Set(savedList.map((x) => x.spotId)), [savedList]);
  const jumpedIds = useMemo(() => new Set(logEntries.map((e) => e.spotId)), [logEntries]);

  const visibleSpots = allSpots.filter((s) => {
    const inFilter = activeFilters.size === 0 || activeFilters.has(s.category);
    const inSearch =
      search.length === 0 || s.name.toLowerCase().includes(search.toLowerCase());
    return inFilter && inSearch && passesFilters(s, filterValues, savedIds, jumpedIds);
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
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <MapBackdrop spots={visibleSpots} onSpotPress={setSelectedSpot} />
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
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search spots" />
          </View>
          <Pressable
            onPress={() => setFiltersOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Open filters"
          >
            <GlassPanel
              variant="search"
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SlidersHorizontal size={20} color={t.palette.ink2} />
              {isFilterActive(filterValues) ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: t.palette.accent,
                  }}
                />
              ) : null}
            </GlassPanel>
          </Pressable>
        </View>
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
        {selectedSpot ? (
          <SpotPreview
            spot={selectedSpot}
            onViewDetails={() => {
              const id = selectedSpot.id;
              setSelectedSpot(null);
              router.push(`/spot/${id}`);
            }}
          />
        ) : null}
      </Sheet>

      <Filters
        visible={filtersOpen}
        initialValues={filterValues}
        previewCount={(values) =>
          allSpots.filter((s) => {
            const inFilter = activeFilters.size === 0 || activeFilters.has(s.category);
            const inSearch =
              search.length === 0 || s.name.toLowerCase().includes(search.toLowerCase());
            return inFilter && inSearch && passesFilters(s, values, savedIds, jumpedIds);
          }).length
        }
        onApply={setFilterValues}
        onClose={() => setFiltersOpen(false)}
      />
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

function SpotPreview({ spot, onViewDetails }: { spot: Spot; onViewDetails: () => void }) {
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
      <Button label="View details" variant="primary" onPress={onViewDetails} />
    </View>
  );
}
