import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '../Card';
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

describe('<Card />', () => {
  test('uses paper2 bg, 1px line border, radius 16', () => {
    const tree = render(
      <Card testID="card">
        <Text>hi</Text>
      </Card>,
    );
    const style = flattenStyle(tree.getByTestId('card').props.style);
    expect(style.backgroundColor).toBe('#E8DDBE');
    expect(style.borderWidth).toBe(1);
    expect(style.borderColor).toBe('rgba(30,47,35,0.12)');
    expect(style.borderRadius).toBe(16);
  });

  test('padding 18, flex column with gap 14', () => {
    const tree = render(
      <Card testID="card">
        <Text>hi</Text>
      </Card>,
    );
    const style = flattenStyle(tree.getByTestId('card').props.style);
    expect(style.padding).toBe(18);
    expect(style.gap).toBe(14);
    expect(style.flexDirection).toBe('column');
  });

  test('renders children', () => {
    const tree = render(
      <Card>
        <Text>card content</Text>
      </Card>,
    );
    expect(tree.getByText('card content')).toBeTruthy();
  });

  test('dark mode flips bg to paper2-dark', () => {
    useThemeStore.setState({ dark: true, accent: 'blue' });
    const tree = render(
      <Card testID="card">
        <Text>hi</Text>
      </Card>,
    );
    const style = flattenStyle(tree.getByTestId('card').props.style);
    expect(style.backgroundColor).toBe('#1A2820');
  });

  test('style passthrough merges over defaults', () => {
    const tree = render(
      <Card testID="card" style={{ padding: 32 }}>
        <Text>hi</Text>
      </Card>,
    );
    const style = flattenStyle(tree.getByTestId('card').props.style);
    expect(style.padding).toBe(32);
  });
});
