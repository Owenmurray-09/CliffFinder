import { fireEvent, render } from '@testing-library/react-native';
import { TextInput } from 'react-native';
import { Field } from '../Field';
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

const findField = (root: ReturnType<typeof render>) =>
  root.getByTestId('field-root');

beforeEach(() => {
  useThemeStore.setState({ dark: false, accent: 'blue' });
});

describe('<Field /> — default state', () => {
  test('renders the label using fieldLabel typography (uppercase, letterSpacing 0.6)', () => {
    const tree = render(<Field label="Email" value="" onChangeText={jest.fn()} />);
    const labelNode = tree.getByText('Email');
    const style = flattenStyle(labelNode.props.style);
    expect(style.textTransform).toBe('uppercase');
    expect(style.letterSpacing).toBe(0.6);
    expect(style.fontSize).toBe(11);
  });

  test('input uses typography.input (Inter 14.5)', () => {
    const tree = render(<Field label="Email" value="" onChangeText={jest.fn()} />);
    const input = tree.UNSAFE_getByType(TextInput);
    const style = flattenStyle(input.props.style);
    expect(style.fontSize).toBe(14.5);
    expect(style.fontFamily).toBe('Inter_400Regular');
  });

  test('default chrome: paper2 bg, 1px line border, radius 14, padding 12/16', () => {
    const tree = render(<Field testID="field-root" label="Email" value="" onChangeText={jest.fn()} />);
    const style = flattenStyle(findField(tree).props.style);
    expect(style.backgroundColor).toBe('#E8DDBE');
    expect(style.borderWidth).toBe(1);
    expect(style.borderColor).toBe('rgba(30,47,35,0.12)');
    expect(style.borderRadius).toBe(14);
    expect(style.paddingVertical).toBe(12);
    expect(style.paddingHorizontal).toBe(16);
  });

  test('renders no error message by default', () => {
    const tree = render(<Field label="Email" value="" onChangeText={jest.fn()} />);
    expect(tree.queryByText(/^⚠/)).toBeNull();
  });
});

describe('<Field /> — typing + value', () => {
  test('passes value down and fires onChangeText', () => {
    const onChangeText = jest.fn();
    const tree = render(
      <Field testID="field-root" label="Email" value="alex" onChangeText={onChangeText} />,
    );
    const input = tree.UNSAFE_getByType(TextInput);
    expect(input.props.value).toBe('alex');
    fireEvent.changeText(input, 'alex@example.com');
    expect(onChangeText).toHaveBeenCalledWith('alex@example.com');
  });

  test('passes secureTextEntry / keyboardType / autoCapitalize through', () => {
    const tree = render(
      <Field
        label="Password"
        value=""
        onChangeText={jest.fn()}
        secureTextEntry
        keyboardType="email-address"
        autoCapitalize="none"
      />,
    );
    const input = tree.UNSAFE_getByType(TextInput);
    expect(input.props.secureTextEntry).toBe(true);
    expect(input.props.keyboardType).toBe('email-address');
    expect(input.props.autoCapitalize).toBe('none');
  });

  test('passes placeholder through', () => {
    const tree = render(
      <Field label="Email" value="" onChangeText={jest.fn()} placeholder="you@example.com" />,
    );
    expect(tree.UNSAFE_getByType(TextInput).props.placeholder).toBe('you@example.com');
  });

  test('passes keyboard-flow props through (returnKeyType, onSubmitEditing, blurOnSubmit)', () => {
    const onSubmitEditing = jest.fn();
    const tree = render(
      <Field
        label="Email"
        value=""
        onChangeText={jest.fn()}
        returnKeyType="next"
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={false}
      />,
    );
    const input = tree.UNSAFE_getByType(TextInput);
    expect(input.props.returnKeyType).toBe('next');
    expect(input.props.onSubmitEditing).toBe(onSubmitEditing);
    expect(input.props.blurOnSubmit).toBe(false);
  });
});

describe('<Field /> — focus state', () => {
  test('onFocus flips border to the accent color', () => {
    const tree = render(<Field testID="field-root" label="Email" value="" onChangeText={jest.fn()} />);
    const input = tree.UNSAFE_getByType(TextInput);
    fireEvent(input, 'focus');
    const style = flattenStyle(findField(tree).props.style);
    expect(style.borderColor).toBe(ACCENTS.blue);
  });

  test('onBlur returns border to line color', () => {
    const tree = render(<Field testID="field-root" label="Email" value="" onChangeText={jest.fn()} />);
    const input = tree.UNSAFE_getByType(TextInput);
    fireEvent(input, 'focus');
    fireEvent(input, 'blur');
    const style = flattenStyle(findField(tree).props.style);
    expect(style.borderColor).toBe('rgba(30,47,35,0.12)');
  });

  test('focus uses the resolved accent (orange) when accent changes', () => {
    useThemeStore.setState({ dark: false, accent: 'orange' });
    const tree = render(<Field testID="field-root" label="Email" value="" onChangeText={jest.fn()} />);
    const input = tree.UNSAFE_getByType(TextInput);
    fireEvent(input, 'focus');
    const style = flattenStyle(findField(tree).props.style);
    expect(style.borderColor).toBe(ACCENTS.orange);
  });
});

describe('<Field /> — error state', () => {
  test('error prop flips border to danger and renders the message', () => {
    const tree = render(
      <Field
        testID="field-root"
        label="Email"
        value="not-an-email"
        onChangeText={jest.fn()}
        error="Enter a valid email."
      />,
    );
    const style = flattenStyle(findField(tree).props.style);
    expect(style.borderColor).toBe('#B0413E');
    expect(tree.getByText(/Enter a valid email\./)).toBeTruthy();
  });

  test('error wins over focus (red beats accent when both)', () => {
    const tree = render(
      <Field
        testID="field-root"
        label="Email"
        value=""
        onChangeText={jest.fn()}
        error="bad"
      />,
    );
    const input = tree.UNSAFE_getByType(TextInput);
    fireEvent(input, 'focus');
    const style = flattenStyle(findField(tree).props.style);
    expect(style.borderColor).toBe('#B0413E');
  });

  test('error message uses Inter 12 color danger and is prefixed with ⚠', () => {
    const tree = render(
      <Field
        label="Email"
        value=""
        onChangeText={jest.fn()}
        error="Enter a valid email."
      />,
    );
    const errLine = tree.getByText(/Enter a valid email\./);
    const style = flattenStyle(errLine.props.style);
    expect(style.color).toBe('#B0413E');
    expect(style.fontSize).toBe(12);
    // Error line content should include the ⚠ prefix
    const fullText = tree.getByText('⚠ Enter a valid email.');
    expect(fullText).toBeTruthy();
  });
});

describe('<Field /> — accessibility', () => {
  test('input has accessibilityLabel set to the label text', () => {
    const tree = render(<Field label="Email" value="" onChangeText={jest.fn()} />);
    const input = tree.UNSAFE_getByType(TextInput);
    expect(input.props.accessibilityLabel).toBe('Email');
  });

  test('error sets accessibilityHint to the error message (RN convention)', () => {
    const tree = render(
      <Field label="Email" value="" onChangeText={jest.fn()} error="Enter a valid email." />,
    );
    const input = tree.UNSAFE_getByType(TextInput);
    expect(input.props.accessibilityHint).toBe('Enter a valid email.');
  });

  test('non-error: accessibilityHint is undefined', () => {
    const tree = render(<Field label="Email" value="" onChangeText={jest.fn()} />);
    const input = tree.UNSAFE_getByType(TextInput);
    expect(input.props.accessibilityHint).toBeUndefined();
  });
});
