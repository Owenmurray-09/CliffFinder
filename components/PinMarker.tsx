import { type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

const DEFAULT_SIZE = 32;
const BORDER_WIDTH = 3;

export type PinCategory = 'trending' | 'saved' | 'friends';

export type PinMarkerProps = {
  category: PinCategory;
  count?: number | string;
  size?: number;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function PinMarker({
  category,
  count,
  size = DEFAULT_SIZE,
  testID,
  style,
}: PinMarkerProps) {
  const t = useTheme();
  const bg = t.palette.pin[category];
  const fontSize = (size * 13) / DEFAULT_SIZE;

  return (
    <View
      testID={testID}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          // Pin border is hard-coded white per design `.pin{border:3px solid #fff}`.
          borderWidth: BORDER_WIDTH,
          borderColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 4 },
          elevation: 5,
        },
        style,
      ]}
    >
      {count !== undefined ? (
        <Text
          style={{
            color: t.palette.on.pin,
            fontFamily: 'Inter_700Bold',
            fontWeight: '700',
            fontSize,
          }}
        >
          {String(count)}
        </Text>
      ) : null}
    </View>
  );
}
