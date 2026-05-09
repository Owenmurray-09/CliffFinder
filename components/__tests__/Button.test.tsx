import { fireEvent, render } from '@testing-library/react-native';
import { ActivityIndicator, View } from 'react-native';
import { Button } from '../Button';
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

describe('<Button /> — press behavior', () => {
  test('press fires onPress in normal state', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button label="Sign in" onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('press is a no-op when busy', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button label="Sign in" onPress={onPress} busy />);
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  test('press is a no-op when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button label="Sign in" onPress={onPress} disabled />);
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('<Button /> — busy + disabled states', () => {
  test('busy state shows ActivityIndicator and hides the label', () => {
    const { UNSAFE_queryAllByType, queryByText } = render(<Button label="Sign in" busy />);
    expect(UNSAFE_queryAllByType(ActivityIndicator).length).toBe(1);
    expect(queryByText('Sign in')).toBeNull();
  });

  test('non-busy state shows label and no ActivityIndicator', () => {
    const { UNSAFE_queryAllByType, queryByText } = render(<Button label="Sign in" />);
    expect(UNSAFE_queryAllByType(ActivityIndicator).length).toBe(0);
    expect(queryByText('Sign in')).not.toBeNull();
  });

  test('disabled drops root opacity to 0.5', () => {
    const { getByRole } = render(<Button label="Sign in" disabled />);
    const style = flattenStyle(getByRole('button').props.style);
    expect(style.opacity).toBe(0.5);
  });

  test('non-disabled has opacity 1', () => {
    const { getByRole } = render(<Button label="Sign in" />);
    const style = flattenStyle(getByRole('button').props.style);
    expect(style.opacity).toBe(1);
  });
});

describe('<Button /> — variants', () => {
  test('primary fills with the resolved accent and uses on.accent label color', () => {
    const { getByRole, getByText } = render(<Button label="Sign in" variant="primary" />);
    const rootStyle = flattenStyle(getByRole('button').props.style);
    const labelStyle = flattenStyle(getByText('Sign in').props.style);
    expect(rootStyle.backgroundColor).toBe(ACCENTS.blue);
    expect(labelStyle.color).toBe('#FFFFFF');
  });

  test('primary respects accent changes (orange)', () => {
    useThemeStore.setState({ dark: false, accent: 'orange' });
    const { getByRole } = render(<Button label="Sign in" variant="primary" />);
    const rootStyle = flattenStyle(getByRole('button').props.style);
    expect(rootStyle.backgroundColor).toBe(ACCENTS.orange);
  });

  test('ghost reuses sheetSoft alpha overlay, ink label', () => {
    const { getByRole, getByText } = render(<Button label="Cancel" variant="ghost" />);
    const rootStyle = flattenStyle(getByRole('button').props.style);
    const labelStyle = flattenStyle(getByText('Cancel').props.style);
    expect(rootStyle.backgroundColor).toBe('rgba(30,47,35,0.06)');
    expect(labelStyle.color).toBe('#1E2F23');
  });

  test('ghost flips to dark sheetSoft in dark mode', () => {
    useThemeStore.setState({ dark: true, accent: 'blue' });
    const { getByRole } = render(<Button label="Cancel" variant="ghost" />);
    const rootStyle = flattenStyle(getByRole('button').props.style);
    expect(rootStyle.backgroundColor).toBe('rgba(234,226,200,0.08)');
  });

  test('outline has transparent bg, 1.5px line border, ink label', () => {
    const { getByRole, getByText } = render(<Button label="Create account" variant="outline" />);
    const rootStyle = flattenStyle(getByRole('button').props.style);
    const labelStyle = flattenStyle(getByText('Create account').props.style);
    expect(rootStyle.backgroundColor).toBe('transparent');
    expect(rootStyle.borderWidth).toBe(1.5);
    expect(rootStyle.borderColor).toBe('rgba(30,47,35,0.12)');
    expect(labelStyle.color).toBe('#1E2F23');
  });

  test('link has transparent bg, accent label, weight 600, smaller padding', () => {
    const { getByRole, getByText } = render(<Button label="Forgot password?" variant="link" />);
    const rootStyle = flattenStyle(getByRole('button').props.style);
    const labelStyle = flattenStyle(getByText('Forgot password?').props.style);
    expect(rootStyle.backgroundColor).toBe('transparent');
    expect(rootStyle.paddingHorizontal).toBe(8);
    expect(rootStyle.paddingVertical).toBe(6);
    expect(labelStyle.color).toBe(ACCENTS.blue);
    expect(labelStyle.fontWeight).toBe('600');
  });

  test('default variant is primary', () => {
    const { getByRole } = render(<Button label="Sign in" />);
    const rootStyle = flattenStyle(getByRole('button').props.style);
    expect(rootStyle.backgroundColor).toBe(ACCENTS.blue);
  });

  test('non-link variants use radius.card (14) and 13/18 padding', () => {
    const { getByRole } = render(<Button label="Sign in" variant="primary" />);
    const rootStyle = flattenStyle(getByRole('button').props.style);
    expect(rootStyle.borderRadius).toBe(14);
    expect(rootStyle.paddingVertical).toBe(13);
    expect(rootStyle.paddingHorizontal).toBe(18);
  });

  test('link variant has radius.card (14) so a future hover/pressed bg rounds correctly', () => {
    const { getByRole } = render(<Button label="link" variant="link" />);
    const rootStyle = flattenStyle(getByRole('button').props.style);
    expect(rootStyle.borderRadius).toBe(14);
  });
});

describe('<Button /> — accessibility + structure', () => {
  test('exposes accessibilityRole="button"', () => {
    const { getByRole } = render(<Button label="Sign in" />);
    expect(getByRole('button')).toBeTruthy();
  });

  test('accessibilityState reflects busy + disabled flags', () => {
    // RN's Pressable sets `disabled: true` whenever `Pressable.disabled` is
    // true, so a busy button is also reported as disabled to assistive tech
    // (correct UX: the press won't work right now). Use toMatchObject to
    // assert the flags we set without coupling to RN's auto-populated
    // checked/expanded/selected fields.
    const { getByRole, rerender } = render(<Button label="x" busy />);
    expect(getByRole('button').props.accessibilityState).toMatchObject({ busy: true, disabled: true });
    rerender(<Button label="x" disabled />);
    expect(getByRole('button').props.accessibilityState).toMatchObject({ busy: false, disabled: true });
    rerender(<Button label="x" />);
    expect(getByRole('button').props.accessibilityState).toMatchObject({ busy: false, disabled: false });
  });

  test('row layout uses gap from spacing.sm (8)', () => {
    const { getByRole } = render(<Button label="Sign in" />);
    const rootStyle = flattenStyle(getByRole('button').props.style);
    expect(rootStyle.flexDirection).toBe('row');
    expect(rootStyle.gap).toBe(8);
    expect(rootStyle.alignItems).toBe('center');
    expect(rootStyle.justifyContent).toBe('center');
  });

  test('icon renders alongside the label when provided', () => {
    const { getByTestId, getByText } = render(
      <Button label="Save" icon={<View testID="icon" />} />,
    );
    expect(getByTestId('icon')).toBeTruthy();
    expect(getByText('Save')).toBeTruthy();
  });

  test('icon and label are both replaced by the spinner when busy', () => {
    const { queryByTestId, UNSAFE_queryAllByType, queryByText } = render(
      <Button label="Save" busy icon={<View testID="icon" />} />,
    );
    expect(queryByTestId('icon')).toBeNull();
    expect(queryByText('Save')).toBeNull();
    expect(UNSAFE_queryAllByType(ActivityIndicator).length).toBe(1);
  });
});
