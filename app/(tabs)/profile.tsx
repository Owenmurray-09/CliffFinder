import { useRouter } from 'expo-router';
import { Award, BookOpen, ChevronRight, LogOut, Settings } from 'lucide-react-native';
import { Image, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { ListRow } from '@/components/ListRow';
import { StatBox } from '@/components/StatBox';
import { useAuthStore } from '@/auth/store';
import { CURRENT_USER } from '@/data/user';
import { useTheme } from '@/theme/useTheme';

const COVER_URI =
  'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=1400&q=80';

export default function ProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.palette.paper }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={{ height: 180, position: 'relative' }}>
        <Image
          source={{ uri: COVER_URI }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>

      <View style={{ alignItems: 'center', marginTop: -48, gap: 4 }}>
        <Avatar name={CURRENT_USER.name} size={96} />
        <Text style={[t.typography.title, { color: t.palette.ink, marginTop: 8 }]}>
          {CURRENT_USER.name}
        </Text>
        <Text style={[t.typography.body, { color: t.palette.ink3 }]}>
          {CURRENT_USER.handle}
        </Text>
        {CURRENT_USER.bio ? (
          <Text
            style={[
              t.typography.body,
              { color: t.palette.ink2, textAlign: 'center', marginHorizontal: 32, marginTop: 6 },
            ]}
          >
            {CURRENT_USER.bio}
          </Text>
        ) : null}
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
        <StatBox value={String(CURRENT_USER.jumpsCount)} label="Jumps" />
        <StatBox value={String(CURRENT_USER.spotsAddedCount)} label="Spots" />
        <StatBox value={String(CURRENT_USER.followersCount)} label="Followers" />
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 24, alignItems: 'center' }}>
        <Button
          label="Edit profile"
          variant="outline"
          onPress={() => {
            // Profile edit lands in a follow-up.
          }}
        />
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 24, gap: 8 }}>
        <ListRow
          icon={<BookOpen size={18} color={t.palette.ink2} />}
          title="My jumps"
          subtitle={`${CURRENT_USER.jumpsCount} logged`}
          onPress={() => router.push('/logbook')}
        />
        <ListRow
          icon={<Award size={18} color={t.palette.ink2} />}
          title="Achievements"
          subtitle="Coming soon"
        />
        <ListRow
          icon={<Settings size={18} color={t.palette.ink2} />}
          title="Settings"
          onPress={() => router.push('/settings')}
        />
        <ListRow
          icon={<LogOut size={18} color={t.palette.danger} />}
          title="Sign out"
          trailing={<ChevronRight size={20} color={t.palette.ink3} />}
          onPress={() => {
            signOut();
            router.replace('/signin');
          }}
        />
      </View>

      {/* Spacer to keep Sign-out clear of the tab bar */}
      <View style={{ height: insets.bottom + 24 }} />
    </ScrollView>
  );
}
