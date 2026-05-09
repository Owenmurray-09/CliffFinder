import { Plus } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { fabShadow } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const DEFAULT_SIZE = 54;
const ICON_RATIO = 24 / 54; // lucide stroke icons read well at ~24px on 54

export type FABProps = {
  onPress: () => void;
  icon?: ReactNode;
  size?: number;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function FAB({
  onPress,
  icon,
  size = DEFAULT_SIZE,
  accessibilityLabel,
  testID,
  style,
}: FABProps) {
  const t = useTheme();
  const iconSize = Math.round(size * ICON_RATIO);
  const defaultIcon = <Plus size={iconSize} color={t.palette.on.accent} strokeWidth={2.5} />;

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: t.palette.accent,
          alignItems: 'center',
          justifyContent: 'center',
          ...fabShadow(t.palette.accent),
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {icon ?? defaultIcon}
    </Pressable>
  );
}
