import { useRouter } from 'expo-router';
import { Bell, ChevronLeft, ChevronRight, Moon } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, type TextStyle, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { Toggle } from '@/components/Toggle';
import { useAuthStore } from '@/auth/store';
import { useProfileStore } from '@/data/profileStore';
import { pickImage } from '@/lib/pickImage';
import { safeBack } from '@/lib/safeBack';
import { type Units, useUnitsStore } from '@/lib/units';
import { uploadPhoto } from '@/lib/uploadPhoto';
import { CURRENT_USER } from '@/data/user';
import { ACCENT_KEYS, ACCENTS, type AccentKey } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const SECTION_LABEL: TextStyle = {
  fontFamily: 'Inter_400Regular',
  fontSize: 11,
  letterSpacing: 0.88,
  textTransform: 'uppercase',
};

export default function SettingsScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signOut = useAuthStore((s) => s.signOut);

  const [pushOn, setPushOn] = useState(true);
  const units = useUnitsStore((s) => s.units);
  const setUnits = useUnitsStore((s) => s.setUnits);
  const avatarUrl = useProfileStore((s) => s.avatarUrl);
  const coverUrl = useProfileStore((s) => s.coverUrl);
  const displayName = useProfileStore((s) => s.displayName);
  const handle = useProfileStore((s) => s.handle);
  const setAvatar = useProfileStore((s) => s.setAvatar);
  const setCover = useProfileStore((s) => s.setCover);
  const setDisplayName = useProfileStore((s) => s.setDisplayName);
  const setHandle = useProfileStore((s) => s.setHandle);
  const session = useAuthStore((s) => s.session);
  const [uploading, setUploading] = useState<'avatar' | 'cover' | null>(null);

  const pickAndSet = async (kind: 'avatar' | 'cover') => {
    if (uploading || !session) return;
    const picked = await pickImage();
    if (!picked) return;
    setUploading(kind);
    try {
      const url = await uploadPhoto(picked.uri, session.user.id, kind);
      if (kind === 'avatar') await setAvatar(url);
      else await setCover(url);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('avatar/cover upload failed', e);
    } finally {
      setUploading(null);
    }
  };

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
          onPress={() => safeBack(router, '/profile')}
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
                <Avatar
                  name={displayName ?? session?.user.email ?? CURRENT_USER.name}
                  uri={avatarUrl ?? undefined}
                  size={42}
                />
                <View>
                  <Text style={[bodyMedium(t)]}>Profile picture</Text>
                  <Text style={[subBody(t), { marginTop: 1 }]}>
                    {uploading === 'avatar' ? 'Uploading…' : 'Tap to change'}
                  </Text>
                </View>
              </View>
            }
            right={<ChevronRight size={18} color={t.palette.ink3} />}
            onPress={() => pickAndSet('avatar')}
          />
          <Row
            left={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    overflow: 'hidden',
                    backgroundColor: t.palette.line2,
                  }}
                >
                  {coverUrl ? (
                    <Image
                      source={{ uri: coverUrl }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  ) : null}
                </View>
                <View>
                  <Text style={[bodyMedium(t)]}>Cover photo</Text>
                  <Text style={[subBody(t), { marginTop: 1 }]}>
                    {uploading === 'cover' ? 'Uploading…' : 'Tap to change'}
                  </Text>
                </View>
              </View>
            }
            right={<ChevronRight size={18} color={t.palette.ink3} />}
            onPress={() => pickAndSet('cover')}
          />
          <FieldRow
            label="Username"
            value={handle ?? ''}
            placeholder="pick a username"
            prefix="@"
            onSave={setHandle}
          />
          <FieldRow
            label="Display name"
            value={displayName ?? ''}
            placeholder="Your name"
            autoCapitalize="words"
            onSave={setDisplayName}
          />
          <FieldRow label="Email" value={session?.user.email ?? CURRENT_USER.email} />
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

function FieldRow({
  label,
  value,
  placeholder,
  onSave,
  prefix,
  autoCapitalize,
}: {
  label: string;
  value: string;
  placeholder?: string;
  /** If omitted, the row is read-only. Returns error message or null. */
  onSave?: (next: string) => Promise<string | null>;
  /** Visual prefix for the value (e.g. "@" for handles). */
  prefix?: string;
  autoCapitalize?: 'none' | 'words';
}) {
  const t = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    if (!onSave) return;
    setDraft(value);
    setError(null);
    setEditing(true);
  };

  const commit = async () => {
    if (!onSave) return;
    if (saving) return;
    setSaving(true);
    const err = await onSave(draft);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setEditing(false);
    setError(null);
  };

  const cancel = () => {
    setEditing(false);
    setError(null);
  };

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
          {editing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 2 }}>
              {prefix ? (
                <Text style={[bodyMedium(t), { color: t.palette.ink3 }]}>{prefix}</Text>
              ) : null}
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={commit}
                placeholder={placeholder}
                placeholderTextColor={t.palette.ink3}
                autoFocus
                autoCapitalize={autoCapitalize ?? 'none'}
                autoCorrect={false}
                editable={!saving}
                style={[
                  bodyMedium(t),
                  {
                    flex: 1,
                    padding: 0,
                    minWidth: 120,
                  },
                ]}
              />
            </View>
          ) : (
            <Text style={[bodyMedium(t), { marginTop: 2 }]}>
              {value || placeholder || '—'}
            </Text>
          )}
          {error ? (
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: t.palette.danger,
                marginTop: 4,
              }}
            >
              {error}
            </Text>
          ) : null}
        </View>
      }
      right={
        onSave ? (
          editing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Pressable onPress={cancel} hitSlop={6} accessibilityRole="button">
                <Text
                  style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: t.palette.ink3 }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={commit}
                hitSlop={6}
                accessibilityRole="button"
                disabled={saving}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontWeight: '500',
                    fontSize: 12,
                    color: t.palette.accent,
                  }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text
                style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: t.palette.accent }}
              >
                Edit
              </Text>
              <ChevronRight size={18} color={t.palette.ink3} />
            </View>
          )
        ) : undefined
      }
      onPress={!editing && onSave ? startEdit : undefined}
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
