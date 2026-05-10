import { BookOpen } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { LOG_ENTRIES } from '@/data/logEntries';
import { useTheme } from '@/theme/useTheme';

export default function LogbookScreen() {
  const t = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.palette.paper }}
      contentContainerStyle={[styles.content, { padding: t.spacing.xl, gap: t.spacing.lg }]}
    >
      <Text style={[t.typography.title, { color: t.palette.ink }]}>Logbook</Text>
      <Text style={[t.typography.body, { color: t.palette.ink3 }]}>
        {LOG_ENTRIES.length} jumps logged · stub screen, real list lands in a later loop.
      </Text>
      <View style={{ alignItems: 'center', paddingVertical: t.spacing['3xl'] }}>
        <EmptyState
          icon={<BookOpen size={40} color={t.palette.ink3} strokeWidth={1.5} />}
          title="Logbook coming soon"
          message="Your jump history and saved spots will live here."
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ content: { paddingTop: 64, paddingBottom: 120 } });
