import { fireEvent, render } from '@testing-library/react-native';
import { Slider, sliderMath } from '../Slider';
import { ACCENTS } from '@/theme/tokens';
import { useThemeStore } from '@/theme/store';

const flattenStyle = (style: unknown): Record<string, unknown> => {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce(
      (acc, s) => Object.assign(acc, flattenStyle(s)),
      {} as Record<string, unknown>,
    );
  }
  return style as Record<string, unknown>;
};

beforeEach(() => {
  useThemeStore.setState({ dark: false, accent: 'blue' });
});

describe('sliderMath — clamp', () => {
  test('value below min clamps to min', () => {
    expect(sliderMath.clamp(-10, 0, 100)).toBe(0);
  });
  test('value above max clamps to max', () => {
    expect(sliderMath.clamp(150, 0, 100)).toBe(100);
  });
  test('value inside range is unchanged', () => {
    expect(sliderMath.clamp(42, 0, 100)).toBe(42);
  });
});

describe('sliderMath — roundToStep', () => {
  test('rounds to nearest integer with step 1', () => {
    expect(sliderMath.roundToStep(5.4, 1)).toBe(5);
    expect(sliderMath.roundToStep(5.6, 1)).toBe(6);
  });
  test('rounds to nearest 0.5 with step 0.5', () => {
    expect(sliderMath.roundToStep(5.4, 0.5)).toBe(5.5);
    expect(sliderMath.roundToStep(5.2, 0.5)).toBe(5);
  });
  test('rounds to nearest 5 with step 5', () => {
    expect(sliderMath.roundToStep(5.4, 5)).toBe(5);
    expect(sliderMath.roundToStep(7.6, 5)).toBe(10);
  });
  test('step 0 short-circuits to identity', () => {
    expect(sliderMath.roundToStep(5.4, 0)).toBe(5.4);
  });
});

describe('sliderMath — valueToRatio', () => {
  test('value at min returns 0', () => {
    expect(sliderMath.valueToRatio(0, 0, 100)).toBe(0);
  });
  test('value at max returns 1', () => {
    expect(sliderMath.valueToRatio(100, 0, 100)).toBe(1);
  });
  test('halfway returns 0.5', () => {
    expect(sliderMath.valueToRatio(50, 0, 100)).toBe(0.5);
  });
  test('value below min clamps to 0', () => {
    expect(sliderMath.valueToRatio(-10, 0, 100)).toBe(0);
  });
  test('value above max clamps to 1', () => {
    expect(sliderMath.valueToRatio(200, 0, 100)).toBe(1);
  });
  test('non-zero min works', () => {
    expect(sliderMath.valueToRatio(15, 10, 30)).toBe(0.25);
  });
  test('max == min returns 0 (avoid div by zero)', () => {
    expect(sliderMath.valueToRatio(5, 5, 5)).toBe(0);
  });
});

describe('sliderMath — positionToValue', () => {
  test('x=0 returns min', () => {
    expect(sliderMath.positionToValue(0, 200, 0, 100, 1)).toBe(0);
  });
  test('x=full width returns max', () => {
    expect(sliderMath.positionToValue(200, 200, 0, 100, 1)).toBe(100);
  });
  test('x at half returns midpoint', () => {
    expect(sliderMath.positionToValue(100, 200, 0, 100, 1)).toBe(50);
  });
  test('respects step (snaps to 5)', () => {
    expect(sliderMath.positionToValue(53, 200, 0, 100, 5)).toBe(25);
    expect(sliderMath.positionToValue(63, 200, 0, 100, 5)).toBe(30);
  });
  test('non-zero min: 10..30 range', () => {
    expect(sliderMath.positionToValue(0, 200, 10, 30, 1)).toBe(10);
    expect(sliderMath.positionToValue(200, 200, 10, 30, 1)).toBe(30);
    expect(sliderMath.positionToValue(100, 200, 10, 30, 1)).toBe(20);
  });
  test('x past full width clamps to max', () => {
    expect(sliderMath.positionToValue(500, 200, 0, 100, 1)).toBe(100);
  });
  test('zero track width returns min', () => {
    expect(sliderMath.positionToValue(50, 0, 0, 100, 1)).toBe(0);
  });
});

describe('<Slider /> — render', () => {
  test('track has line bg, pill radius, height 6', () => {
    const tree = render(
      <Slider testID="slider-track" value={50} onValueChange={jest.fn()} />,
    );
    const style = flattenStyle(tree.getByTestId('slider-track').props.style);
    expect(style.height).toBe(6);
    expect(style.borderRadius).toBe(999);
    expect(style.backgroundColor).toBe('rgba(30,47,35,0.12)');
  });

  test('fill bg uses accent (blue by default)', () => {
    const tree = render(
      <Slider testID="slider-track" value={50} onValueChange={jest.fn()} />,
    );
    // Fill is the first child of the track wrapper
    const track = tree.getByTestId('slider-track');
    const fill = track.children[0];
    const style = flattenStyle((fill as any).props.style);
    expect(style.backgroundColor).toBe(ACCENTS.blue);
  });

  test('fill bg respects accent change (orange)', () => {
    useThemeStore.setState({ dark: false, accent: 'orange' });
    const tree = render(
      <Slider testID="slider-track" value={50} onValueChange={jest.fn()} />,
    );
    const fill = tree.getByTestId('slider-track').children[0];
    const style = flattenStyle((fill as any).props.style);
    expect(style.backgroundColor).toBe(ACCENTS.orange);
  });

  test('thumb is white with 2px accent border', () => {
    const tree = render(
      <Slider testID="slider-track" value={50} onValueChange={jest.fn()} />,
    );
    const track = tree.getByTestId('slider-track');
    const thumb = track.children[1];
    const style = flattenStyle((thumb as any).props.style);
    expect(style.width).toBe(20);
    expect(style.height).toBe(20);
    expect(style.backgroundColor).toBe('#FFFFFF');
    expect(style.borderWidth).toBe(2);
    expect(style.borderColor).toBe(ACCENTS.blue);
  });

  test('value position drives fill width after layout', () => {
    const tree = render(
      <Slider testID="slider-track" value={25} min={0} max={100} onValueChange={jest.fn()} />,
    );
    const track = tree.getByTestId('slider-track');
    fireEvent(track, 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 200, height: 6 } },
    });
    const fill = track.children[0];
    const style = flattenStyle((fill as any).props.style);
    // 25/100 of 200 = 50
    expect(style.width).toBe(50);
  });
});
