import { fireEvent, render } from '@testing-library/react-native';
import { Plus } from 'lucide-react-native';
import { Text } from 'react-native';
import { FAB } from '../FAB';
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

describe('<FAB />', () => {
  test('default 54×54 with pill radius', () => {
    const tree = render(<FAB onPress={jest.fn()} />);
    const style = flattenStyle(tree.getByRole('button').props.style);
    expect(style.width).toBe(54);
    expect(style.height).toBe(54);
    expect(style.borderRadius).toBe(27);
  });

  test('bg uses palette.accent (blue by default)', () => {
    const tree = render(<FAB onPress={jest.fn()} />);
    const style = flattenStyle(tree.getByRole('button').props.style);
    expect(style.backgroundColor).toBe(ACCENTS.blue);
  });

  test('bg respects accent change (orange)', () => {
    useThemeStore.setState({ dark: false, accent: 'orange' });
    const tree = render(<FAB onPress={jest.fn()} />);
    const style = flattenStyle(tree.getByRole('button').props.style);
    expect(style.backgroundColor).toBe(ACCENTS.orange);
  });

  test('shadow color is keyed to current accent at alpha 0.45', () => {
    const tree = render(<FAB onPress={jest.fn()} />);
    const style = flattenStyle(tree.getByRole('button').props.style);
    expect(style.shadowColor).toBe(ACCENTS.blue);
    expect(style.shadowOpacity).toBe(0.45);
    expect(style.shadowRadius).toBe(22);
    expect(style.shadowOffset).toEqual({ width: 0, height: 8 });
  });

  test('shadow recolors when accent changes', () => {
    useThemeStore.setState({ dark: false, accent: 'orange' });
    const tree = render(<FAB onPress={jest.fn()} />);
    const style = flattenStyle(tree.getByRole('button').props.style);
    expect(style.shadowColor).toBe(ACCENTS.orange);
  });

  test('default icon is lucide Plus, white per palette.on.accent', () => {
    const tree = render(<FAB onPress={jest.fn()} />);
    const plus = tree.UNSAFE_getByType(Plus);
    expect(plus.props.color).toBe('#FFFFFF');
  });

  test('icon prop overrides the default Plus', () => {
    const tree = render(
      <FAB onPress={jest.fn()} icon={<Text testID="custom">★</Text>} />,
    );
    expect(tree.getByTestId('custom')).toBeTruthy();
    expect(tree.UNSAFE_queryAllByType(Plus)).toHaveLength(0);
  });

  test('press fires onPress', () => {
    const onPress = jest.fn();
    const tree = render(<FAB onPress={onPress} />);
    fireEvent.press(tree.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('size override scales dimensions and icon', () => {
    const tree = render(<FAB onPress={jest.fn()} size={72} />);
    const style = flattenStyle(tree.getByRole('button').props.style);
    expect(style.width).toBe(72);
    expect(style.height).toBe(72);
    expect(style.borderRadius).toBe(36);
    const plus = tree.UNSAFE_getByType(Plus);
    expect(plus.props.size).toBe(32); // round(72 * 24/54) = round(32) = 32
  });

  test('accessibilityLabel passes through', () => {
    const tree = render(<FAB onPress={jest.fn()} accessibilityLabel="Add spot" />);
    expect(tree.getByRole('button').props.accessibilityLabel).toBe('Add spot');
  });
});
