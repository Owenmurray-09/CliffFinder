import { useRef, useState } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';

const TRACK_HEIGHT = 6;
const THUMB_SIZE = 20;
const HIT_PADDING = 12; // vertical padding around the track for tappability

export type SliderProps = {
  value: number;
  onValueChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export const sliderMath = {
  clamp: (v: number, min: number, max: number) => Math.min(max, Math.max(min, v)),
  // Snaps to the nearest multiple of `step` anchored at 0, not at `min`.
  // For `min=0, step=5`: stops are 0,5,10,…. For `min=12, step=5`: stops
  // are still 10,15,20,… clamped into [12,30] — i.e. 12 itself isn't a
  // stop. Current consumers all use `min=0`, so this isn't a problem;
  // flag if a future caller mixes non-zero `min` with non-1 `step`.
  roundToStep: (v: number, step: number) =>
    step > 0 ? Math.round(v / step) * step : v,
  valueToRatio: (value: number, min: number, max: number) =>
    max === min ? 0 : sliderMath.clamp((value - min) / (max - min), 0, 1),
  positionToValue: (
    x: number,
    trackWidth: number,
    min: number,
    max: number,
    step: number,
  ) => {
    if (trackWidth <= 0) return min;
    const ratio = sliderMath.clamp(x / trackWidth, 0, 1);
    const raw = min + ratio * (max - min);
    return sliderMath.clamp(sliderMath.roundToStep(raw, step), min, max);
  },
};

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  testID,
  style,
}: SliderProps) {
  const t = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const valueRef = useRef(value);
  valueRef.current = value;
  const trackWidthRef = useRef(trackWidth);
  trackWidthRef.current = trackWidth;

  const ratio = sliderMath.valueToRatio(value, min, max);
  const fillWidth = ratio * trackWidth;

  const handleAtX = (x: number) => {
    const next = sliderMath.positionToValue(
      x,
      trackWidthRef.current,
      min,
      max,
      step,
    );
    if (next !== valueRef.current) onValueChange(next);
  };

  // Gesture.Pan() handles both touch (native) and mouse (web) properly,
  // unlike PanResponder which doesn't reliably emit mousemove on RN-Web.
  // `e.x` is in the gesture target's local coordinates → that's what we
  // need. minDistance:0 ensures a simple tap (no drag) also fires onBegin.
  const gesture = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      runOnJS(handleAtX)(e.x);
    })
    .onUpdate((e) => {
      runOnJS(handleAtX)(e.x);
    });

  return (
    <GestureDetector gesture={gesture}>
      <View style={[{ paddingVertical: HIT_PADDING }, style]}>
        <View
          testID={testID}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          style={{
            height: TRACK_HEIGHT,
            width: '100%',
            borderRadius: t.radius.pill,
            backgroundColor: t.palette.line,
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: fillWidth,
              borderRadius: t.radius.pill,
              backgroundColor: t.palette.accent,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: fillWidth - THUMB_SIZE / 2,
              top: -(THUMB_SIZE - TRACK_HEIGHT) / 2,
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: t.radius.pill,
              backgroundColor: '#FFFFFF',
              borderWidth: 2,
              borderColor: t.palette.accent,
              shadowColor: '#000',
              shadowOpacity: 0.18,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}
          />
        </View>
      </View>
    </GestureDetector>
  );
}
