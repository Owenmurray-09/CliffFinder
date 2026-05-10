import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, type TextStyle, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { getFriendById } from '@/data/friends';
import { useSpotsStore } from '@/data/spotsStore';
import { useTheme } from '@/theme/useTheme';

const COVER_URI =
  'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=1400&q=80';

const SECTION_LABEL: TextStyle = {
  fontFamily: 'Poppins_600SemiBold',
  fontWeight: '600',
  fontSize: 14,
  letterSpacing: 0.28,
  textTransform: 'uppercase',
};

// Mock counts for the 5 friends. Real backend data would come from server.
const MOCK: Record<
  string,
  { jumps: number; airTime_s: number; fallen_m: number; recentSpotIds: string[]; achievements: string[] }
> = {
  maya: {
    jumps: 132,
    airTime_s: 11.4,
    fallen_m: 612,
    recentSpotIds: ['eagle', 'mossy'],
    achievements: ['🏔', '🌊', '💯', '🌎'],
  },
  jordan: {
    jumps: 78,
    airTime_s: 6.2,
    fallen_m: 380,
    recentSpotIds: ['hidden', 'vista'],
    achievements: ['🏔', '🎯', '🌊', '🏆'],
  },
  sasha: {
    jumps: 213,
    airTime_s: 18.7,
    fallen_m: 1024,
    recentSpotIds: ['mossy', 'eagle'],
    achievements: ['🏔', '🎯', '🌊', '🌎'],
  },
  noor: {
    jumps: 41,
    airTime_s: 3.8,
    fallen_m: 192,
    recentSpotIds: ['riverside', 'vista'],
    achievements: ['🏔', '🎯'],
  },
  leo: {
    jumps: 95,
    airTime_s: 8.1,
    fallen_m: 480,
    recentSpotIds: ['vista', 'eagle'],
    achievements: ['🏔', '🎯', '🌊'],
  },
};

export default function FriendProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const friend = getFriendById(params.id);
  const allSpots = useSpotsStore((s) => s.spots);
  const getSpotById = (id: string) => allSpots.find((s) => s.id === id);
  const [following, setFollowing] = useState(true);

  if (!friend) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.palette.paper }}>
        <EmptyState title="User not found" message="That profile doesn't exist." />
      </View>
    );
  }

  const stats = MOCK[friend.id] ?? {
    jumps: 0,
    airTime_s: 0,
    fallen_m: 0,
    recentSpotIds: [],
    achievements: [],
  };
  const recentSpots = stats.recentSpotIds
    .map((id) => getSpotById(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const ach = stats.achievements.length
    ? stats.achievements
    : allSpots.length > 0
      ? ['🏔', '🎯', '🌊', '🌎']
      : [];

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        {/* COVER */}
        <View style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
          <Image source={{ uri: COVER_URI }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.05)', t.palette.paper]}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            pointerEvents="none"
          />
        </View>

        {/* AVATAR + IDENTITY */}
        <View style={{ paddingHorizontal: 22 }}>
          <View style={{ marginTop: -50 }}>
            <Avatar
              name={friend.name}
              size={96}
              style={{ borderWidth: 4, borderColor: t.palette.paper }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginTop: 12,
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{
                  fontFamily: 'Poppins_700Bold',
                  fontWeight: '700',
                  fontSize: 22,
                  letterSpacing: -0.22,
                  color: t.palette.ink,
                }}
              >
                {friend.name}
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                  color: t.palette.ink3,
                }}
              >
                {friend.handle}
              </Text>
            </View>
            <Button
              label={following ? 'Following' : 'Follow'}
              variant={following ? 'outline' : 'primary'}
              onPress={() => setFollowing((f) => !f)}
              style={{ paddingVertical: 10, paddingHorizontal: 18 }}
              textStyle={{
                fontFamily: 'Poppins_600SemiBold',
                fontWeight: '600',
                fontSize: 13,
              }}
            />
          </View>
        </View>

        {/* STATS */}
        <View style={{ paddingHorizontal: 22, paddingTop: 18, flexDirection: 'row', gap: 10 }}>
          <StatBox value={String(stats.jumps)} label="Total jumps" />
          <StatBox value={`${stats.airTime_s}s`} label="Air time" />
          <StatBox value={`${stats.fallen_m}m`} label="Fallen" />
        </View>

        {/* ACHIEVEMENTS */}
        {ach.length > 0 ? (
          <View style={{ paddingHorizontal: 22, paddingTop: 22 }}>
            <Text style={[SECTION_LABEL, { color: t.palette.ink3, marginBottom: 10 }]}>
              Achievements
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {ach.slice(0, 4).map((emoji, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    backgroundColor: t.palette.cardBg,
                    borderWidth: 1,
                    borderColor: t.palette.glassBorder,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 26 }}>{emoji}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* RECENT */}
        <View style={{ paddingHorizontal: 22, paddingTop: 22 }}>
          <Text style={[SECTION_LABEL, { color: t.palette.ink3, marginBottom: 10 }]}>
            Recent jumps
          </Text>
          {recentSpots.length === 0 ? (
            <EmptyState message={`${friend.name.split(' ')[0]}'s recent jumps will appear here.`} />
          ) : (
            <View style={{ gap: 8 }}>
              {recentSpots.map((spot) => (
                <Pressable
                  key={spot.id}
                  onPress={() => router.push(`/spot/${spot.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={spot.name}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 8,
                    paddingLeft: 8,
                    paddingRight: 12,
                    backgroundColor: t.palette.cardBg,
                    borderWidth: 1,
                    borderColor: t.palette.glassBorder,
                    borderRadius: 14,
                  }}
                >
                  <Image
                    source={{ uri: spot.photos[0] }}
                    style={{ width: 48, height: 48, borderRadius: 10 }}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: 'Poppins_600SemiBold',
                        fontWeight: '600',
                        fontSize: 14,
                        color: t.palette.ink,
                      }}
                    >
                      {spot.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        color: t.palette.ink3,
                        marginTop: 1,
                      }}
                    >
                      ★{spot.rating.toFixed(1)} · {spot.area}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={t.palette.ink3} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>

      {/* FLOATING BACK BUTTON */}
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', top: Math.max(insets.top, 12), left: 12 }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.92)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <ChevronLeft size={22} color={t.palette.ink} />
        </Pressable>
      </View>
    </View>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 10,
        backgroundColor: t.palette.cardBg,
        borderWidth: 1,
        borderColor: t.palette.glassBorder,
        borderRadius: 14,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: 'Poppins_700Bold',
          fontWeight: '700',
          fontSize: 22,
          letterSpacing: -0.22,
          color: t.palette.ink,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 11,
          color: t.palette.ink3,
          marginTop: 3,
          letterSpacing: 0.22,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
