import { useRouter } from 'expo-router';
import { MapPin, Search, Star } from 'lucide-react-native';
import { Image, Pressable, ScrollView, Text, type TextStyle, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { getFriendById, RADAR_FEED } from '@/data/friends';
import { getSpotById, SPOTS } from '@/data/spots';
import type { RadarItem, Spot } from '@/data/types';
import { distanceKm, formatDistance, HOME_POINT } from '@/map/projection';
import { useTheme } from '@/theme/useTheme';

const SECTION_LABEL: TextStyle = {
  fontFamily: 'Poppins_600SemiBold',
  fontWeight: '600',
  fontSize: 14,
  letterSpacing: 0.28,
  textTransform: 'uppercase',
};

export default function RadarScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const trending = SPOTS.filter((s) => s.category === 'trending').slice(0, 2);
  const near = [...SPOTS]
    .map((s) => ({ s, km: distanceKm(HOME_POINT, s) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 3);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.palette.paper }}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 16),
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View
        style={{
          paddingHorizontal: 22,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: 'Poppins_700Bold',
              fontWeight: '700',
              fontSize: 28,
              letterSpacing: -0.56,
              color: t.palette.ink,
            }}
          >
            Radar
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: t.palette.ink3,
              marginTop: 2,
            }}
          >
            Trending around the world
          </Text>
        </View>
        <Pressable
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Search"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
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

      <View style={{ paddingTop: 18, gap: 22 }}>
        {/* TRENDING NOW */}
        <View>
          <View
            style={{
              paddingHorizontal: 22,
              paddingBottom: 10,
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
            }}
          >
            <Text style={[SECTION_LABEL, { color: t.palette.ink3 }]}>Trending now</Text>
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontWeight: '500',
                fontSize: 12,
                color: t.palette.accent,
              }}
            >
              See all
            </Text>
          </View>
          <View style={{ paddingHorizontal: 22, flexDirection: 'row', gap: 12 }}>
            {trending.map((s) => (
              <TrendingCard key={s.id} spot={s} />
            ))}
          </View>
        </View>

        {/* NEAR YOU */}
        <View>
          <View style={{ paddingHorizontal: 22, paddingBottom: 10 }}>
            <Text style={[SECTION_LABEL, { color: t.palette.ink3 }]}>Near you</Text>
          </View>
          <View style={{ paddingHorizontal: 22, gap: 8 }}>
            {near.map(({ s, km }) => (
              <NearRow key={s.id} spot={s} dist={formatDistance(km)} />
            ))}
          </View>
        </View>

        {/* ACTIVITY */}
        <View>
          <View style={{ paddingHorizontal: 22, paddingBottom: 10 }}>
            <Text style={[SECTION_LABEL, { color: t.palette.ink3 }]}>Activity</Text>
          </View>
          <View style={{ paddingHorizontal: 22 }}>
            {RADAR_FEED.map((item, i) => (
              <ActivityRow key={item.id} item={item} last={i === RADAR_FEED.length - 1} />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function TrendingCard({ spot }: { spot: Spot }) {
  const t = useTheme();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/spot/${spot.id}`)}
      accessibilityRole="button"
      accessibilityLabel={spot.name}
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: t.palette.cardBg,
        borderWidth: 1,
        borderColor: t.palette.glassBorder,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <View style={{ height: 96, position: 'relative' }}>
        <Image source={{ uri: spot.photos[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <View
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            paddingVertical: 3,
            paddingHorizontal: 8,
            borderRadius: 6,
            backgroundColor: 'rgba(0,0,0,0.45)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Star size={10} color="#FFFFFF" fill="#FFFFFF" />
          <Text
            style={{
              fontFamily: 'Montserrat_600SemiBold',
              fontWeight: '600',
              fontSize: 10,
              color: '#FFFFFF',
            }}
          >
            {spot.rating.toFixed(1)}
          </Text>
        </View>
      </View>
      <View style={{ paddingVertical: 10, paddingHorizontal: 12 }}>
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
          {spot.area} · {spot.reviewCount} jumps
        </Text>
      </View>
    </Pressable>
  );
}

function NearRow({ spot, dist }: { spot: Spot; dist: string }) {
  const t = useTheme();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/spot/${spot.id}`)}
      accessibilityRole="button"
      accessibilityLabel={spot.name}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: t.palette.cardBg,
        borderWidth: 1,
        borderColor: t.palette.glassBorder,
        borderRadius: 14,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: `${t.palette.accent}1a`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MapPin size={18} color={t.palette.accent} fill={`${t.palette.accent}33`} />
      </View>
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
          {spot.height_m} m · {dist}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        <Star size={11} color={t.palette.star.readonly} fill={t.palette.star.readonly} />
        <Text
          style={{
            fontFamily: 'Montserrat_600SemiBold',
            fontWeight: '600',
            fontSize: 13,
            color: t.palette.accent,
          }}
        >
          {spot.rating.toFixed(1)}
        </Text>
      </View>
    </Pressable>
  );
}

function ActivityRow({ item, last }: { item: RadarItem; last: boolean }) {
  const t = useTheme();
  const router = useRouter();
  const friend = getFriendById(item.friendId);
  if (!friend) return null;

  let what: string;
  let where: string | null;
  let onPress: (() => void) | undefined;

  if (item.kind === 'jump') {
    const spot = getSpotById(item.spotId);
    what = 'jumped from';
    where = spot?.name ?? 'a spot';
    onPress = spot ? () => router.push(`/spot/${spot.id}`) : undefined;
  } else if (item.kind === 'spot_added') {
    const spot = getSpotById(item.spotId);
    what = 'added a spot';
    where = spot?.name ?? null;
    onPress = spot ? () => router.push(`/spot/${spot.id}`) : undefined;
  } else {
    what = 'is now following you';
    where = null;
    onPress = () => router.push(`/friend/${friend.id}`);
  }

  const inner = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.palette.line2,
      }}
    >
      <Avatar name={friend.name} size={34} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            lineHeight: 18.2,
            color: t.palette.ink,
          }}
        >
          <Text style={{ fontWeight: '600' }}>{friend.name}</Text>
          <Text style={{ color: t.palette.ink3 }}> {what} </Text>
          {where ? <Text style={{ fontWeight: '500' }}>{where}</Text> : null}
        </Text>
      </View>
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: t.palette.ink3 }}>
        {relativeTime(item.when)}
      </Text>
    </View>
  );

  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${friend.name} ${what} ${where ?? ''}`}>
      {inner}
    </Pressable>
  ) : (
    inner
  );
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const min = Math.floor((now - then) / 60000);
  if (min < 1) return 'now';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
