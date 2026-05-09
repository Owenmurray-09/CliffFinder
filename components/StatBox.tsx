import { type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type StatBoxProps = {
  value: string;
  label: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function StatBox({ value, label, testID, style }: StatBoxProps) {
  const t = useTheme();
  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: t.palette.paper2,
          borderWidth: 1,
          borderColor: t.palette.line,
          borderRadius: t.radius.cardSm,
          paddingVertical: 10,
          paddingHorizontal: 14,
          minWidth: 68,
          alignItems: 'center',
          gap: 2,
        },
        style,
      ]}
    >
      <Text style={[t.typography.statNumber, { color: t.palette.ink }]}>{value}</Text>
      <Text style={[t.typography.statLabel, { color: t.palette.ink3 }]}>{label}</Text>
    </View>
  );
}
