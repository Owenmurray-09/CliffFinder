import { render } from '@testing-library/react-native';
import { StatBox } from '../StatBox';
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

describe('<StatBox />', () => {
  test('renders value + label', () => {
    const tree = render(<StatBox value="42m" label="Height" />);
    expect(tree.getByText('42m')).toBeTruthy();
    expect(tree.getByText('Height')).toBeTruthy();
  });

  test('container chrome: paper2 bg, 1px line border, radius 12, padding 10/14, min-width 68', () => {
    const tree = render(<StatBox testID="stat" value="42m" label="Height" />);
    const style = flattenStyle(tree.getByTestId('stat').props.style);
    expect(style.backgroundColor).toBe('#E8DDBE');
    expect(style.borderWidth).toBe(1);
    expect(style.borderColor).toBe('rgba(30,47,35,0.12)');
    expect(style.borderRadius).toBe(12);
    expect(style.paddingVertical).toBe(10);
    expect(style.paddingHorizontal).toBe(14);
    expect(style.minWidth).toBe(68);
  });

  test('flex column items center, gap 2', () => {
    const tree = render(<StatBox testID="stat" value="42m" label="Height" />);
    const style = flattenStyle(tree.getByTestId('stat').props.style);
    expect(style.alignItems).toBe('center');
    expect(style.gap).toBe(2);
  });

  test('value uses typography.statNumber (Montserrat 700 / 18) + ink color', () => {
    const tree = render(<StatBox value="42m" label="Height" />);
    const style = flattenStyle(tree.getByText('42m').props.style);
    expect(style.fontFamily).toBe('Montserrat_700Bold');
    expect(style.fontSize).toBe(18);
    expect(style.fontWeight).toBe('700');
    expect(style.color).toBe('#1E2F23');
  });

  test('label uses typography.statLabel (Inter 400 / 10.5) + ink3 color, uppercase', () => {
    const tree = render(<StatBox value="42m" label="Height" />);
    const style = flattenStyle(tree.getByText('Height').props.style);
    expect(style.fontFamily).toBe('Inter_400Regular');
    expect(style.fontSize).toBe(10.5);
    expect(style.fontWeight).toBe('400');
    expect(style.textTransform).toBe('uppercase');
    expect(style.letterSpacing).toBe(0.6);
    expect(style.color).toBe('#7a8579');
  });

  test('dark mode: bg flips to dark paper2, value to dark ink, label to dark ink3', () => {
    useThemeStore.setState({ dark: true, accent: 'blue' });
    const tree = render(<StatBox testID="stat" value="42m" label="Height" />);
    const containerStyle = flattenStyle(tree.getByTestId('stat').props.style);
    const valueStyle = flattenStyle(tree.getByText('42m').props.style);
    const labelStyle = flattenStyle(tree.getByText('Height').props.style);
    expect(containerStyle.backgroundColor).toBe('#1A2820');
    expect(valueStyle.color).toBe('#EAE2C8');
    expect(labelStyle.color).toBe('#9AB096');
  });
});
