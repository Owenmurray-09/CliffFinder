import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { StarRow } from '@/components/StarRow';
import { Slider } from '@/components/Slider';
import { EmptyState } from '@/components/EmptyState';
import { getSpotById } from '@/data/spots';
import { useTheme } from '@/theme/useTheme';

export default function LogEntryScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ spotId: string }>();
  const spot = getSpotById(params.spotId);

  const [height, setHeight] = useState(spot?.height_m ?? 10);
  const [waterTemp, setWaterTemp] = useState(15);
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');

  if (!spot) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.palette.paper,
        }}
      >
        <EmptyState title="Spot not found" message="That spot doesn't exist or was removed." />
      </View>
    );
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleSave = () => {
    // Real persistence (Zustand store + mutation) lands in a follow-up loop.
    // For now, log + return.
    // eslint-disable-next-line no-console
    console.log('log saved', { spotId: spot.id, height, waterTemp, rating, notes });
    router.back();
  };

  const ctaBottom = Math.max(insets.bottom, 16) + 16;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.palette.paper }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 16) + 16,
          paddingHorizontal: 20,
          paddingBottom: 96 + ctaBottom,
          gap: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: 4, flex: 1 }}>
            <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>logging at</Text>
            <Text style={[t.typography.title, { color: t.palette.ink }]}>{spot.name}</Text>
            <Text style={[t.typography.body, { color: t.palette.ink3 }]}>{today}</Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            hitSlop={10}
          >
            <X size={22} color={t.palette.ink2} />
          </Pressable>
        </View>

        <View style={{ gap: t.spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>height jumped</Text>
            <Text style={[t.typography.body, { color: t.palette.ink2 }]}>{height}m</Text>
          </View>
          <Slider
            value={height}
            onValueChange={setHeight}
            min={0}
            max={Math.max(spot.height_m, 30)}
          />
        </View>

        <View style={{ gap: t.spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>water temp</Text>
            <Text style={[t.typography.body, { color: t.palette.ink2 }]}>{waterTemp}°C</Text>
          </View>
          <Slider value={waterTemp} onValueChange={setWaterTemp} min={0} max={30} />
        </View>

        <View style={{ gap: t.spacing.sm }}>
          <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>rating</Text>
          <StarRow value={rating} onValueChange={setRating} size={32} />
        </View>

        <View style={{ gap: t.spacing.sm }}>
          <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Wind was calm; entry felt clean."
            placeholderTextColor={t.palette.ink3}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{
              backgroundColor: t.palette.paper2,
              borderWidth: 1,
              borderColor: t.palette.line,
              borderRadius: t.radius.control,
              padding: 14,
              minHeight: 96,
              fontFamily: 'Inter_400Regular',
              fontSize: 14.5,
              color: t.palette.ink,
            }}
          />
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: ctaBottom,
        }}
      >
        <Button label="Save jump" variant="primary" onPress={handleSave} />
      </View>
    </KeyboardAvoidingView>
  );
}
