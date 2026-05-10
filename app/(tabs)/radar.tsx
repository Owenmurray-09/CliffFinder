import { useRouter } from 'expo-router';
import { Radar as RadarIcon, Star } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { getFriendById, RADAR_FEED } from '@/data/friends';
import { getSpotById } from '@/data/spots';
import type { RadarItem } from '@/data/types';
import { useTheme } from '@/theme/useTheme';

export default function RadarScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();

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
      <Text style={[t.typography.title, { color: t.palette.ink }]}>Radar</Text>
      <Text style={[t.typography.body, { color: t.palette.ink3 }]}>
        Recent activity from people you follow.
      </Text>

      {RADAR_FEED.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 48 }}>
          <EmptyState
            icon={<RadarIcon size={40} color={t.palette.ink3} strokeWidth={1.5} />}
            title="No activity yet"
            message="Follow some friends and their jumps will appear here."
          />
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {RADAR_FEED.map((item) => (
            <RadarRow key={item.id} item={item} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function RadarRow({ item }: { item: RadarItem }) {
  const t = useTheme();
  const router = useRouter();
  const friend = getFriendById(item.friendId);
  if (!friend) return null;

  const when = relativeTime(item.when);

  let body: React.ReactNode;
  let onPress: (() => void) | undefined;

  if (item.kind === 'jump') {
    const spot = getSpotById(item.spotId);
    onPress = spot ? () => router.push(`/spot/${spot.id}`) : undefined;
    body = (
      <View style={{ gap: 4, flex: 1 }}>
        <Text style={[t.typography.body, { color: t.palette.ink }]}>
          <Text style={{ fontWeight: '600' }}>{friend.name}</Text>
          {' jumped at '}
          <Text style={{ fontWeight: '600' }}>{spot?.name ?? 'a spot'}</Text>
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Star size={12} color={t.palette.star.readonly} fill={t.palette.star.readonly} />
          <Text style={[t.typography.label, { color: t.palette.ink3 }]}>
            {item.rating} · {when}
          </Text>
        </View>
      </View>
    );
  } else if (item.kind === 'spot_added') {
    const spot = getSpotById(item.spotId);
    onPress = spot ? () => router.push(`/spot/${spot.id}`) : undefined;
    body = (
      <View style={{ gap: 4, flex: 1 }}>
        <Text style={[t.typography.body, { color: t.palette.ink }]}>
          <Text style={{ fontWeight: '600' }}>{friend.name}</Text>
          {' added '}
          <Text style={{ fontWeight: '600' }}>{spot?.name ?? 'a new spot'}</Text>
        </Text>
        <Text style={[t.typography.label, { color: t.palette.ink3 }]}>{when}</Text>
      </View>
    );
  } else {
    body = (
      <View style={{ gap: 4, flex: 1 }}>
        <Text style={[t.typography.body, { color: t.palette.ink }]}>
          <Text style={{ fontWeight: '600' }}>{friend.name}</Text>
          {' is now following you'}
        </Text>
        <Text style={[t.typography.label, { color: t.palette.ink3 }]}>{when}</Text>
      </View>
    );
  }

  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    padding: 12,
    backgroundColor: t.palette.paper2,
    borderWidth: 1,
    borderColor: t.palette.line,
    borderRadius: t.radius.cardSm,
  };
  const inner = (
    <>
      <Avatar name={friend.name} size={48} />
      {body}
    </>
  );
  return onPress ? (
    <Pressable onPress={onPress} style={rowStyle} accessibilityRole="button">
      {inner}
    </Pressable>
  ) : (
    <View style={rowStyle}>{inner}</View>
  );
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
