import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronRight, Moon, Settings, Sun } from 'lucide-react-native';
import { Image, Pressable, ScrollView, Text, type TextStyle, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { useAuthStore } from '@/auth/store';
import { parseLocalDate } from '@/data/date';
import { useLogEntriesStore } from '@/data/logEntriesStore';
import { useProfileStore } from '@/data/profileStore';
import { useSpotsStore } from '@/data/spotsStore';
import { formatMeters, useUnitsStore } from '@/lib/units';
import { CURRENT_USER } from '@/data/user';
import { useTheme } from '@/theme/useTheme';

const COVER_URI =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=80';

const SECTION_LABEL: TextStyle = {
  fontFamily: 'Poppins_600SemiBold',
  fontWeight: '600',
  fontSize: 14,
  letterSpacing: 0.28,
  textTransform: 'uppercase',
};

const ACHIEVEMENTS: ReadonlyArray<{ emoji: string; label: string }> = [
  { emoji: '🏔', label: 'First jump' },
  { emoji: '🎯', label: '10 logged' },
  { emoji: '🌊', label: 'Deep dive' },
  { emoji: '🌎', label: 'Explorer' },
];

export default function ProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const allEntries = useLogEntriesStore((s) => s.entries);
  const recent = allEntries.slice(0, 2);
  const units = useUnitsStore((s) => s.units);
  const spots = useSpotsStore((s) => s.spots);
  const getSpotById = (id: string) => spots.find((s) => s.id === id);
  const avatarUrl = useProfileStore((s) => s.avatarUrl);
  const coverUrl = useProfileStore((s) => s.coverUrl);
  const displayName = useProfileStore((s) => s.displayName);
  const handle = useProfileStore((s) => s.handle);
  const session = useAuthStore((s) => s.session);
  const emailLocalPart = session?.user.email?.split('@')[0] ?? '';
  const renderedName = displayName ?? emailLocalPart ?? CURRENT_USER.name;
  const renderedHandle = handle ? `@${handle}` : emailLocalPart ? `@${emailLocalPart}` : CURRENT_USER.handle;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.palette.paper }}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* COVER */}
      <Pressable
        onPress={() => router.push('/settings')}
        accessibilityRole="button"
        accessibilityLabel="Edit cover photo"
        style={{ height: 200, position: 'relative', overflow: 'hidden' }}
      >
        <Image source={{ uri: coverUrl ?? COVER_URI }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0.05)', t.palette.paper]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          pointerEvents="none"
        />
        <View
          style={{
            position: 'absolute',
            top: Math.max(insets.top, 12) + 4,
            right: 20,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <CoverButton onPress={t.toggleDark} accessibilityLabel="Toggle theme">
            {t.dark ? (
              <Sun size={16} color="#FFFFFF" />
            ) : (
              <Moon size={16} color="#FFFFFF" />
            )}
          </CoverButton>
          <CoverButton onPress={() => router.push('/settings')} accessibilityLabel="Open settings">
            <Settings size={16} color="#FFFFFF" />
          </CoverButton>
        </View>
      </Pressable>

      {/* AVATAR + IDENTITY */}
      <View style={{ paddingHorizontal: 22 }}>
        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Edit profile picture"
          style={{ marginTop: -50, alignSelf: 'flex-start' }}
        >
          <Avatar
            name={renderedName}
            uri={avatarUrl ?? undefined}
            size={96}
            style={{ borderWidth: 4, borderColor: t.palette.paper }}
          />
        </Pressable>
        <View style={{ marginTop: 12, gap: 2 }}>
          <Text
            style={{
              fontFamily: 'Poppins_700Bold',
              fontWeight: '700',
              fontSize: 22,
              letterSpacing: -0.22,
              color: t.palette.ink,
            }}
          >
            {renderedName}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: t.palette.ink3,
            }}
          >
            {renderedHandle}
            {CURRENT_USER.role ? ` · ${CURRENT_USER.role}` : ''}
          </Text>
        </View>
      </View>

      {/* STATS ROW */}
      <View style={{ paddingHorizontal: 22, paddingTop: 18, flexDirection: 'row', gap: 10 }}>
        <StatBox value={String(CURRENT_USER.jumpsCount)} label="Total jumps" />
        <StatBox value={`${CURRENT_USER.airTime_s}s`} label="Air time" />
        <StatBox value={formatMeters(CURRENT_USER.fallen_m, units)} label="Fallen" />
      </View>

      {/* ACHIEVEMENTS */}
      <View style={{ paddingHorizontal: 22, paddingTop: 22 }}>
        <Text style={[SECTION_LABEL, { color: t.palette.ink3, marginBottom: 10 }]}>
          Achievements
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {ACHIEVEMENTS.map((a) => (
            <View
              key={a.label}
              style={{
                flex: 1,
                aspectRatio: 1,
                backgroundColor: t.palette.cardBg,
                borderWidth: 1,
                borderColor: t.palette.glassBorder,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 26 }}>{a.emoji}</Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 9.5,
                  color: t.palette.ink3,
                  textAlign: 'center',
                  lineHeight: 11,
                  paddingHorizontal: 4,
                }}
              >
                {a.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* RECENT */}
      <View style={{ paddingHorizontal: 22, paddingTop: 22 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <Text style={[SECTION_LABEL, { color: t.palette.ink3 }]}>Recent</Text>
          <Pressable onPress={() => router.push('/logbook')} accessibilityRole="link" hitSlop={6}>
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
          </Pressable>
        </View>
        <View style={{ gap: 8 }}>
          {recent.map((entry) => {
            const spot = getSpotById(entry.spotId);
            if (!spot) return null;
            const date = parseLocalDate(entry.date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });
            return (
              <Pressable
                key={entry.id}
                onPress={() => router.push(`/spot/${spot.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`${spot.name}, ${date}`}
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
                    {date} · ★{spot.rating.toFixed(1)}
                  </Text>
                </View>
                <ChevronRight size={18} color={t.palette.ink3} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

function CoverButton({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.32)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </Pressable>
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
