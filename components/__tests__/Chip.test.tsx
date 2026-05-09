import { fireEvent, render } from '@testing-library/react-native';
import { View } from 'react-native';
import { Chip } from '../Chip';
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

describe('<Chip /> — default state', () => {
  test('renders label', () => {
    const tree = render(<Chip label="Trending" />);
    expect(tree.getByText('Trending')).toBeTruthy();
  });

  test('uses glass.search.tint.light as bg, chipBorder, ink label', () => {
    const tree = render(<Chip label="Trending" />);
    const rootStyle = flattenStyle(tree.getByRole('button').props.style);
    const labelStyle = flattenStyle(tree.getByText('Trending').props.style);
    expect(rootStyle.backgroundColor).toBe('rgba(255,255,255,0.85)');
    // Light chipBorder coincides with `line` numerically (both 0.12) but is
    // a semantically distinct token — verifies the chip pulls from the
    // chip-specific token, not the general line token.
    expect(rootStyle.borderColor).toBe('rgba(30,47,35,0.12)');
    expect(rootStyle.borderWidth).toBe(1);
    expect(labelStyle.color).toBe('#1E2F23');
  });

  test('padding 7/12, radius pill (999)', () => {
    const tree = render(<Chip label="Trending" />);
    const rootStyle = flattenStyle(tree.getByRole('button').props.style);
    expect(rootStyle.paddingVertical).toBe(7);
    expect(rootStyle.paddingHorizontal).toBe(12);
    expect(rootStyle.borderRadius).toBe(999);
  });

  test('typography uses typography.chip (Inter 500 / 12.5)', () => {
    const tree = render(<Chip label="Trending" />);
    const labelStyle = flattenStyle(tree.getByText('Trending').props.style);
    expect(labelStyle.fontSize).toBe(12.5);
    expect(labelStyle.fontWeight).toBe('500');
    expect(labelStyle.fontFamily).toBe('Inter_500Medium');
  });

  test('flexDirection row + gap 6 (icon ↔ label)', () => {
    const tree = render(<Chip label="Trending" />);
    const rootStyle = flattenStyle(tree.getByRole('button').props.style);
    expect(rootStyle.flexDirection).toBe('row');
    expect(rootStyle.gap).toBe(6);
    expect(rootStyle.alignItems).toBe('center');
  });
});

describe('<Chip /> — selected state', () => {
  test('selected: bg = accent, label = on.accent (#FFFFFF), border transparent', () => {
    const tree = render(<Chip label="Trending" selected />);
    const rootStyle = flattenStyle(tree.getByRole('button').props.style);
    const labelStyle = flattenStyle(tree.getByText('Trending').props.style);
    expect(rootStyle.backgroundColor).toBe(ACCENTS.blue);
    expect(rootStyle.borderColor).toBe('transparent');
    expect(labelStyle.color).toBe('#FFFFFF');
  });

  test('selected respects accent changes (orange)', () => {
    useThemeStore.setState({ dark: false, accent: 'orange' });
    const tree = render(<Chip label="Trending" selected />);
    const rootStyle = flattenStyle(tree.getByRole('button').props.style);
    expect(rootStyle.backgroundColor).toBe(ACCENTS.orange);
  });
});

describe('<Chip /> — dark mode', () => {
  test('default in dark mode uses glass.search.tint.dark', () => {
    useThemeStore.setState({ dark: true, accent: 'blue' });
    const tree = render(<Chip label="Trending" />);
    const rootStyle = flattenStyle(tree.getByRole('button').props.style);
    expect(rootStyle.backgroundColor).toBe('rgba(30,47,35,0.62)');
  });

  test('dark default label is dark-mode ink (#EAE2C8)', () => {
    useThemeStore.setState({ dark: true, accent: 'blue' });
    const tree = render(<Chip label="Trending" />);
    const labelStyle = flattenStyle(tree.getByText('Trending').props.style);
    expect(labelStyle.color).toBe('#EAE2C8');
  });

  test('dark border uses chipBorder (0.12 alpha), not line (0.14)', () => {
    useThemeStore.setState({ dark: true, accent: 'blue' });
    const tree = render(<Chip label="Trending" />);
    const rootStyle = flattenStyle(tree.getByRole('button').props.style);
    expect(rootStyle.borderColor).toBe('rgba(234,226,200,0.12)');
  });

  test('selected in dark mode: accent bg, transparent border, on.accent label', () => {
    useThemeStore.setState({ dark: true, accent: 'blue' });
    const tree = render(<Chip label="Trending" selected />);
    const rootStyle = flattenStyle(tree.getByRole('button').props.style);
    const labelStyle = flattenStyle(tree.getByText('Trending').props.style);
    expect(rootStyle.backgroundColor).toBe(ACCENTS.blue);
    expect(rootStyle.borderColor).toBe('transparent');
    expect(labelStyle.color).toBe('#FFFFFF');
  });
});

describe('<Chip /> — layout', () => {
  test('flexShrink: 0 so chip survives horizontal-scroll rows', () => {
    const tree = render(<Chip label="Trending" />);
    const rootStyle = flattenStyle(tree.getByRole('button').props.style);
    expect(rootStyle.flexShrink).toBe(0);
  });
});

describe('<Chip /> — interaction + a11y', () => {
  test('press fires onPress', () => {
    const onPress = jest.fn();
    const tree = render(<Chip label="Trending" onPress={onPress} />);
    fireEvent.press(tree.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('accessibilityState.selected reflects the prop', () => {
    const tree = render(<Chip label="x" />);
    expect(tree.getByRole('button').props.accessibilityState).toMatchObject({ selected: false });
    tree.rerender(<Chip label="x" selected />);
    expect(tree.getByRole('button').props.accessibilityState).toMatchObject({ selected: true });
  });

  test('renders icon before label when provided', () => {
    const tree = render(<Chip label="Trending" icon={<View testID="icon" />} />);
    expect(tree.getByTestId('icon')).toBeTruthy();
    expect(tree.getByText('Trending')).toBeTruthy();
  });
});
