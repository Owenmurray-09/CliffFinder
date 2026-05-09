import { Pressable, type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type SegmentOption<T extends string = string> =
  | T
  | { label: string; value: T };

export type SegmentedControlProps<T extends string = string> = {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onValueChange: (next: T) => void;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

const optionToPair = <T extends string>(opt: SegmentOption<T>) =>
  typeof opt === 'string' ? { label: opt, value: opt } : opt;

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onValueChange,
  testID,
  style,
}: SegmentedControlProps<T>) {
  const t = useTheme();

  return (
    <View
      testID={testID}
      style={[
        {
          flexDirection: 'row',
          alignSelf: 'flex-start',
          backgroundColor: t.palette.paper2,
          borderWidth: 1,
          borderColor: t.palette.line,
          borderRadius: t.radius.cardSm,
          padding: 3,
          gap: 2,
        },
        style,
      ]}
    >
      {options.map((opt) => {
        const { label, value: optValue } = optionToPair(opt);
        const selected = optValue === value;
        return (
          <Pressable
            key={optValue}
            onPress={() => onValueChange(optValue)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={{
              backgroundColor: selected ? t.palette.ink : 'transparent',
              borderRadius: 9,
              paddingVertical: 7,
              paddingHorizontal: 14,
            }}
          >
            <Text
              style={{
                fontFamily: 'Poppins_600SemiBold',
                fontWeight: '600',
                fontSize: 13,
                color: selected ? t.palette.onInk : t.palette.ink2,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
