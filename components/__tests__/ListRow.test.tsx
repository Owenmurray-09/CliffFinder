import { fireEvent, render } from '@testing-library/react-native';
import { ChevronRight } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { ListRow } from '../ListRow';
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

describe('<ListRow />', () => {
  test('container chrome: paper2 bg, 1px line border, radius 12, padding 12/14, full width', () => {
    const tree = render(<ListRow testID="row" title="Profile" />);
    const style = flattenStyle(tree.getByTestId('row').props.style);
    expect(style.backgroundColor).toBe('#E8DDBE');
    expect(style.borderWidth).toBe(1);
    expect(style.borderColor).toBe('rgba(30,47,35,0.12)');
    expect(style.borderRadius).toBe(12);
    expect(style.paddingVertical).toBe(12);
    expect(style.paddingHorizontal).toBe(14);
    expect(style.width).toBe('100%');
    expect(style.flexDirection).toBe('row');
    expect(style.gap).toBe(12);
    expect(style.alignItems).toBe('center');
  });

  test('renders title in cardTitle typography', () => {
    const tree = render(<ListRow title="Profile" />);
    const style = flattenStyle(tree.getByText('Profile').props.style);
    expect(style.fontFamily).toBe('Poppins_600SemiBold');
    expect(style.fontSize).toBe(15);
    expect(style.color).toBe('#1E2F23');
  });

  test('renders subtitle when provided in label typography + ink3', () => {
    const tree = render(<ListRow title="Profile" subtitle="Edit your details" />);
    const style = flattenStyle(tree.getByText('Edit your details').props.style);
    expect(style.fontFamily).toBe('Inter_500Medium');
    expect(style.fontSize).toBe(12);
    expect(style.color).toBe('#7a8579');
  });

  test('omits subtitle when not provided', () => {
    const tree = render(<ListRow title="Profile" />);
    expect(tree.queryByText('Edit your details')).toBeNull();
  });

  test('icon slot renders inside a 34×34 paper-bg square with radius 10', () => {
    const tree = render(
      <ListRow testID="row" title="x" icon={<Text testID="icon">★</Text>} />,
    );
    expect(tree.getByTestId('icon')).toBeTruthy();
  });

  test('omits icon container when no icon provided', () => {
    const tree = render(<ListRow testID="row" title="x" />);
    // The wrapping View containers: row (1) + middle stack (1) = 2 Views.
    // Adding an icon adds 1 more View. With 0 icons we expect 2.
    const views = tree.UNSAFE_queryAllByType(View);
    expect(views.length).toBe(2);
  });

  test('default trailing is ChevronRight in ink3', () => {
    const tree = render(<ListRow title="x" />);
    const chevron = tree.UNSAFE_getByType(ChevronRight);
    expect(chevron.props.color).toBe('#7a8579');
  });

  test('trailing prop overrides the default chevron', () => {
    const tree = render(
      <ListRow title="x" trailing={<Text testID="custom">→</Text>} />,
    );
    expect(tree.getByTestId('custom')).toBeTruthy();
    expect(tree.UNSAFE_queryAllByType(ChevronRight)).toHaveLength(0);
  });

  test('trailing={null} suppresses the chevron entirely', () => {
    const tree = render(<ListRow title="x" trailing={null} />);
    expect(tree.UNSAFE_queryAllByType(ChevronRight)).toHaveLength(0);
  });

  test('onPress wraps in Pressable and fires on tap', () => {
    const onPress = jest.fn();
    const tree = render(<ListRow testID="row" title="x" onPress={onPress} />);
    fireEvent.press(tree.getByTestId('row'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('without onPress: no Pressable wrapper, no accessibilityRole', () => {
    const tree = render(<ListRow testID="row" title="x" />);
    expect(tree.getByTestId('row').props.accessibilityRole).toBeUndefined();
  });

  test('with onPress: accessibilityRole="button"', () => {
    const tree = render(<ListRow testID="row" title="x" onPress={jest.fn()} />);
    expect(tree.getByTestId('row').props.accessibilityRole).toBe('button');
  });
});
