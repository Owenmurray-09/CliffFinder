import { fireEvent, render } from '@testing-library/react-native';
import { Search, X } from 'lucide-react-native';
import { TextInput } from 'react-native';
import { SearchBar } from '../SearchBar';
import { useThemeStore } from '@/theme/store';

beforeEach(() => {
  useThemeStore.setState({ dark: false, accent: 'blue' });
});

describe('<SearchBar />', () => {
  test('renders placeholder', () => {
    const tree = render(<SearchBar value="" onChangeText={jest.fn()} placeholder="Find spots" />);
    expect(tree.UNSAFE_getByType(TextInput).props.placeholder).toBe('Find spots');
  });

  test('default placeholder is "Search"', () => {
    const tree = render(<SearchBar value="" onChangeText={jest.fn()} />);
    expect(tree.UNSAFE_getByType(TextInput).props.placeholder).toBe('Search');
  });

  test('typing fires onChangeText', () => {
    const onChangeText = jest.fn();
    const tree = render(<SearchBar value="" onChangeText={onChangeText} />);
    fireEvent.changeText(tree.UNSAFE_getByType(TextInput), 'squamish');
    expect(onChangeText).toHaveBeenCalledWith('squamish');
  });

  test('search icon (lucide Search) renders, ink2 color, size 20', () => {
    const tree = render(<SearchBar value="" onChangeText={jest.fn()} />);
    const icon = tree.UNSAFE_getByType(Search);
    expect(icon.props.size).toBe(20);
    expect(icon.props.color).toBe('#3a4a3e');
  });

  test('clear (X) button hidden when value is empty', () => {
    const tree = render(<SearchBar value="" onChangeText={jest.fn()} />);
    expect(tree.UNSAFE_queryAllByType(X)).toHaveLength(0);
  });

  test('clear button shows when value is non-empty', () => {
    const tree = render(<SearchBar value="abc" onChangeText={jest.fn()} />);
    expect(tree.UNSAFE_getAllByType(X)).toHaveLength(1);
  });

  test('clear button fires onChangeText("") and onClear', () => {
    const onChangeText = jest.fn();
    const onClear = jest.fn();
    const tree = render(
      <SearchBar value="abc" onChangeText={onChangeText} onClear={onClear} />,
    );
    fireEvent.press(tree.getByLabelText('Clear search'));
    expect(onChangeText).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalled();
  });

  test('TextInput uses Inter / 14 + ink color', () => {
    const tree = render(<SearchBar value="abc" onChangeText={jest.fn()} />);
    const inputStyle = tree.UNSAFE_getByType(TextInput).props.style;
    const flat = (Array.isArray(inputStyle) ? Object.assign({}, ...inputStyle) : inputStyle) as Record<
      string,
      unknown
    >;
    expect(flat.fontFamily).toBe('Inter_400Regular');
    expect(flat.fontSize).toBe(14);
    expect(flat.color).toBe('#1E2F23');
  });

  test('TextInput has accessibilityLabel="Search"', () => {
    const tree = render(<SearchBar value="" onChangeText={jest.fn()} />);
    expect(tree.UNSAFE_getByType(TextInput).props.accessibilityLabel).toBe('Search');
  });
});
