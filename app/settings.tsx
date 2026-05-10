import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListRow } from '@/components/ListRow';
import { Toggle } from '@/components/Toggle';
import { ACCENT_KEYS, ACCENTS, type AccentKey } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function SettingsScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.paper }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingTop: Math.max(insets.top, 12) + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
        >
          <ChevronLeft size={24} color={t.palette.ink} />
        </Pressable>
        <Text style={[t.typography.title, { color: t.palette.ink }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, gap: 24 }}>
        <Section title="Display">
          <ListRow
            title="Dark mode"
            subtitle={t.dark ? 'On' : 'Off'}
            trailing={
              <Toggle
                value={t.dark}
                onValueChange={t.setDark}
                accessibilityLabel="Dark mode"
              />
            }
          />
          <View style={{ gap: 8 }}>
            <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>accent</Text>
            <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
              {ACCENT_KEYS.map((key: AccentKey) => (
                <Pressable
                  key={key}
                  onPress={() => t.setAccent(key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Accent ${key}`}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: t.radius.pill,
                    backgroundColor: ACCENTS[key],
                    borderWidth: t.accentKey === key ? 3 : 1,
                    borderColor: t.palette.ink,
                  }}
                />
              ))}
            </View>
          </View>
        </Section>

        <Section title="Notifications">
          <ListRow title="Push notifications" trailing={<Toggle value onValueChange={() => {}} accessibilityLabel="Push" />} />
          <ListRow title="Friend activity" trailing={<Toggle value onValueChange={() => {}} accessibilityLabel="Friend activity" />} />
          <ListRow title="Weekly digest" trailing={<Toggle value={false} onValueChange={() => {}} accessibilityLabel="Weekly digest" />} />
        </Section>

        <Section title="Account">
          <ListRow title="Edit profile" onPress={() => {}} />
          <ListRow title="Privacy" onPress={() => {}} />
          <ListRow title="Help & feedback" onPress={() => {}} />
        </Section>

        <Text style={[t.typography.label, { color: t.palette.ink3, textAlign: 'center', marginTop: 16 }]}>
          CliffFinder · v0.1.0
        </Text>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.sm }}>
      <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>{title}</Text>
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}
