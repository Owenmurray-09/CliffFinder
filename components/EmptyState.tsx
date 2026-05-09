import { type ReactNode } from 'react';
import { type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type EmptyStateProps = {
  icon?: ReactNode;
  title?: string;
  message: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({ icon, title, message, testID, style }: EmptyStateProps) {
  const t = useTheme();
  return (
    <View
      testID={testID}
      style={[
        {
          alignItems: 'center',
          gap: 10,
          padding: 18,
          maxWidth: 240,
        },
        style,
      ]}
    >
      {icon}
      {title ? (
        <Text style={[t.typography.cardTitle, { color: t.palette.ink, textAlign: 'center' }]}>
          {title}
        </Text>
      ) : null}
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 13,
          lineHeight: 13 * 1.5,
          color: t.palette.ink3,
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
    </View>
  );
}
