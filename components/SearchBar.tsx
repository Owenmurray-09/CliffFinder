import { Search, X } from 'lucide-react-native';
import { Pressable, type StyleProp, TextInput, View, type ViewStyle } from 'react-native';
import { GlassPanel } from './GlassPanel';
import { useTheme } from '@/theme/useTheme';

export type SearchBarProps = {
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
  onClear?: () => void;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  onClear,
  testID,
  style,
}: SearchBarProps) {
  const t = useTheme();
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <GlassPanel
      variant="search"
      testID={testID}
      style={[
        {
          height: 48,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          gap: 10,
        },
        style,
      ]}
    >
      <Search size={20} color={t.palette.ink2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.palette.ink3}
        style={{
          flex: 1,
          fontFamily: 'Inter_400Regular',
          fontSize: 14,
          color: t.palette.ink,
          padding: 0,
        }}
        accessibilityLabel="Search"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
        >
          <X size={18} color={t.palette.ink3} />
        </Pressable>
      ) : null}
    </GlassPanel>
  );
}

// Re-render on style array — flatten for test consumers
SearchBar.displayName = 'SearchBar';
