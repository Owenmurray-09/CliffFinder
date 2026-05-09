import { useMemo } from 'react';
import { Pressable, type StyleProp, Text, type TextStyle, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function Chip({ label, selected = false, onPress, icon, testID, style }: ChipProps) {
  const t = useTheme();

  const { rootStyle, labelStyle } = useMemo(() => {
    const baseLayout: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: t.radius.pill,
      borderWidth: 1,
      // Don't shrink inside horizontal-scrolling filter rows.
      flexShrink: 0,
    };
    const root: ViewStyle = selected
      ? {
          ...baseLayout,
          backgroundColor: t.palette.accent,
          borderColor: 'transparent',
        }
      : {
          ...baseLayout,
          backgroundColor: t.dark ? t.glass.search.tint.dark : t.glass.search.tint.light,
          borderColor: t.palette.chipBorder,
        };

    const lbl: TextStyle = {
      ...t.typography.chip,
      color: selected ? t.palette.on.accent : t.palette.ink,
    };

    return { rootStyle: root, labelStyle: lbl };
  }, [
    selected,
    t.dark,
    t.palette,
    t.radius.pill,
    t.typography.chip,
    t.glass.search.tint.dark,
    t.glass.search.tint.light,
  ]);

  return (
    <Pressable
      onPress={onPress}
      style={[rootStyle, style]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      testID={testID}
    >
      {icon}
      <Text style={labelStyle}>{label}</Text>
    </Pressable>
  );
}
