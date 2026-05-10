import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { StatBox } from '@/components/StatBox';
import { CURRENT_USER } from '@/data/user';
import { useTheme } from '@/theme/useTheme';

export default function ProfileScreen() {
  const t = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.palette.paper }}
      contentContainerStyle={[styles.content, { padding: t.spacing.xl, gap: t.spacing.lg }]}
    >
      <View style={{ alignItems: 'center', gap: t.spacing.sm }}>
        <Avatar name={CURRENT_USER.name} size={96} />
        <Text style={[t.typography.title, { color: t.palette.ink }]}>{CURRENT_USER.name}</Text>
        <Text style={[t.typography.body, { color: t.palette.ink3 }]}>{CURRENT_USER.handle}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: t.spacing.sm, justifyContent: 'center' }}>
        <StatBox value={String(CURRENT_USER.jumpsCount)} label="Jumps" />
        <StatBox value={String(CURRENT_USER.spotsAddedCount)} label="Spots" />
        <StatBox value={String(CURRENT_USER.followersCount)} label="Followers" />
      </View>
      <Text
        style={[t.typography.body, { color: t.palette.ink3, textAlign: 'center', marginTop: t.spacing.md }]}
      >
        Stub screen — full Profile + Settings link land in a later loop.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ content: { paddingTop: 64, paddingBottom: 120 } });
