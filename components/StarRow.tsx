import { Star } from 'lucide-react-native';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

const DEFAULT_SIZE = 20;
const GAP = 3;

export type StarRowProps = {
  value: number;
  max?: number;
  onValueChange?: (next: number) => void;
  size?: number;
  /** Force read-only display even if `onValueChange` is provided. */
  readonly?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function StarRow({
  value,
  max = 5,
  onValueChange,
  size = DEFAULT_SIZE,
  readonly,
  testID,
  style,
}: StarRowProps) {
  const t = useTheme();
  const isInteractive = !readonly && typeof onValueChange === 'function';
  const filledColor = isInteractive ? t.palette.star.interactive : t.palette.star.readonly;
  const emptyColor = t.palette.ink3;

  return (
    <View
      testID={testID}
      style={[{ flexDirection: 'row', gap: GAP }, style]}
      accessibilityRole="adjustable"
      accessibilityLabel={`Rating ${value} of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < value;
        const color = filled ? filledColor : emptyColor;
        const star = (
          <Star
            size={size}
            color={color}
            fill={filled ? color : 'transparent'}
            strokeWidth={2}
          />
        );
        if (isInteractive) {
          return (
            <Pressable
              key={i}
              onPress={() => onValueChange!(i + 1)}
              testID={testID ? `${testID}-star-${i}` : undefined}
              hitSlop={4}
            >
              {star}
            </Pressable>
          );
        }
        return <View key={i}>{star}</View>;
      })}
    </View>
  );
}
