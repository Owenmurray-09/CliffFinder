import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  Text,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'link';

export type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  onPress?: () => void;
  busy?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const BASE_PADDING_V = 13;
const BASE_PADDING_H = 18;
const LINK_PADDING_V = 6;
const LINK_PADDING_H = 8;
const OUTLINE_BORDER = 1.5;

export function Button({
  label,
  variant = 'primary',
  onPress,
  busy = false,
  disabled = false,
  icon,
  style,
  testID,
}: ButtonProps) {
  const t = useTheme();
  const inactive = busy || disabled;

  const { rootStyle, labelStyle } = useMemo(() => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.spacing.sm,
    };

    let variantStyle: ViewStyle;
    let labelColor: string;
    let labelWeight: TextStyle['fontWeight'] = t.typography.button.fontWeight;

    if (variant === 'primary') {
      variantStyle = {
        backgroundColor: t.palette.accent,
        borderRadius: t.radius.card,
        paddingVertical: BASE_PADDING_V,
        paddingHorizontal: BASE_PADDING_H,
      };
      labelColor = t.palette.on.accent;
    } else if (variant === 'ghost') {
      variantStyle = {
        backgroundColor: t.palette.sheetSoft,
        borderRadius: t.radius.card,
        paddingVertical: BASE_PADDING_V,
        paddingHorizontal: BASE_PADDING_H,
      };
      labelColor = t.palette.ink;
    } else if (variant === 'outline') {
      variantStyle = {
        backgroundColor: 'transparent',
        borderRadius: t.radius.card,
        borderWidth: OUTLINE_BORDER,
        borderColor: t.palette.line,
        paddingVertical: BASE_PADDING_V,
        paddingHorizontal: BASE_PADDING_H,
      };
      labelColor = t.palette.ink;
    } else {
      // link
      variantStyle = {
        backgroundColor: 'transparent',
        borderRadius: t.radius.card,
        paddingVertical: LINK_PADDING_V,
        paddingHorizontal: LINK_PADDING_H,
      };
      labelColor = t.palette.accent;
      labelWeight = '600';
    }

    return {
      rootStyle: { ...base, ...variantStyle, opacity: disabled ? 0.5 : 1 },
      labelStyle: {
        ...t.typography.button,
        color: labelColor,
        fontWeight: labelWeight,
      } satisfies TextStyle,
    };
  }, [variant, disabled, t.palette, t.radius.card, t.spacing.sm, t.typography.button]);

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={[rootStyle, style]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!busy }}
      testID={testID}
    >
      {busy ? (
        <ActivityIndicator color={labelStyle.color} />
      ) : (
        <>
          {icon}
          <Text style={labelStyle}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
