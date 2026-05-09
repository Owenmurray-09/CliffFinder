import { render } from '@testing-library/react-native';
import { PinMarker } from '../PinMarker';
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

describe('<PinMarker />', () => {
  test('trending category uses #E07A2E bg', () => {
    const tree = render(<PinMarker testID="p" category="trending" />);
    const style = flattenStyle(tree.getByTestId('p').props.style);
    expect(style.backgroundColor).toBe('#E07A2E');
  });

  test('saved category uses #E8B742 bg', () => {
    const tree = render(<PinMarker testID="p" category="saved" />);
    const style = flattenStyle(tree.getByTestId('p').props.style);
    expect(style.backgroundColor).toBe('#E8B742');
  });

  test('friends category uses #D17EA8 bg', () => {
    const tree = render(<PinMarker testID="p" category="friends" />);
    const style = flattenStyle(tree.getByTestId('p').props.style);
    expect(style.backgroundColor).toBe('#D17EA8');
  });

  test('default 32×32 with radius 16, 3px white border', () => {
    const tree = render(<PinMarker testID="p" category="trending" />);
    const style = flattenStyle(tree.getByTestId('p').props.style);
    expect(style.width).toBe(32);
    expect(style.height).toBe(32);
    expect(style.borderRadius).toBe(16);
    expect(style.borderWidth).toBe(3);
    expect(style.borderColor).toBe('#FFFFFF');
  });

  test('shadow per design (0 4px 14px rgba(0,0,0,0.25))', () => {
    const tree = render(<PinMarker testID="p" category="trending" />);
    const style = flattenStyle(tree.getByTestId('p').props.style);
    expect(style.shadowColor).toBe('#000');
    expect(style.shadowOpacity).toBe(0.25);
    expect(style.shadowRadius).toBe(14);
    expect(style.shadowOffset).toEqual({ width: 0, height: 4 });
  });

  test('count renders inside as Inter 700 / 13 in white', () => {
    const tree = render(<PinMarker category="trending" count={3} />);
    const text = tree.getByText('3');
    const style = flattenStyle(text.props.style);
    expect(style.fontFamily).toBe('Inter_700Bold');
    expect(style.fontWeight).toBe('700');
    expect(style.fontSize).toBe(13);
    expect(style.color).toBe('#FFFFFF');
  });

  test('count omitted when undefined', () => {
    const tree = render(<PinMarker testID="p" category="trending" />);
    expect(tree.queryByText(/^\d+$/)).toBeNull();
  });

  test('size override scales width/height/radius/font', () => {
    const tree = render(<PinMarker testID="p" category="trending" count={2} size={48} />);
    const wrapStyle = flattenStyle(tree.getByTestId('p').props.style);
    expect(wrapStyle.width).toBe(48);
    expect(wrapStyle.height).toBe(48);
    expect(wrapStyle.borderRadius).toBe(24);
    const textStyle = flattenStyle(tree.getByText('2').props.style);
    expect(textStyle.fontSize).toBeCloseTo(19.5, 1); // 48 * 13 / 32
  });

  test('pin colors do NOT change with accent (semantic invariance)', () => {
    useThemeStore.setState({ dark: false, accent: 'orange' });
    const tree = render(<PinMarker testID="p" category="trending" />);
    const style = flattenStyle(tree.getByTestId('p').props.style);
    // Trending pin remains #E07A2E even though that coincides with the
    // orange accent — this is intentional (accent + pin happen to share
    // the same hex per design).
    expect(style.backgroundColor).toBe('#E07A2E');

    const tree2 = render(<PinMarker testID="p" category="saved" />);
    const style2 = flattenStyle(tree2.getByTestId('p').props.style);
    // Saved should NOT change with accent
    expect(style2.backgroundColor).toBe('#E8B742');
  });
});
