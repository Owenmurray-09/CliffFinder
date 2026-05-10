import { MapPin } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type LatLng = { lat: number; lng: number };
export type LocationPickerProps = {
  value: LatLng | null;
  onChange: (v: LatLng) => void;
};

const FALLBACK_CENTER: LatLng = { lat: 9.9333, lng: -84.0833 };

/**
 * Native fallback: simple tap-to-drop card. The full interactive Leaflet
 * picker lives in LocationPicker.web.tsx; native gets this stub until we
 * wire react-native-maps or similar.
 */
export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => onChange(FALLBACK_CENTER)}
      style={{
        height: 280,
        borderRadius: 14,
        backgroundColor: t.palette.cardBg,
        borderWidth: 1,
        borderColor: t.palette.glassBorder,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <MapPin
        size={32}
        color={value ? t.palette.accent : t.palette.ink3}
        fill={value ? `${t.palette.accent}33` : 'transparent'}
      />
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontWeight: '500',
          fontSize: 14,
          color: value ? t.palette.ink : t.palette.ink3,
        }}
      >
        {value ? `${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}` : 'Tap to drop a pin'}
      </Text>
    </Pressable>
  );
}
