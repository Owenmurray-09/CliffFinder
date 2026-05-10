import { useRouter } from 'expo-router';
import { BookOpen, Heart, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { SegmentedControl } from '@/components/SegmentedControl';
import { LOG_ENTRIES, SAVED_SPOT_IDS } from '@/data/logEntries';
import { getSpotById, SPOTS } from '@/data/spots';
import type { LogEntry, Spot } from '@/data/types';
import { useTheme } from '@/theme/useTheme';

type Tab = 'visited' | 'saved';

export default function LogbookScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('visited');

  const savedSpots = SPOTS.filter((s) => SAVED_SPOT_IDS.includes(s.id));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.palette.paper }}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 16) + 8,
        paddingHorizontal: 20,
        paddingBottom: 120,
        gap: 16,
      }}
    >
      <Text style={[t.typography.title, { color: t.palette.ink }]}>Logbook</Text>
      <View style={{ alignSelf: 'flex-start' }}>
        <SegmentedControl
          options={[
            { label: `Visited (${LOG_ENTRIES.length})`, value: 'visited' },
            { label: `Saved (${savedSpots.length})`, value: 'saved' },
          ]}
          value={tab}
          onValueChange={(v) => setTab(v as Tab)}
        />
      </View>

      {tab === 'visited' ? (
        LOG_ENTRIES.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <EmptyState
              icon={<BookOpen size={40} color={t.palette.ink3} strokeWidth={1.5} />}
              title="No jumps yet"
              message="Tap a spot on the map and log your first jump."
            />
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {LOG_ENTRIES.map((entry) => {
              const spot = getSpotById(entry.spotId);
              if (!spot) return null;
              return <VisitedRow key={entry.id} entry={entry} spot={spot} />;
            })}
          </View>
        )
      ) : null}

      {tab === 'saved' ? (
        savedSpots.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <EmptyState
              icon={<Heart size={40} color={t.palette.ink3} strokeWidth={1.5} />}
              title="No saved spots"
              message="Tap the heart on any spot to save it for later."
            />
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {savedSpots.map((spot) => (
              <SavedRow key={spot.id} spot={spot} />
            ))}
          </View>
        )
      ) : null}
    </ScrollView>
  );
}

function VisitedRow({ entry, spot }: { entry: LogEntry; spot: Spot }) {
  const t = useTheme();
  const router = useRouter();
  const dateLabel = new Date(entry.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return (
    <Pressable
      onPress={() => router.push(`/spot/${spot.id}`)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: t.palette.paper2,
        borderWidth: 1,
        borderColor: t.palette.line,
        borderRadius: t.radius.cardSm,
      }}
      accessibilityRole="button"
      accessibilityLabel={`${spot.name}, ${dateLabel}`}
    >
      <Image
        source={{ uri: spot.photos[0] }}
        style={{ width: 64, height: 64, borderRadius: 10 }}
        resizeMode="cover"
      />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[t.typography.cardTitle, { color: t.palette.ink }]}>{spot.name}</Text>
        <Text style={[t.typography.label, { color: t.palette.ink3 }]}>{spot.area}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <Text style={[t.typography.label, { color: t.palette.ink3 }]}>{dateLabel}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Star size={12} color={t.palette.star.readonly} fill={t.palette.star.readonly} />
            <Text style={[t.typography.label, { color: t.palette.ink2 }]}>{entry.rating}</Text>
          </View>
          <Text style={[t.typography.label, { color: t.palette.ink3 }]}>·</Text>
          <Text style={[t.typography.label, { color: t.palette.ink3 }]}>
            {entry.heightJumped_m}m
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function SavedRow({ spot }: { spot: Spot }) {
  const t = useTheme();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/spot/${spot.id}`)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: t.palette.paper2,
        borderWidth: 1,
        borderColor: t.palette.line,
        borderRadius: t.radius.cardSm,
      }}
      accessibilityRole="button"
      accessibilityLabel={spot.name}
    >
      <Image
        source={{ uri: spot.photos[0] }}
        style={{ width: 64, height: 64, borderRadius: 10 }}
        resizeMode="cover"
      />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[t.typography.cardTitle, { color: t.palette.ink }]}>{spot.name}</Text>
        <Text style={[t.typography.label, { color: t.palette.ink3 }]}>{spot.area}</Text>
        <Text style={[t.typography.label, { color: t.palette.ink3 }]}>
          {spot.height_m}m · {spot.waterType}
        </Text>
      </View>
    </Pressable>
  );
}
