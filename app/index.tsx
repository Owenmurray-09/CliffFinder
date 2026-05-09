import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>CliffFinder</Text>
      <Text style={styles.subtitle}>Scaffold ready · loop 1 complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
});
