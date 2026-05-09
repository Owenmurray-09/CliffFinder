import { LinearGradient } from 'expo-linear-gradient';
import { Image, type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

const DEFAULT_SIZE = 64;
const BORDER_WIDTH = 3;

// Hand-picked palette sampled from the design HTML's avatar examples.
const GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ['#7d9b6e', '#3d5b34'], // green (design default)
  ['#c89868', '#7a5230'], // warm tan
  ['#6e8aab', '#34495e'], // slate blue
  ['#c688a8', '#7a4566'], // pink
  ['#6ca39d', '#2f5e58'], // teal
  ['#a07a8a', '#5a3a4a'], // muted plum
] as const;

export type AvatarProps = {
  name?: string;
  uri?: string;
  size?: number;
  gradient?: readonly [string, string];
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function avatarMath(name: string | undefined): {
  initial: string;
  gradientIndex: number;
} {
  const trimmed = (name ?? '').trim();
  if (trimmed.length === 0) return { initial: '?', gradientIndex: 0 };
  const initial = trimmed[0]!.toUpperCase();
  // Stable djb2-ish hash so identical names map to the same gradient.
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash * 33 + trimmed.charCodeAt(i)) | 0;
  }
  const gradientIndex = Math.abs(hash) % GRADIENTS.length;
  return { initial, gradientIndex };
}

export function Avatar({
  name,
  uri,
  size = DEFAULT_SIZE,
  gradient,
  testID,
  style,
}: AvatarProps) {
  const t = useTheme();
  const { initial, gradientIndex } = avatarMath(name);
  const colors = gradient ?? GRADIENTS[gradientIndex]!;
  const fontSize = (size * 22) / DEFAULT_SIZE;

  const baseStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: BORDER_WIDTH,
    borderColor: t.palette.paper,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (uri) {
    return (
      <View testID={testID} style={[baseStyle, style]}>
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      </View>
    );
  }

  return (
    <View testID={testID} style={[baseStyle, style]}>
      <LinearGradient
        colors={colors as unknown as readonly [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Text
        style={{
          color: '#FFFFFF',
          fontFamily: 'Poppins_700Bold',
          fontSize,
          fontWeight: '700',
        }}
      >
        {initial}
      </Text>
    </View>
  );
}
