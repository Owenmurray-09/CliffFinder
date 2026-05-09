import { fireEvent, render } from '@testing-library/react-native';
import { Star } from 'lucide-react-native';
import { StarRow } from '../StarRow';
import { useThemeStore } from '@/theme/store';

beforeEach(() => {
  useThemeStore.setState({ dark: false, accent: 'blue' });
});

describe('<StarRow />', () => {
  test('renders max stars (default 5)', () => {
    const tree = render(<StarRow value={3} />);
    expect(tree.UNSAFE_getAllByType(Star)).toHaveLength(5);
  });

  test('value=3: first 3 stars filled with readonly color, last 2 outlined', () => {
    const tree = render(<StarRow value={3} />);
    const stars = tree.UNSAFE_getAllByType(Star);
    expect(stars[0]!.props.fill).toBe('#C9A227');
    expect(stars[1]!.props.fill).toBe('#C9A227');
    expect(stars[2]!.props.fill).toBe('#C9A227');
    expect(stars[3]!.props.fill).toBe('transparent');
    expect(stars[4]!.props.fill).toBe('transparent');
  });

  test('interactive (onValueChange) uses interactive star color', () => {
    const tree = render(<StarRow value={3} onValueChange={jest.fn()} />);
    const stars = tree.UNSAFE_getAllByType(Star);
    expect(stars[0]!.props.fill).toBe('#E8B742');
  });

  test('readonly={true} forces readonly color even if onValueChange is provided', () => {
    const tree = render(<StarRow value={3} onValueChange={jest.fn()} readonly />);
    const stars = tree.UNSAFE_getAllByType(Star);
    expect(stars[0]!.props.fill).toBe('#C9A227');
  });

  test('tap on star at index i fires onValueChange(i + 1)', () => {
    const onValueChange = jest.fn();
    const tree = render(
      <StarRow testID="row" value={1} onValueChange={onValueChange} />,
    );
    fireEvent.press(tree.getByTestId('row-star-2'));
    expect(onValueChange).toHaveBeenCalledWith(3);
  });

  test('value=0 renders all stars stroked-only', () => {
    const tree = render(<StarRow value={0} />);
    const stars = tree.UNSAFE_getAllByType(Star);
    for (const s of stars) {
      expect(s.props.fill).toBe('transparent');
    }
  });

  test('value=max renders all stars filled', () => {
    const tree = render(<StarRow value={5} />);
    const stars = tree.UNSAFE_getAllByType(Star);
    for (const s of stars) {
      expect(s.props.fill).toBe('#C9A227');
    }
  });

  test('size override propagates to star icons', () => {
    const tree = render(<StarRow value={3} size={32} />);
    expect(tree.UNSAFE_getAllByType(Star)[0]!.props.size).toBe(32);
  });

  test('row has flexDirection row + gap 3', () => {
    const tree = render(<StarRow testID="row" value={3} />);
    const style = tree.getByTestId('row').props.style;
    const flat = (Array.isArray(style) ? Object.assign({}, ...style) : style) as Record<
      string,
      unknown
    >;
    expect(flat.flexDirection).toBe('row');
    expect(flat.gap).toBe(3);
  });

  test('accessibilityLabel includes the rating', () => {
    const tree = render(<StarRow testID="row" value={3} max={5} />);
    expect(tree.getByTestId('row').props.accessibilityLabel).toBe('Rating 3 of 5');
  });

  test('non-interactive: tap on star is a no-op (no Pressable wrappers)', () => {
    const tree = render(<StarRow testID="row" value={3} />);
    // Pressables only rendered in interactive mode
    expect(tree.queryByTestId('row-star-2')).toBeNull();
  });
});
