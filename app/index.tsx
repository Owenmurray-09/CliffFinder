import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ACCENTS, ACCENT_KEYS } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function Index() {
  const t = useTheme();

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

      <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
        <Pressable
          onPress={t.toggleDark}
          style={[
            styles.btn,
            {
              backgroundColor: t.palette.accent,
              borderRadius: t.radius.cardSm,
              paddingHorizontal: t.spacing.lg,
              paddingVertical: t.spacing.md,
            },
          ]}
        >
          <Text style={[t.typography.button, { color: t.palette.on.accent }]}>toggle dark</Text>
        </Pressable>
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
  btn: { alignSelf: 'flex-start' },
});
