import { useState } from 'react';
import {
  type StyleProp,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type FieldProps = {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: TextInputProps['secureTextEntry'];
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  autoCorrect?: TextInputProps['autoCorrect'];
  // Keyboard flow (Email → Password → Submit) — sign-in needs these.
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  blurOnSubmit?: TextInputProps['blurOnSubmit'];
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function Field({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  autoCorrect,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
  testID,
  style,
}: FieldProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? t.palette.danger
    : focused
      ? t.palette.accent
      : t.palette.line;

  const fieldStyle: ViewStyle = {
    backgroundColor: t.palette.paper2,
    borderWidth: 1,
    borderColor,
    borderRadius: t.radius.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  };

  return (
    <View style={style}>
      <View testID={testID} style={fieldStyle}>
        <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={t.palette.ink3}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          accessibilityHint={error}
          style={[
            t.typography.input,
            {
              color: t.palette.ink,
              marginTop: 4,
              padding: 0,
            },
          ]}
        />
      </View>
      {error ? (
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            color: t.palette.danger,
            marginTop: 6,
          }}
        >
          {`⚠ ${error}`}
        </Text>
      ) : null}
    </View>
  );
}
