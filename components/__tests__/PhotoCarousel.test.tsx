import { fireEvent, render } from '@testing-library/react-native';
import { Image } from 'react-native';
import { PhotoCarousel } from '../PhotoCarousel';

const PHOTOS = [
  'https://example.com/1.jpg',
  'https://example.com/2.jpg',
  'https://example.com/3.jpg',
  'https://example.com/4.jpg',
];

const layout = (tree: ReturnType<typeof render>, testID: string, width: number, height = 280) => {
  fireEvent(tree.getByTestId(testID), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width, height } },
  });
};

describe('<PhotoCarousel />', () => {
  test('renders all photos as Images after layout', () => {
    const tree = render(<PhotoCarousel testID="pc" photos={PHOTOS} />);
    layout(tree, 'pc', 360);
    expect(tree.UNSAFE_getAllByType(Image)).toHaveLength(PHOTOS.length);
  });

  test('renders correct number of dots (matches photo count)', () => {
    const tree = render(<PhotoCarousel testID="pc" photos={PHOTOS} />);
    const dots = tree.getByTestId('pc-dots');
    expect(dots.children).toHaveLength(PHOTOS.length);
  });

  test('first dot starts as active (initialIndex 0)', () => {
    const tree = render(<PhotoCarousel testID="pc" photos={PHOTOS} />);
    const dots = tree.getByTestId('pc-dots');
    const flat = (s: unknown) =>
      Array.isArray(s) ? Object.assign({}, ...(s as object[])) : (s as Record<string, unknown>);
    const firstStyle = flat((dots.children[0] as any).props.style);
    expect(firstStyle.width).toBe(16);
    expect(firstStyle.backgroundColor).toBe('#FFFFFF');
  });

  test('initialIndex sets the active dot', () => {
    const tree = render(<PhotoCarousel testID="pc" photos={PHOTOS} initialIndex={2} />);
    const dots = tree.getByTestId('pc-dots');
    const flat = (s: unknown) =>
      Array.isArray(s) ? Object.assign({}, ...(s as object[])) : (s as Record<string, unknown>);
    const activeStyle = flat((dots.children[2] as any).props.style);
    expect(activeStyle.width).toBe(16);
    const inactiveStyle = flat((dots.children[0] as any).props.style);
    expect(inactiveStyle.width).toBe(6);
    expect(inactiveStyle.backgroundColor).toBe('rgba(255,255,255,0.5)');
  });

  test('Image source URIs match the photos array', () => {
    const tree = render(<PhotoCarousel testID="pc" photos={PHOTOS} />);
    layout(tree, 'pc', 360);
    const images = tree.UNSAFE_getAllByType(Image);
    expect(images.map((i) => i.props.source.uri)).toEqual(PHOTOS);
  });

  test('default height is 280', () => {
    const tree = render(<PhotoCarousel testID="pc" photos={PHOTOS} />);
    const style = tree.getByTestId('pc').props.style;
    const flat = Array.isArray(style) ? Object.assign({}, ...style) : style;
    expect((flat as any).height).toBe(280);
  });

  test('height override applies', () => {
    const tree = render(<PhotoCarousel testID="pc" photos={PHOTOS} height={420} />);
    const style = tree.getByTestId('pc').props.style;
    const flat = Array.isArray(style) ? Object.assign({}, ...style) : style;
    expect((flat as any).height).toBe(420);
  });
});
