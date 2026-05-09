import { render } from '@testing-library/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { Avatar, avatarMath } from '../Avatar';
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

describe('avatarMath', () => {
  test('extracts uppercase initial', () => {
    expect(avatarMath('alex').initial).toBe('A');
    expect(avatarMath('Alex').initial).toBe('A');
    expect(avatarMath('  alex  ').initial).toBe('A');
  });

  test('empty/missing name → "?" with index 0', () => {
    expect(avatarMath(undefined)).toEqual({ initial: '?', gradientIndex: 0 });
    expect(avatarMath('')).toEqual({ initial: '?', gradientIndex: 0 });
    expect(avatarMath('   ')).toEqual({ initial: '?', gradientIndex: 0 });
  });

  test('same name → same gradientIndex (deterministic)', () => {
    const a = avatarMath('Alex');
    const b = avatarMath('Alex');
    expect(a.gradientIndex).toBe(b.gradientIndex);
  });

  test('different names usually pick different gradients', () => {
    const seen = new Set<number>();
    for (const n of ['Alex', 'Maya', 'Jordan', 'Sasha', 'Noor', 'Leo']) {
      seen.add(avatarMath(n).gradientIndex);
    }
    // 6 names should land on at least 3 distinct gradients
    expect(seen.size).toBeGreaterThanOrEqual(3);
  });

  test('gradientIndex is always within palette bounds (0-5)', () => {
    for (const n of ['Alex', '🎉', 'A', 'verylongname12345', 'B', 'Z']) {
      const { gradientIndex } = avatarMath(n);
      expect(gradientIndex).toBeGreaterThanOrEqual(0);
      expect(gradientIndex).toBeLessThanOrEqual(5);
    }
  });
});

describe('<Avatar /> — name + initial', () => {
  test('renders the initial letter', () => {
    const tree = render(<Avatar name="Alex" />);
    expect(tree.getByText('A')).toBeTruthy();
  });

  test('default size 64, font scales to 22', () => {
    const tree = render(<Avatar testID="a" name="Alex" />);
    const wrapStyle = flattenStyle(tree.getByTestId('a').props.style);
    expect(wrapStyle.width).toBe(64);
    expect(wrapStyle.height).toBe(64);
    expect(wrapStyle.borderRadius).toBe(32);
    const textStyle = flattenStyle(tree.getByText('A').props.style);
    expect(textStyle.fontSize).toBe(22);
  });

  test('size 42 scales font to ~14.4 (proportional to 22 / 64)', () => {
    const tree = render(<Avatar testID="a" name="Maya" size={42} />);
    const wrapStyle = flattenStyle(tree.getByTestId('a').props.style);
    expect(wrapStyle.width).toBe(42);
    expect(wrapStyle.height).toBe(42);
    expect(wrapStyle.borderRadius).toBe(21);
    const textStyle = flattenStyle(tree.getByText('M').props.style);
    expect(textStyle.fontSize).toBeCloseTo(14.4375, 2);
  });

  test('initial color is white', () => {
    const tree = render(<Avatar name="Alex" />);
    const textStyle = flattenStyle(tree.getByText('A').props.style);
    expect(textStyle.color).toBe('#FFFFFF');
  });

  test('border is 3px solid paper', () => {
    const tree = render(<Avatar testID="a" name="Alex" />);
    const wrapStyle = flattenStyle(tree.getByTestId('a').props.style);
    expect(wrapStyle.borderWidth).toBe(3);
    expect(wrapStyle.borderColor).toBe('#F2EAD0');
  });

  test('dark mode flips border to dark paper', () => {
    useThemeStore.setState({ dark: true, accent: 'blue' });
    const tree = render(<Avatar testID="a" name="Alex" />);
    const wrapStyle = flattenStyle(tree.getByTestId('a').props.style);
    expect(wrapStyle.borderColor).toBe('#0F1A14');
  });

  test('empty name renders fallback "?"', () => {
    const tree = render(<Avatar name="" />);
    expect(tree.getByText('?')).toBeTruthy();
  });
});

describe('<Avatar /> — gradient', () => {
  test('gradient prop overrides the hash-picked palette entry', () => {
    const tree = render(<Avatar name="Alex" gradient={['#FF0000', '#000000']} />);
    expect(tree.UNSAFE_getByType(LinearGradient).props.colors).toEqual([
      '#FF0000',
      '#000000',
    ]);
  });

  test('default gradient is picked deterministically from the palette by name', () => {
    const treeA = render(<Avatar name="Alex" />);
    const treeB = render(<Avatar name="Alex" />);
    const a = treeA.UNSAFE_getByType(LinearGradient).props.colors;
    const b = treeB.UNSAFE_getByType(LinearGradient).props.colors;
    expect(a).toEqual(b);
  });
});

describe('<Avatar /> — uri image', () => {
  test('uri renders an Image instead of an initial', () => {
    const tree = render(<Avatar name="Alex" uri="https://example.com/a.jpg" />);
    expect(tree.UNSAFE_getByType(Image).props.source).toEqual({
      uri: 'https://example.com/a.jpg',
    });
    // No initial Text rendered
    expect(tree.queryByText('A')).toBeNull();
  });

  test('image is cropped to circle via overflow hidden + radius', () => {
    const tree = render(
      <Avatar testID="a" name="Alex" uri="https://example.com/a.jpg" size={48} />,
    );
    const wrapStyle = flattenStyle(tree.getByTestId('a').props.style);
    expect(wrapStyle.overflow).toBe('hidden');
    expect(wrapStyle.borderRadius).toBe(24);
  });
});
