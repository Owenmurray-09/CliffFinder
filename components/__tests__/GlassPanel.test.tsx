import { render } from '@testing-library/react-native';
import { BlurView } from 'expo-blur';
import { Text } from 'react-native';
import { GlassPanel } from '../GlassPanel';
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

describe('<GlassPanel /> — wrapping View', () => {
  test('default: glassBorder color, 1px border, overflow hidden', () => {
    const tree = render(
      <GlassPanel testID="glass">
        <Text>x</Text>
      </GlassPanel>,
    );
    const style = flattenStyle(tree.getByTestId('glass').props.style);
    expect(style.borderColor).toBe('rgba(30,47,35,0.08)');
    expect(style.borderWidth).toBe(1);
    expect(style.overflow).toBe('hidden');
  });

  test('dark mode flips border to dark glassBorder (0.12 alpha)', () => {
    useThemeStore.setState({ dark: true, accent: 'blue' });
    const tree = render(
      <GlassPanel testID="glass">
        <Text>x</Text>
      </GlassPanel>,
    );
    const style = flattenStyle(tree.getByTestId('glass').props.style);
    expect(style.borderColor).toBe('rgba(234,226,200,0.12)');
  });

  test('style passthrough applies to wrapper (caller sets borderRadius)', () => {
    const tree = render(
      <GlassPanel testID="glass" style={{ borderRadius: 22 }}>
        <Text>x</Text>
      </GlassPanel>,
    );
    const style = flattenStyle(tree.getByTestId('glass').props.style);
    expect(style.borderRadius).toBe(22);
  });
});

describe('<GlassPanel /> — BlurView intensity per variant', () => {
  test('search variant uses intensity 24', () => {
    const tree = render(<GlassPanel variant="search"><Text>x</Text></GlassPanel>);
    const blur = tree.UNSAFE_getByType(BlurView);
    expect(blur.props.intensity).toBe(24);
  });

  test('topbar variant uses intensity 18', () => {
    const tree = render(<GlassPanel variant="topbar"><Text>x</Text></GlassPanel>);
    const blur = tree.UNSAFE_getByType(BlurView);
    expect(blur.props.intensity).toBe(18);
  });

  test('tabBar variant uses intensity 20', () => {
    const tree = render(<GlassPanel variant="tabBar"><Text>x</Text></GlassPanel>);
    const blur = tree.UNSAFE_getByType(BlurView);
    expect(blur.props.intensity).toBe(20);
  });

  test('default variant is search', () => {
    const tree = render(<GlassPanel><Text>x</Text></GlassPanel>);
    const blur = tree.UNSAFE_getByType(BlurView);
    expect(blur.props.intensity).toBe(24);
  });

  test('BlurView tint resolves from dark mode', () => {
    const tree = render(<GlassPanel><Text>x</Text></GlassPanel>);
    expect(tree.UNSAFE_getByType(BlurView).props.tint).toBe('light');
    useThemeStore.setState({ dark: true, accent: 'blue' });
    const tree2 = render(<GlassPanel><Text>x</Text></GlassPanel>);
    expect(tree2.UNSAFE_getByType(BlurView).props.tint).toBe('dark');
  });
});

describe('<GlassPanel /> — children', () => {
  test('renders children above the blur layer', () => {
    const tree = render(
      <GlassPanel>
        <Text>search input</Text>
      </GlassPanel>,
    );
    expect(tree.getByText('search input')).toBeTruthy();
  });
});

describe('<GlassPanel /> — composition invariants', () => {
  test('BlurView is positioned absolutely covering the full surface', () => {
    const tree = render(<GlassPanel><Text>x</Text></GlassPanel>);
    const blurStyle = flattenStyle(tree.UNSAFE_getByType(BlurView).props.style);
    expect(blurStyle.position).toBe('absolute');
    expect(blurStyle.top).toBe(0);
    expect(blurStyle.bottom).toBe(0);
    expect(blurStyle.left).toBe(0);
    expect(blurStyle.right).toBe(0);
  });

  test('wrapper View has no backgroundColor (so the blur shows through)', () => {
    const tree = render(<GlassPanel testID="glass"><Text>x</Text></GlassPanel>);
    const style = flattenStyle(tree.getByTestId('glass').props.style);
    expect(style.backgroundColor).toBeUndefined();
  });
});
