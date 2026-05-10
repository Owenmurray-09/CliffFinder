import { useRouter } from 'expo-router';
import { Bell, ChevronLeft, ChevronRight, Moon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, type TextStyle, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { Toggle } from '@/components/Toggle';
import { useAuthStore } from '@/auth/store';
import { CURRENT_USER } from '@/data/user';
import { ACCENT_KEYS, ACCENTS, type AccentKey } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const SECTION_LABEL: TextStyle = {
  fontFamily: 'Inter_400Regular',
  fontSize: 11,
  letterSpacing: 0.88,
  textTransform: 'uppercase',
};

type Units = 'metric' | 'imperial';

export default function SettingsScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signOut = useAuthStore((s) => s.signOut);

  const [pushOn, setPushOn] = useState(true);
  const [units, setUnits] = useState<Units>('metric');

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.paper }}>
      {/* nav */}
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
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: t.palette.cardBg,
            borderWidth: 1,
            borderColor: t.palette.glassBorder,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={20} color={t.palette.ink} />
        </Pressable>
        <Text
          style={{
            fontFamily: 'Poppins_600SemiBold',
            fontWeight: '600',
            fontSize: 16,
            color: t.palette.ink,
          }}
        >
          Settings
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: 48 }}>
        {/* ACCOUNT */}
        <Section label="Account">
          <Row
            left={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar name={CURRENT_USER.name} size={42} />
                <View>
                  <Text style={[bodyMedium(t)]}>Profile picture</Text>
                  <Text style={[subBody(t), { marginTop: 1 }]}>Tap to change</Text>
                </View>
              </View>
            }
            right={<ChevronRight size={18} color={t.palette.ink3} />}
            onPress={() => {}}
          />
          <FieldRow label="Username" value={CURRENT_USER.handle} />
          <FieldRow label="Display name" value={CURRENT_USER.name} />
          <FieldRow label="Email" value={CURRENT_USER.email} />
          <Row
            left={<Text style={bodyMedium(t)}>Change password</Text>}
            right={<ChevronRight size={18} color={t.palette.ink3} />}
            last
            onPress={() => {}}
          />
        </Section>

        {/* PREFERENCES */}
        <Section label="Preferences">
          <Row
            left={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Moon size={18} color={t.palette.ink3} strokeWidth={2.2} />
                <Text style={bodyMedium(t)}>Dark mode</Text>
              </View>
            }
            right={<Toggle value={t.dark} onValueChange={t.setDark} accessibilityLabel="Dark mode" />}
          />
          <Row
            left={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Bell size={18} color={t.palette.ink3} strokeWidth={2.2} />
                <Text style={bodyMedium(t)}>Push notifications</Text>
              </View>
            }
            right={
              <Toggle value={pushOn} onValueChange={setPushOn} accessibilityLabel="Push notifications" />
            }
          />
          <Row
            left={<Text style={bodyMedium(t)}>Units</Text>}
            right={<UnitsToggle value={units} onChange={setUnits} />}
          />
          <Row
            left={<Text style={bodyMedium(t)}>Accent</Text>}
            right={
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {ACCENT_KEYS.map((k: AccentKey) => (
                  <Pressable
                    key={k}
                    onPress={() => t.setAccent(k)}
                    accessibilityRole="button"
                    accessibilityLabel={`Accent ${k}`}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: ACCENTS[k],
                      borderWidth: t.accentKey === k ? 2 : 1,
                      borderColor: t.accentKey === k ? t.palette.ink : t.palette.line,
                    }}
                  />
                ))}
              </View>
            }
            last
          />
        </Section>

        {/* ABOUT */}
        <Section label="About">
          <Row
            left={<Text style={bodyMedium(t)}>Help center</Text>}
            right={<ChevronRight size={18} color={t.palette.ink3} />}
            onPress={() => {}}
          />
          <Row
            left={<Text style={bodyMedium(t)}>Terms · Privacy</Text>}
            right={<ChevronRight size={18} color={t.palette.ink3} />}
            onPress={() => {}}
          />
          <Row
            left={<Text style={bodyMedium(t)}>App version</Text>}
            right={
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: t.palette.ink3 }}>0.1.0</Text>
            }
            last
          />
        </Section>

        <View style={{ paddingHorizontal: 22, marginTop: 8 }}>
          <Pressable
            onPress={() => {
              signOut();
              router.replace('/signin');
            }}
            accessibilityRole="button"
            style={{
              backgroundColor: t.palette.cardBg,
              borderWidth: 1,
              borderColor: t.palette.glassBorder,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontWeight: '500',
                fontSize: 14,
                color: t.palette.danger,
              }}
            >
              Sign out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function bodyMedium(t: ReturnType<typeof useTheme>): TextStyle {
  return {
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 14,
    color: t.palette.ink,
  };
}

function subBody(t: ReturnType<typeof useTheme>): TextStyle {
  return {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: t.palette.ink3,
  };
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={[SECTION_LABEL, { color: t.palette.ink3, paddingHorizontal: 22, marginBottom: 8 }]}>
        {label}
      </Text>
      <View
        style={{
          marginHorizontal: 22,
          backgroundColor: t.palette.cardBg,
          borderWidth: 1,
          borderColor: t.palette.glassBorder,
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  left,
  right,
  last,
  onPress,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
  last?: boolean;
  onPress?: () => void;
}) {
  const t = useTheme();
  const inner = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.palette.line2,
        gap: 12,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>{left}</View>
      {right ? <View>{right}</View> : null}
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button">
      {inner}
    </Pressable>
  ) : (
    inner
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <Row
      left={
        <View>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 11,
              color: t.palette.ink3,
              letterSpacing: 0.55,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </Text>
          <Text style={[bodyMedium(t), { marginTop: 2 }]}>{value}</Text>
        </View>
      }
      right={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: t.palette.accent }}>
            Edit
          </Text>
          <ChevronRight size={18} color={t.palette.ink3} />
        </View>
      }
      onPress={() => {}}
    />
  );
}

function UnitsToggle({ value, onChange }: { value: Units; onChange: (u: Units) => void }) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: t.palette.line2,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {(['metric', 'imperial'] as const).map((u) => {
        const on = u === value;
        return (
          <Pressable
            key={u}
            onPress={() => onChange(u)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={{
              paddingVertical: 5,
              paddingHorizontal: 10,
              backgroundColor: on ? t.palette.accent : 'transparent',
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontWeight: '500',
                fontSize: 11,
                color: on ? t.palette.on.accent : t.palette.ink,
                textTransform: 'capitalize',
              }}
            >
              {u}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
