import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { StatBox } from '@/components/StatBox';
import { getFriendById } from '@/data/friends';
import { useTheme } from '@/theme/useTheme';

const COVER_URI =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=80';

// Mock counts — real data lands when friend stats are wired to a store.
const MOCK_COUNTS: Record<string, { jumps: number; spots: number; followers: number }> = {
  maya: { jumps: 132, spots: 8, followers: 412 },
  jordan: { jumps: 78, spots: 14, followers: 256 },
  sasha: { jumps: 213, spots: 4, followers: 891 },
  noor: { jumps: 41, spots: 1, followers: 67 },
  leo: { jumps: 95, spots: 6, followers: 174 },
};

export default function FriendProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const friend = getFriendById(params.id);
  const [following, setFollowing] = useState(true);

  if (!friend) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.palette.paper }}>
        <EmptyState title="User not found" message="That profile doesn't exist." />
      </View>
    );
  }

  const counts = MOCK_COUNTS[friend.id] ?? { jumps: 0, spots: 0, followers: 0 };

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={{ height: 180 }}>
          <Image source={{ uri: COVER_URI }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        </View>
        <View style={{ alignItems: 'center', marginTop: -48, gap: 4 }}>
          <Avatar name={friend.name} size={96} />
          <Text style={[t.typography.title, { color: t.palette.ink, marginTop: 8 }]}>{friend.name}</Text>
          <Text style={[t.typography.body, { color: t.palette.ink3 }]}>{friend.handle}</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            justifyContent: 'center',
            marginTop: 16,
            paddingHorizontal: 20,
          }}
        >
          <StatBox value={String(counts.jumps)} label="Jumps" />
          <StatBox value={String(counts.spots)} label="Spots" />
          <StatBox value={String(counts.followers)} label="Followers" />
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 24, alignItems: 'center' }}>
          <Button
            label={following ? 'Following' : 'Follow'}
            variant={following ? 'outline' : 'primary'}
            onPress={() => setFollowing((f) => !f)}
          />
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <EmptyState
            title={`${friend.name.split(' ')[0]}'s recent jumps`}
            message="Friend activity feed lands in a follow-up loop."
          />
        </View>

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: Math.max(insets.top, 12),
          left: 12,
        }}
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
