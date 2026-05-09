import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Field } from '@/components/Field';
import { GlassPanel } from '@/components/GlassPanel';
import { PinMarker } from '@/components/PinMarker';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Slider } from '@/components/Slider';
import { StarRow } from '@/components/StarRow';
import { StatBox } from '@/components/StatBox';
import { Toggle } from '@/components/Toggle';
import { ACCENTS, ACCENT_KEYS } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function Index() {
  const t = useTheme();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('alex@cliffjumper.app');
  const [password, setPassword] = useState('••••••••');
  const [bad, setBad] = useState('not-an-email');
  const [chips, setChips] = useState<Set<string>>(new Set(['Trending']));
  const [notif, setNotif] = useState(true);
  const [haptics, setHaptics] = useState(false);
  const [height, setHeight] = useState(15);
  const [waterTemp, setWaterTemp] = useState(18);
  const [rating, setRating] = useState(4);
  const [tab, setTab] = useState<'visited' | 'saved'>('visited');
  const toggleChip = (key: string) => {
    setChips((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const triggerBusy = () => {
    setBusy(true);
    setTimeout(() => setBusy(false), 700);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.palette.paper }}
      contentContainerStyle={[styles.content, { padding: t.spacing.xl, gap: t.spacing.xl }]}
    >
      <View style={{ gap: t.spacing.xs }}>
        <Text style={[t.typography.display, { color: t.palette.ink }]}>CliffFinder</Text>
        <Text style={[t.typography.body, { color: t.palette.ink3 }]}>
          Theme debug · {t.dark ? 'dark' : 'light'} · accent={t.accentKey}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: t.spacing.sm, flexWrap: 'wrap' }}>
        <Button label="toggle dark" variant="ghost" onPress={t.toggleDark} />
      </View>

      <View style={{ gap: t.spacing.sm }}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>accent</Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
          {ACCENT_KEYS.map((key) => (
            <Pressable
              key={key}
              onPress={() => t.setAccent(key)}
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

      <View style={{ gap: t.spacing.sm }}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>buttons</Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm, flexWrap: 'wrap' }}>
          <Button label="Sign in" variant="primary" onPress={triggerBusy} busy={busy} />
          <Button label="Cancel" variant="ghost" />
          <Button label="Create account" variant="outline" />
          <Button label="Forgot password?" variant="link" />
        </View>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm, flexWrap: 'wrap' }}>
          <Button label="disabled primary" variant="primary" disabled />
          <Button label="disabled outline" variant="outline" disabled />
        </View>
      </View>

      <View style={{ gap: t.spacing.sm }}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>pin markers</Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.md, alignItems: 'center' }}>
          <PinMarker category="trending" count={2} />
          <PinMarker category="saved" count={2} />
          <PinMarker category="friends" count={3} />
          <PinMarker category="trending" />
          <PinMarker category="trending" size={48} count={5} />
        </View>
      </View>

      <View style={{ gap: t.spacing.sm }}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>segmented</Text>
        <SegmentedControl
          options={[{ label: 'Visited', value: 'visited' }, { label: 'Saved', value: 'saved' }]}
          value={tab}
          onValueChange={setTab}
        />
      </View>

      <View style={{ gap: t.spacing.sm }}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>star row</Text>
        <View style={{ gap: t.spacing.sm }}>
          <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'center' }}>
            <Text style={[t.typography.body, { color: t.palette.ink2, width: 96 }]}>read-only:</Text>
            <StarRow value={4} />
          </View>
          <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'center' }}>
            <Text style={[t.typography.body, { color: t.palette.ink2, width: 96 }]}>interactive:</Text>
            <StarRow value={rating} onValueChange={setRating} />
          </View>
        </View>
      </View>

      <View style={{ gap: t.spacing.sm }}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>statbox</Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
          <StatBox value="42m" label="Height" />
          <StatBox value="12m" label="Depth" />
          <StatBox value="18°" label="Water" />
        </View>
      </View>

      <View style={{ gap: t.spacing.sm }}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>avatars</Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'center' }}>
          <Avatar name="Alex" />
          <Avatar name="Maya" size={42} />
          <Avatar name="Jordan" size={42} />
          <Avatar name="Sasha" size={42} />
          <Avatar name="" size={42} />
        </View>
      </View>

      <View style={{ gap: t.spacing.sm }}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>card + glass</Text>
        <View style={{ gap: t.spacing.sm, maxWidth: 360 }}>
          <Card>
            <Text style={[t.typography.cardTitle, { color: t.palette.ink }]}>Card surface</Text>
            <Text style={[t.typography.body, { color: t.palette.ink2 }]}>
              paper2 bg, 1px line border, radius 16, padding 18, gap 14.
            </Text>
          </Card>
          <GlassPanel variant="search" style={{ borderRadius: 14, padding: 14 }}>
            <Text style={[t.typography.body, { color: t.palette.ink }]}>
              GlassPanel · search (intensity 24)
            </Text>
          </GlassPanel>
          <GlassPanel variant="tabBar" style={{ borderRadius: 22, padding: 14 }}>
            <Text style={[t.typography.body, { color: t.palette.ink }]}>
              GlassPanel · tabBar (intensity 20)
            </Text>
          </GlassPanel>
        </View>
      </View>

      <View style={{ gap: t.spacing.sm }}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>sliders</Text>
        <View style={{ gap: t.spacing.lg, maxWidth: 360 }}>
          <View style={{ gap: t.spacing.xs }}>
            <Text style={[t.typography.body, { color: t.palette.ink2 }]}>height: {height}m</Text>
            <Slider value={height} onValueChange={setHeight} min={0} max={50} />
          </View>
          <View style={{ gap: t.spacing.xs }}>
            <Text style={[t.typography.body, { color: t.palette.ink2 }]}>water temp: {waterTemp}°C</Text>
            <Slider value={waterTemp} onValueChange={setWaterTemp} min={0} max={30} />
          </View>
        </View>
      </View>

      <View style={{ gap: t.spacing.sm }}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>toggles</Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.lg, alignItems: 'center' }}>
          <Toggle value={notif} onValueChange={setNotif} />
          <Toggle value={haptics} onValueChange={setHaptics} />
          <Toggle value={true} onValueChange={() => {}} disabled />
        </View>
      </View>

      <View style={{ gap: t.spacing.sm }}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>chips</Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm, flexWrap: 'wrap' }}>
          {['Trending', 'Saved', 'Friends', '10–30m'].map((c) => (
            <Chip key={c} label={c} selected={chips.has(c)} onPress={() => toggleChip(c)} />
          ))}
        </View>
      </View>

      <View style={{ gap: t.spacing.sm }}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>fields</Text>
        <View style={{ gap: t.spacing.sm, maxWidth: 360 }}>
          <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Field label="Email" value={bad} onChangeText={setBad} error="Enter a valid email." autoCapitalize="none" />
        </View>
      </View>

      <View style={{ gap: t.spacing.sm }}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>palette</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
          <Swatch label="paper" hex={t.palette.paper} fg={t.palette.ink} />
          <Swatch label="paper2" hex={t.palette.paper2} fg={t.palette.ink} />
          <Swatch label="sheetBg" hex={t.palette.sheetBg} fg={t.palette.ink} />
          <Swatch label="ink" hex={t.palette.ink} fg={t.palette.onInk} />
          <Swatch label="ink2" hex={t.palette.ink2} fg={t.palette.onInk} />
          <Swatch label="ink3" hex={t.palette.ink3} fg={t.palette.onInk} />
        </View>
      </View>

      <View style={{ gap: t.spacing.sm }}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>pin (semantic)</Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
          <Swatch label="trending" hex={t.palette.pin.trending} fg={t.palette.on.pin} />
          {/* Saved is yellow — design uses dark text on it for contrast. */}
          <Swatch label="saved" hex={t.palette.pin.saved} fg={t.palette.ink} />
          <Swatch label="friends" hex={t.palette.pin.friends} fg={t.palette.on.pin} />
        </View>
      </View>
    </ScrollView>
  );
}

function Swatch({ label, hex, fg }: { label: string; hex: string; fg: string }) {
  return (
    <View
      style={{
        width: 110,
        height: 64,
        backgroundColor: hex,
        borderRadius: 12,
        padding: 8,
        justifyContent: 'flex-end',
      }}
    >
      <Text style={{ color: fg, fontSize: 11 }}>{label}</Text>
      <Text style={{ color: fg, fontSize: 11, opacity: 0.7 }}>{hex}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 64 },
});
