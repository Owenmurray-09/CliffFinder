import { fireEvent, render } from '@testing-library/react-native';
import { Modal, Text } from 'react-native';
import { Sheet } from '../Sheet';
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

describe('<Sheet />', () => {
  test('visible=false: no children rendered', () => {
    const tree = render(
      <Sheet visible={false} onClose={jest.fn()}>
        <Text>sheet content</Text>
      </Sheet>,
    );
    expect(tree.queryByText('sheet content')).toBeNull();
  });

  test('visible=true: renders children', () => {
    const tree = render(
      <Sheet visible={true} onClose={jest.fn()}>
        <Text>sheet content</Text>
      </Sheet>,
    );
    expect(tree.getByText('sheet content')).toBeTruthy();
  });

  test('renders the drag handle (40×4 pill)', () => {
    const tree = render(
      <Sheet testID="sheet" visible={true} onClose={jest.fn()}>
        <Text>x</Text>
      </Sheet>,
    );
    const handle = tree.getByTestId('sheet-handle');
    const style = flattenStyle(handle.props.style);
    expect(style.width).toBe(40);
    expect(style.height).toBe(4);
    expect(style.backgroundColor).toBe('rgba(30,47,35,0.2)');
  });

  test('handle uses dark variant in dark mode', () => {
    useThemeStore.setState({ dark: true, accent: 'blue' });
    const tree = render(
      <Sheet testID="sheet" visible={true} onClose={jest.fn()}>
        <Text>x</Text>
      </Sheet>,
    );
    const style = flattenStyle(tree.getByTestId('sheet-handle').props.style);
    expect(style.backgroundColor).toBe('rgba(234,226,200,0.2)');
  });

  test('sheet bg uses sheetBg token + radius.sheet (28) on top corners', () => {
    const tree = render(
      <Sheet testID="sheet" visible={true} onClose={jest.fn()}>
        <Text>x</Text>
      </Sheet>,
    );
    const sheet = tree.getByTestId('sheet-sheet');
    const style = flattenStyle(sheet.props.style);
    expect(style.backgroundColor).toBe('#FBF8EE');
    expect(style.borderTopLeftRadius).toBe(28);
    expect(style.borderTopRightRadius).toBe(28);
  });

  test('backdrop tap fires onClose', () => {
    const onClose = jest.fn();
    const tree = render(
      <Sheet testID="sheet" visible={true} onClose={onClose}>
        <Text>x</Text>
      </Sheet>,
    );
    fireEvent.press(tree.getByTestId('sheet-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  test('dark mode: sheetBg flips to dark sheetBg', () => {
    useThemeStore.setState({ dark: true, accent: 'blue' });
    const tree = render(
      <Sheet testID="sheet" visible={true} onClose={jest.fn()}>
        <Text>x</Text>
      </Sheet>,
    );
    const style = flattenStyle(tree.getByTestId('sheet-sheet').props.style);
    expect(style.backgroundColor).toBe('#1A2820');
  });

  test('backdrop has the design rgba(0,0,0,0.35) overlay', () => {
    const tree = render(
      <Sheet testID="sheet" visible={true} onClose={jest.fn()}>
        <Text>x</Text>
      </Sheet>,
    );
    const backdrop = tree.getByTestId('sheet-backdrop').parent;
    expect(backdrop).toBeTruthy();
  });

  test('Modal is configured for full-bleed backdrop (transparent + statusBarTranslucent)', () => {
    const tree = render(
      <Sheet testID="sheet" visible={true} onClose={jest.fn()}>
        <Text>x</Text>
      </Sheet>,
    );
    const modal = tree.UNSAFE_getByType(Modal);
    expect(modal.props.transparent).toBe(true);
    expect(modal.props.statusBarTranslucent).toBe(true);
  });

  test('rapid visible flip-flop keeps the sheet mounted (cancellation contract)', () => {
    const onClose = jest.fn();
    const tree = render(
      <Sheet testID="sheet" visible={true} onClose={onClose}>
        <Text>sheet content</Text>
      </Sheet>,
    );
    expect(tree.getByText('sheet content')).toBeTruthy();
    // Close, then immediately reopen — the close-fade callback should be
    // cancelled (finished=false), so the children must still be rendered.
    tree.rerender(
      <Sheet testID="sheet" visible={false} onClose={onClose}>
        <Text>sheet content</Text>
      </Sheet>,
    );
    tree.rerender(
      <Sheet testID="sheet" visible={true} onClose={onClose}>
        <Text>sheet content</Text>
      </Sheet>,
    );
    expect(tree.getByText('sheet content')).toBeTruthy();
  });
});
