import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Card({ children, style, testID }: CardProps) {
  const t = useTheme();
  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: t.palette.paper2,
          borderWidth: 1,
          borderColor: t.palette.line,
          borderRadius: t.radius.card,
          padding: 18,
          gap: 14,
          flexDirection: 'column',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
