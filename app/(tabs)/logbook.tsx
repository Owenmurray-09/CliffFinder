import { useRouter } from 'expo-router';
import {
  BookOpen,
  Heart,
  MapPin,
  Search,
  Star,
} from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, type TextStyle, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { parseLocalDate } from '@/data/date';
import { useLogEntriesStore } from '@/data/logEntriesStore';
import { useSavedSpotsStore } from '@/data/savedSpotsStore';
import { useSpotsStore } from '@/data/spotsStore';
import { useUnitsStore } from '@/lib/units';
import type { LogEntry, SavedSpot, Spot } from '@/data/types';
import { useTheme } from '@/theme/useTheme';

type Tab = 'visited' | 'saved';

const TINY_LABEL: TextStyle = {
  fontFamily: 'Montserrat_700Bold',
  fontWeight: '700',
  fontSize: 9.5,
  letterSpacing: 0.475,
  textTransform: 'uppercase',
};

export default function LogbookScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('visited');
  const savedSpots = useSavedSpotsStore((s) => s.saved);
  const logEntries = useLogEntriesStore((s) => s.entries);
  const spots = useSpotsStore((s) => s.spots);
  const getSpotById = (id: string) => spots.find((s) => s.id === id);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.palette.paper }}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 16),
        paddingBottom: 120,
      }}
    >
      {/* HEADER ROW: title + search */}
      <View
        style={{
          paddingTop: 4,
          paddingHorizontal: 22,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={{
            fontFamily: 'Poppins_700Bold',
            fontWeight: '700',
            fontSize: 32,
            lineHeight: 32,
            letterSpacing: -0.32,
            color: t.palette.ink,
          }}
        >
          My Logbook
        </Text>
        <Pressable
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Search logbook"
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: t.palette.cardBg,
            borderWidth: 1,
            borderColor: t.palette.glassBorder,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Search size={17} color={t.palette.ink} strokeWidth={2.2} />
        </Pressable>
      </View>

      {/* SEGMENTED — Visited / Saved with count badges */}
      <View style={{ paddingHorizontal: 22, paddingTop: 16 }}>
        <SegmentedTabs
          tab={tab}
          onChange={setTab}
          counts={{ visited: logEntries.length, saved: savedSpots.length }}
        />
      </View>

      {/* CARD LIST */}
      <View style={{ paddingHorizontal: 22, paddingTop: 14, gap: 10 }}>
        {tab === 'visited' ? (
          logEntries.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={40} color={t.palette.ink3} strokeWidth={1.5} />}
              title="No jumps yet"
              message="Tap a spot on the map and log your first jump."
            />
          ) : (
            logEntries.map((entry) => {
              const spot = getSpotById(entry.spotId);
              if (!spot) return null;
              return <VisitedCard key={entry.id} entry={entry} spot={spot} />;
            })
          )
        ) : null}

        {tab === 'saved' ? (
          savedSpots.length === 0 ? (
            <EmptyState
              icon={<Heart size={40} color={t.palette.ink3} strokeWidth={1.5} />}
              title="No saved spots"
              message="Tap the heart on any spot to save it for later."
            />
          ) : (
            savedSpots.map((s) => {
              const spot = getSpotById(s.spotId);
              if (!spot) return null;
              return <SavedCard key={s.spotId} saved={s} spot={spot} />;
            })
          )
        ) : null}
      </View>
    </ScrollView>
  );
}

function SegmentedTabs({
  tab,
  onChange,
  counts,
}: {
  tab: Tab;
  onChange: (next: Tab) => void;
  counts: Record<Tab, number>;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: t.dark
          ? 'rgba(234,226,200,0.06)'
          : 'rgba(30,47,35,0.05)',
        borderWidth: 1,
        borderColor: t.palette.glassBorder,
        borderRadius: 14,
        padding: 3,
      }}
    >
      {(['visited', 'saved'] as const).map((key) => {
        const on = key === tab;
        const label = key === 'visited' ? 'Visited' : 'Saved';
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 11,
              backgroundColor: on ? t.palette.accent : 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              ...(on
                ? {
                    shadowColor: t.palette.accent,
                    shadowOpacity: 0.34,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 3,
                  }
                : null),
            }}
          >
            <Text
              style={{
                fontFamily: 'Poppins_600SemiBold',
                fontWeight: '600',
                fontSize: 13.5,
                letterSpacing: -0.07,
                color: on ? t.palette.on.accent : t.palette.ink,
              }}
            >
              {label}
            </Text>
            <View
              style={{
                paddingVertical: 1,
                paddingHorizontal: 7,
                borderRadius: 99,
                backgroundColor: on
                  ? 'rgba(255,255,255,0.22)'
                  : t.dark
                    ? 'rgba(234,226,200,0.08)'
                    : 'rgba(30,47,35,0.08)',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Montserrat_600SemiBold',
                  fontWeight: '600',
                  fontSize: 11,
                  color: on ? t.palette.on.accent : t.palette.ink3,
                }}
              >
                {counts[key]}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function VisitedCard({ entry, spot }: { entry: LogEntry; spot: Spot }) {
  const t = useTheme();
  const router = useRouter();
  const units = useUnitsStore((s) => s.units);
  const dateLabel = parseLocalDate(entry.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const trickCount = entry.tricks?.length ?? 0;
  const heightDisplay =
    units === 'imperial'
      ? `${Math.round(entry.heightJumped_m * 3.28084)}FT`
      : `${entry.heightJumped_m}M`;

  return (
    <Pressable
      onPress={() => router.push(`/logentry/${entry.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${spot.name}, ${dateLabel}`}
      style={{
        backgroundColor: t.palette.cardBg,
        borderWidth: 1,
        borderColor: t.palette.glassBorder,
        borderRadius: 18,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 12,
        shadowColor: '#1E2F23',
        shadowOpacity: t.dark ? 0 : 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: t.dark ? 0 : 1,
      }}
    >
      <Image
        source={{ uri: spot.photos[0] }}
        style={{ width: 84, height: 84, borderRadius: 12 }}
        resizeMode="cover"
      />
      <View
        style={{
          flex: 1,
          minWidth: 0,
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingVertical: 2,
        }}
      >
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Poppins_700Bold',
                fontWeight: '700',
                fontSize: 16,
                letterSpacing: -0.16,
                color: t.palette.ink,
                flex: 1,
              }}
            >
              {spot.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Star size={11} color={t.palette.star.readonly} fill={t.palette.star.readonly} />
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontWeight: '700', fontSize: 12, color: t.palette.ink }}>
                {spot.rating.toFixed(1)}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <MapPin size={11} color={t.palette.ink3} strokeWidth={2.2} />
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: t.palette.ink3,
              }}
            >
              {spot.area}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
            marginTop: 6,
          }}
        >
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11.5, color: t.palette.ink3 }}>
            {dateLabel}
          </Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <Pill
              text={heightDisplay}
              bg={`${t.palette.accent}1f`}
              fg={t.palette.accent}
            />
            {trickCount > 0 ? (
              <Pill
                text={`${trickCount} ${trickCount === 1 ? 'TRICK' : 'TRICKS'}`}
                bg={t.dark ? 'rgba(234,226,200,0.08)' : 'rgba(30,47,35,0.06)'}
                fg={t.palette.ink3}
              />
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function SavedCard({ saved, spot }: { saved: SavedSpot; spot: Spot }) {
  const t = useTheme();
  const router = useRouter();
  const units = useUnitsStore((s) => s.units);
  const heightDisplay =
    units === 'imperial'
      ? `${Math.round(spot.height_m * 3.28084)}FT`
      : `${spot.height_m}M`;
  const savedLabel = `Saved ${parseLocalDate(saved.savedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`;
  return (
    <Pressable
      onPress={() => router.push(`/spot/${spot.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${spot.name}, ${savedLabel}`}
      style={{
        backgroundColor: t.palette.cardBg,
        borderWidth: 1,
        borderColor: t.palette.glassBorder,
        borderRadius: 18,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 12,
        shadowColor: '#1E2F23',
        shadowOpacity: t.dark ? 0 : 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: t.dark ? 0 : 1,
      }}
    >
      <Image
        source={{ uri: spot.photos[0] }}
        style={{ width: 84, height: 84, borderRadius: 12 }}
        resizeMode="cover"
      />
      <View style={{ flex: 1, minWidth: 0, flexDirection: 'column', justifyContent: 'space-between', paddingVertical: 2 }}>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Poppins_700Bold',
                fontWeight: '700',
                fontSize: 16,
                letterSpacing: -0.16,
                color: t.palette.ink,
                flex: 1,
              }}
            >
              {spot.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Star size={11} color={t.palette.star.readonly} fill={t.palette.star.readonly} />
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontWeight: '700', fontSize: 12, color: t.palette.ink }}>
                {spot.rating.toFixed(1)}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <MapPin size={11} color={t.palette.ink3} strokeWidth={2.2} />
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: t.palette.ink3 }}>
              {spot.area}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 6 }}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11.5, color: t.palette.ink3 }}>
            {savedLabel}
          </Text>
          <Pill
            text={heightDisplay}
            bg={`${t.palette.accent}1f`}
            fg={t.palette.accent}
          />
        </View>
      </View>
    </Pressable>
  );
}

function Pill({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 99,
        paddingVertical: 2,
        paddingHorizontal: 7,
      }}
    >
      <Text style={[TINY_LABEL, { color: fg }]}>{text}</Text>
    </View>
  );
}
