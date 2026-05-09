import { fireEvent, render } from '@testing-library/react-native';
import { SegmentedControl } from '../SegmentedControl';
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

describe('<SegmentedControl />', () => {
  test('renders all options as labels', () => {
    const tree = render(
      <SegmentedControl options={['Visited', 'Saved']} value="Visited" onValueChange={jest.fn()} />,
    );
    expect(tree.getByText('Visited')).toBeTruthy();
    expect(tree.getByText('Saved')).toBeTruthy();
  });

  test('selected option: ink bg + onInk text color (paper)', () => {
    const tree = render(
      <SegmentedControl options={['Visited', 'Saved']} value="Visited" onValueChange={jest.fn()} />,
    );
    const [selectedTab] = tree.getAllByRole('tab');
    const tabStyle = flattenStyle((selectedTab as any).props.style);
    const labelStyle = flattenStyle(tree.getByText('Visited').props.style);
    expect(tabStyle.backgroundColor).toBe('#1E2F23');
    expect(labelStyle.color).toBe('#F2EAD0');
  });

  test('non-selected option: transparent bg + ink2 color', () => {
    const tree = render(
      <SegmentedControl options={['Visited', 'Saved']} value="Visited" onValueChange={jest.fn()} />,
    );
    const tabs = tree.getAllByRole('tab');
    const tabStyle = flattenStyle((tabs[1] as any).props.style);
    const labelStyle = flattenStyle(tree.getByText('Saved').props.style);
    expect(tabStyle.backgroundColor).toBe('transparent');
    expect(labelStyle.color).toBe('#3a4a3e');
  });

  test('press fires onValueChange with the selected value', () => {
    const onValueChange = jest.fn();
    const tree = render(
      <SegmentedControl
        options={['Visited', 'Saved']}
        value="Visited"
        onValueChange={onValueChange}
      />,
    );
    fireEvent.press(tree.getByText('Saved'));
    expect(onValueChange).toHaveBeenCalledWith('Saved');
  });

  test('object option shape: label and value differ', () => {
    const onValueChange = jest.fn();
    const tree = render(
      <SegmentedControl
        options={[
          { label: 'Photos', value: 'photos' },
          { label: 'Reviews', value: 'reviews' },
        ]}
        value="photos"
        onValueChange={onValueChange}
      />,
    );
    expect(tree.getByText('Photos')).toBeTruthy();
    fireEvent.press(tree.getByText('Reviews'));
    expect(onValueChange).toHaveBeenCalledWith('reviews');
  });

  test('container: paper2 bg, 1px line border, radius 12, padding 3, gap 2, flex row', () => {
    const tree = render(
      <SegmentedControl
        testID="seg"
        options={['A', 'B']}
        value="A"
        onValueChange={jest.fn()}
      />,
    );
    const style = flattenStyle(tree.getByTestId('seg').props.style);
    expect(style.backgroundColor).toBe('#E8DDBE');
    expect(style.borderWidth).toBe(1);
    expect(style.borderColor).toBe('rgba(30,47,35,0.12)');
    expect(style.borderRadius).toBe(12);
    expect(style.padding).toBe(3);
    expect(style.gap).toBe(2);
    expect(style.flexDirection).toBe('row');
  });

  test('selected tab radius 9, padding 7/14', () => {
    const tree = render(
      <SegmentedControl
        options={['A', 'B']}
        value="A"
        onValueChange={jest.fn()}
      />,
    );
    const [tab] = tree.getAllByRole('tab');
    const tabStyle = flattenStyle((tab as any).props.style);
    expect(tabStyle.borderRadius).toBe(9);
    expect(tabStyle.paddingVertical).toBe(7);
    expect(tabStyle.paddingHorizontal).toBe(14);
  });

  test('label typography: Poppins 600 / 13', () => {
    const tree = render(
      <SegmentedControl options={['A']} value="A" onValueChange={jest.fn()} />,
    );
    const labelStyle = flattenStyle(tree.getByText('A').props.style);
    expect(labelStyle.fontFamily).toBe('Poppins_600SemiBold');
    expect(labelStyle.fontWeight).toBe('600');
    expect(labelStyle.fontSize).toBe(13);
  });

  test('accessibilityState.selected reflects the value', () => {
    const tree = render(
      <SegmentedControl options={['A', 'B']} value="A" onValueChange={jest.fn()} />,
    );
    const [tabA, tabB] = tree.getAllByRole('tab');
    expect((tabA as any).props.accessibilityState).toMatchObject({ selected: true });
    expect((tabB as any).props.accessibilityState).toMatchObject({ selected: false });
  });

  test('dark mode: selected text uses dark paper as onInk', () => {
    useThemeStore.setState({ dark: true, accent: 'blue' });
    const tree = render(
      <SegmentedControl options={['A', 'B']} value="A" onValueChange={jest.fn()} />,
    );
    const labelStyle = flattenStyle(tree.getByText('A').props.style);
    // In dark mode, palette.paper = '#0F1A14', so onInk = '#0F1A14'
    expect(labelStyle.color).toBe('#0F1A14');
  });
});
