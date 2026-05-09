import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { EmptyState } from '../EmptyState';
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

describe('<EmptyState />', () => {
  test('renders message text', () => {
    const tree = render(<EmptyState message="No jumps yet." />);
    expect(tree.getByText('No jumps yet.')).toBeTruthy();
  });

  test('renders icon when provided', () => {
    const tree = render(
      <EmptyState icon={<Text testID="icon">📭</Text>} message="x" />,
    );
    expect(tree.getByTestId('icon')).toBeTruthy();
  });

  test('renders title when provided', () => {
    const tree = render(<EmptyState title="No spots saved" message="x" />);
    expect(tree.getByText('No spots saved')).toBeTruthy();
  });

  test('omits title when not provided', () => {
    const tree = render(<EmptyState message="x" />);
    expect(tree.queryByText('No spots saved')).toBeNull();
  });

  test('layout: align center, gap 10, padding 18, maxWidth 240', () => {
    const tree = render(<EmptyState testID="empty" message="x" />);
    const style = flattenStyle(tree.getByTestId('empty').props.style);
    expect(style.alignItems).toBe('center');
    expect(style.gap).toBe(10);
    expect(style.padding).toBe(18);
    expect(style.maxWidth).toBe(240);
  });

  test('message typography: Inter / 13, lineHeight 1.5×, ink3, center', () => {
    const tree = render(<EmptyState message="No jumps yet." />);
    const style = flattenStyle(tree.getByText('No jumps yet.').props.style);
    expect(style.fontFamily).toBe('Inter_400Regular');
    expect(style.fontSize).toBe(13);
    expect(style.lineHeight).toBe(19.5);
    expect(style.color).toBe('#7a8579');
    expect(style.textAlign).toBe('center');
  });

  test('dark mode: message color flips to dark ink3', () => {
    useThemeStore.setState({ dark: true, accent: 'blue' });
    const tree = render(<EmptyState message="x" />);
    const style = flattenStyle(tree.getByText('x').props.style);
    expect(style.color).toBe('#9AB096');
  });
});
