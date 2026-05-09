import { fireEvent, render } from '@testing-library/react-native';
import { Toggle } from '../Toggle';
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

describe('<Toggle />', () => {
  test('value=false: track bg uses palette.line', () => {
    const tree = render(<Toggle value={false} onValueChange={jest.fn()} />);
    const style = flattenStyle(tree.getByRole('switch').props.style);
    expect(style.backgroundColor).toBe('rgba(30,47,35,0.12)');
  });

  test('value=true: track bg uses palette.accent', () => {
    const tree = render(<Toggle value={true} onValueChange={jest.fn()} />);
    const style = flattenStyle(tree.getByRole('switch').props.style);
    expect(style.backgroundColor).toBe(ACCENTS.blue);
  });

  test('track bg respects accent change (orange)', () => {
    useThemeStore.setState({ dark: false, accent: 'orange' });
    const tree = render(<Toggle value={true} onValueChange={jest.fn()} />);
    const style = flattenStyle(tree.getByRole('switch').props.style);
    expect(style.backgroundColor).toBe(ACCENTS.orange);
  });

  test('press fires onValueChange with the inverted value', () => {
    const onValueChange = jest.fn();
    const tree = render(<Toggle value={false} onValueChange={onValueChange} />);
    fireEvent.press(tree.getByRole('switch'));
    expect(onValueChange).toHaveBeenCalledWith(true);
    onValueChange.mockClear();
    tree.rerender(<Toggle value={true} onValueChange={onValueChange} />);
    fireEvent.press(tree.getByRole('switch'));
    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  test('disabled gates the press and drops opacity to 0.5', () => {
    const onValueChange = jest.fn();
    const tree = render(<Toggle value={false} onValueChange={onValueChange} disabled />);
    fireEvent.press(tree.getByRole('switch'));
    expect(onValueChange).not.toHaveBeenCalled();
    const style = flattenStyle(tree.getByRole('switch').props.style);
    expect(style.opacity).toBe(0.5);
  });

  test('non-disabled has opacity 1', () => {
    const tree = render(<Toggle value={false} onValueChange={jest.fn()} />);
    const style = flattenStyle(tree.getByRole('switch').props.style);
    expect(style.opacity).toBe(1);
  });

  test('track is 44×26 with pill radius', () => {
    const tree = render(<Toggle value={false} onValueChange={jest.fn()} />);
    const style = flattenStyle(tree.getByRole('switch').props.style);
    expect(style.width).toBe(44);
    expect(style.height).toBe(26);
    expect(style.borderRadius).toBe(999);
  });

  test('accessibilityState.checked reflects the value', () => {
    const tree = render(<Toggle value={false} onValueChange={jest.fn()} />);
    expect(tree.getByRole('switch').props.accessibilityState).toMatchObject({ checked: false });
    tree.rerender(<Toggle value={true} onValueChange={jest.fn()} />);
    expect(tree.getByRole('switch').props.accessibilityState).toMatchObject({ checked: true });
  });

  test('accessibilityState.disabled reflects the disabled prop', () => {
    const tree = render(<Toggle value={false} onValueChange={jest.fn()} disabled />);
    expect(tree.getByRole('switch').props.accessibilityState).toMatchObject({ disabled: true });
  });

  test('accessibilityLabel passes through (used by Settings rows)', () => {
    const tree = render(
      <Toggle value={false} onValueChange={jest.fn()} accessibilityLabel="Notifications" />,
    );
    expect(tree.getByRole('switch').props.accessibilityLabel).toBe('Notifications');
  });
});
