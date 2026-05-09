import { BlurView } from 'expo-blur';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type GlassVariant = 'search' | 'topbar' | 'tabBar';

export type GlassPanelProps = {
  variant?: GlassVariant;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * BlurView-based surface for floating glass UI (search bar, filter bar,
 * tab bar). Variant picks the design's intensity per use; tint resolves
 * from the current theme's dark mode. Border is `palette.glassBorder`
 * (distinct from `line` per Map.html `--ui-border`).
 *
 * Web fallback: expo-blur emits CSS `backdrop-filter`. Native uses the
 * platform blur APIs and will look subtly different — flag for simulator
 * verification.
 */
export function GlassPanel({
  variant = 'search',
  children,
  style,
  testID,
}: GlassPanelProps) {
  const t = useTheme();
  const intensity = t.glass[variant].intensity;

  return (
    <View
      testID={testID}
      style={[
        {
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: t.palette.glassBorder,
        },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={t.dark ? 'dark' : 'light'}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />
      {children}
    </View>
  );
}
