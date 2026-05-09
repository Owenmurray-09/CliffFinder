import { useEffect, useRef } from 'react';
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 26;
const THUMB_SIZE = 20;
const THUMB_INSET = 3;
const ON_TRANSLATE_X = 18; // 3 → 21, equal padding both sides
const ANIM_MS = 150;

export type ToggleProps = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function Toggle({
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel,
  testID,
  style,
}: ToggleProps) {
  const t = useTheme();
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: ANIM_MS,
      useNativeDriver: true,
    }).start();
  }, [value, progress]);

  const trackStyle: ViewStyle = {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: t.radius.pill,
    backgroundColor: value ? t.palette.accent : t.palette.line,
    opacity: disabled ? 0.5 : 1,
    justifyContent: 'center',
  };

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, ON_TRANSLATE_X],
  });

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      style={[trackStyle, style]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: THUMB_INSET,
          left: THUMB_INSET,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: t.radius.pill,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
          transform: [{ translateX }],
        }}
      />
    </Pressable>
  );
}
