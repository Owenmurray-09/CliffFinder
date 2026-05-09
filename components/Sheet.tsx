import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';

const SLIDE_DURATION = 350;
const BACKDROP_DURATION = 300;
const SNAP_BACK_DURATION = 200;
const DISMISS_THRESHOLD_PX = 80;
const DISMISS_VELOCITY = 800;
const MAX_HEIGHT_RATIO = 0.78;
const HANDLE_WIDTH = 40;
const HANDLE_HEIGHT = 4;

// Reanimated's `Easing.bezier` accepts the same control points as the design
// brief: `Easing.bezier(0.2, 0.8, 0.2, 1)` — fast-out, smooth-in.
const SLIDE_EASING = Easing.bezier(0.2, 0.8, 0.2, 1);

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function Sheet({ visible, onClose, children, testID, style }: SheetProps) {
  const t = useTheme();
  // useWindowDimensions re-runs on rotation; Dimensions.get('window') would
  // capture the orientation at first render only.
  const { height: screenHeight } = useWindowDimensions();
  const maxHeight = screenHeight * MAX_HEIGHT_RATIO;

  // The Modal stays mounted during the close animation so the slide-out is
  // visible before unmount.
  const [mounted, setMounted] = useState(visible);
  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  const translateY = useSharedValue(maxHeight);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: SLIDE_DURATION, easing: SLIDE_EASING });
      backdropOpacity.value = withTiming(1, { duration: BACKDROP_DURATION });
    } else {
      translateY.value = withTiming(maxHeight, {
        duration: SLIDE_DURATION,
        easing: SLIDE_EASING,
      });
      // If the user re-opens mid-close, Reanimated cancels this pending
      // timing and invokes the callback with `finished: false` — so
      // the unmount only fires when the close actually completed.
      backdropOpacity.value = withTiming(0, { duration: BACKDROP_DURATION }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible, maxHeight, translateY, backdropOpacity]);

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      const shouldDismiss =
        e.translationY > DISMISS_THRESHOLD_PX || e.velocityY > DISMISS_VELOCITY;
      if (shouldDismiss) {
        translateY.value = withTiming(maxHeight, {
          duration: SLIDE_DURATION,
          easing: SLIDE_EASING,
        });
        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, {
          duration: SNAP_BACK_DURATION,
          easing: SLIDE_EASING,
        });
      }
    });

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible={mounted}
      onRequestClose={onClose}
      statusBarTranslucent
      testID={testID}
    >
      <View style={{ flex: 1 }}>
        <Animated.View
          style={[
            { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
            backdropAnimStyle,
          ]}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close sheet"
            testID={testID ? `${testID}-backdrop` : undefined}
          />
        </Animated.View>
        <Animated.View
          testID={testID ? `${testID}-sheet` : undefined}
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              maxHeight,
              backgroundColor: t.palette.sheetBg,
              borderTopLeftRadius: t.radius.sheet,
              borderTopRightRadius: t.radius.sheet,
              ...t.shadows.sheet,
            },
            sheetAnimStyle,
            style,
          ]}
        >
          <GestureDetector gesture={dragGesture}>
            <View style={{ alignItems: 'center', paddingVertical: 10 }}>
              <View
                testID={testID ? `${testID}-handle` : undefined}
                style={{
                  width: HANDLE_WIDTH,
                  height: HANDLE_HEIGHT,
                  borderRadius: HANDLE_HEIGHT / 2,
                  backgroundColor: t.palette.handle,
                }}
              />
            </View>
          </GestureDetector>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
