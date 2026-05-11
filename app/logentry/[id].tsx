import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Star, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  type TextStyle,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { MediaThumb } from '@/components/MediaThumb';
import { parseLocalDate } from '@/data/date';
import { useLogEntriesStore } from '@/data/logEntriesStore';
import { useSpotsStore } from '@/data/spotsStore';
import { safeBack } from '@/lib/safeBack';
import { formatMeters, formatTemp, useUnitsStore } from '@/lib/units';
import { useTheme } from '@/theme/useTheme';

const TINY: TextStyle = {
  fontFamily: 'Inter_400Regular',
  fontSize: 11,
  letterSpacing: 0.88,
  textTransform: 'uppercase',
};

export default function LogEntryDetailScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const entry = useLogEntriesStore((s) => s.entries.find((e) => e.id === params.id));
  const removeEntry = useLogEntriesStore((s) => s.removeEntry);
  const spots = useSpotsStore((s) => s.spots);
  const units = useUnitsStore((s) => s.units);
  const [deleting, setDeleting] = useState(false);

  if (!entry) {
    return (
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.palette.paper }}
      >
        <EmptyState title="Entry not found" message="That log entry no longer exists." />
      </View>
    );
  }

  const spot = spots.find((s) => s.id === entry.spotId);
  const dateLabel = parseLocalDate(entry.date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    const err = await removeEntry(entry.id);
    setDeleting(false);
    if (!err) safeBack(router, '/logbook');
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.paper }}>
      {/* TOP NAV */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 12) + 4,
          paddingHorizontal: 20,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={() => safeBack(router, '/logbook')}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={navBtn(t)}
        >
          <ChevronLeft size={20} color={t.palette.ink} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Poppins_600SemiBold',
              fontWeight: '600',
              fontSize: 15,
              color: t.palette.ink,
            }}
          >
            {spot?.name ?? 'Log entry'}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 11,
              color: t.palette.ink3,
              marginTop: 1,
            }}
          >
            {dateLabel}
          </Text>
        </View>
        <Pressable
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete log entry"
          style={navBtn(t)}
        >
          <Trash2 size={18} color={deleting ? t.palette.ink3 : t.palette.danger} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 14,
          paddingBottom: Math.max(insets.bottom, 16) + 24,
          gap: 18,
        }}
      >
        {/* SPOT LINK */}
        {spot ? (
          <Pressable
            onPress={() => router.push(`/spot/${spot.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${spot.name}`}
            style={{
              backgroundColor: t.palette.cardBg,
              borderWidth: 1,
              borderColor: t.palette.glassBorder,
              borderRadius: 14,
              padding: 10,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
            }}
          >
            {spot.photos[0] ? (
              <Image
                source={{ uri: spot.photos[0] }}
                style={{ width: 56, height: 56, borderRadius: 10 }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  backgroundColor: t.palette.line2,
                }}
              />
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontFamily: 'Poppins_600SemiBold',
                  fontWeight: '600',
                  fontSize: 14,
                  color: t.palette.ink,
                }}
                numberOfLines={1}
              >
                {spot.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <MapPin size={11} color={t.palette.ink3} strokeWidth={2.2} />
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12,
                    color: t.palette.ink3,
                  }}
                >
                  {spot.area || '—'}
                </Text>
              </View>
            </View>
          </Pressable>
        ) : null}

        {/* RATING */}
        <View>
          <Text style={[TINY, { color: t.palette.ink3, marginBottom: 8 }]}>Your rating</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 3, 4, 5].map((i) => {
              const filled = i <= entry.rating;
              return (
                <Star
                  key={i}
                  size={28}
                  color={filled ? t.palette.accent : t.palette.ink3}
                  fill={filled ? t.palette.accent : 'transparent'}
                  strokeWidth={1.6}
                />
              );
            })}
          </View>
        </View>

        {/* STATS */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatBlock label="Height jumped" value={formatMeters(entry.heightJumped_m, units)} />
          <StatBlock label="Water temp" value={formatTemp(entry.waterTemp_c, units)} />
        </View>

        {/* TRICKS */}
        {entry.tricks && entry.tricks.length > 0 ? (
          <View>
            <Text style={[TINY, { color: t.palette.ink3, marginBottom: 8 }]}>Tricks</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {entry.tricks.map((trick) => (
                <View
                  key={trick}
                  style={{
                    paddingVertical: 7,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    backgroundColor: `${t.palette.accent}1a`,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Inter_500Medium',
                      fontWeight: '500',
                      fontSize: 13,
                      color: t.palette.accent,
                    }}
                  >
                    {trick}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* NOTES */}
        {entry.notes ? (
          <View>
            <Text style={[TINY, { color: t.palette.ink3, marginBottom: 8 }]}>Notes</Text>
            <View
              style={{
                backgroundColor: t.palette.cardBg,
                borderWidth: 1,
                borderColor: t.palette.glassBorder,
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 16,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  lineHeight: 21,
                  color: t.palette.ink,
                }}
              >
                {entry.notes}
              </Text>
            </View>
          </View>
        ) : null}

        {/* MEDIA */}
        {entry.photos && entry.photos.length > 0 ? (
          <View>
            <Text style={[TINY, { color: t.palette.ink3, marginBottom: 8 }]}>Photos / videos</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {entry.photos.map((p, i) => (
                <MediaThumb key={i} uri={p} size={104} />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.palette.cardBg,
        borderWidth: 1,
        borderColor: t.palette.glassBorder,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 14,
      }}
    >
      <Text style={[TINY, { color: t.palette.ink3 }]}>{label}</Text>
      <Text
        style={{
          fontFamily: 'Poppins_700Bold',
          fontWeight: '700',
          fontSize: 18,
          letterSpacing: -0.18,
          color: t.palette.ink,
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function navBtn(t: ReturnType<typeof useTheme>) {
  return {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: t.palette.cardBg,
    borderWidth: 1,
    borderColor: t.palette.glassBorder,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
}
