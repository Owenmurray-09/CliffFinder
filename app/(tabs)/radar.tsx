import { Radar } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { RADAR_FEED } from '@/data/friends';
import { useTheme } from '@/theme/useTheme';

export default function RadarScreen() {
  const t = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.palette.paper }}
      contentContainerStyle={[styles.content, { padding: t.spacing.xl, gap: t.spacing.lg }]}
    >
      <Text style={[t.typography.title, { color: t.palette.ink }]}>Radar</Text>
      <Text style={[t.typography.body, { color: t.palette.ink3 }]}>
        {RADAR_FEED.length} recent · stub screen, real feed lands in a later loop.
      </Text>
      <View style={{ alignItems: 'center', paddingVertical: t.spacing['3xl'] }}>
        <EmptyState
          icon={<Radar size={40} color={t.palette.ink3} strokeWidth={1.5} />}
          title="Radar coming soon"
          message="Friend activity will appear here once the feed is wired up."
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ content: { paddingTop: 64, paddingBottom: 120 } });
