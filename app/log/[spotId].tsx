import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MoreHorizontal, Plus, Star } from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextStyle,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Slider } from '@/components/Slider';
import { useLogEntriesStore } from '@/data/logEntriesStore';
import { useSpotsStore } from '@/data/spotsStore';
import { useTheme } from '@/theme/useTheme';

const TINY: TextStyle = {
  fontFamily: 'Inter_400Regular',
  fontSize: 11,
  letterSpacing: 0.88,
  textTransform: 'uppercase',
};

const TRICK_OPTIONS = [
  'Cannonball',
  'Backflip',
  'Pencil',
  'Gainer',
  'Swan',
  'Front flip',
] as const;

export default function LogEntryScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ spotId: string }>();
  const spot = useSpotsStore((s) => s.getById(params.spotId));
  const addEntry = useLogEntriesStore((s) => s.addEntry);

  const [rating, setRating] = useState(4);
  const [tricks, setTricks] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [height, setHeight] = useState(spot?.height_m ?? 10);
  const [waterTemp, setWaterTemp] = useState(15);

  if (!spot) {
    return (
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.palette.paper }}
      >
        <EmptyState title="Spot not found" message="That spot doesn't exist or was removed." />
      </View>
    );
  }

  const today = new Date().toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const toggleTrick = (name: string) => {
    setTricks((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleSave = () => {
    addEntry({
      spotId: spot.id,
      heightJumped_m: height,
      waterTemp_c: waterTemp,
      rating,
      notes: notes.trim() || undefined,
      tricks: Array.from(tricks),
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.palette.paper }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* TOP NAV */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 12) + 4,
          paddingHorizontal: 20,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={navBtn(t)}
        >
          <ChevronLeft size={20} color={t.palette.ink} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Poppins_600SemiBold',
              fontWeight: '600',
              fontSize: 15,
              color: t.palette.ink,
            }}
          >
            {spot.name}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 11,
              color: t.palette.ink3,
              marginTop: 1,
            }}
          >
            Logging · {today}
          </Text>
        </View>
        <Pressable onPress={() => {}} accessibilityRole="button" style={navBtn(t)}>
          <MoreHorizontal size={18} color={t.palette.ink} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 22,
          paddingBottom: 96 + Math.max(insets.bottom, 16),
          gap: 18,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* RATING */}
        <View>
          <Text style={[TINY, { color: t.palette.ink3, marginBottom: 8 }]}>Your rating</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 3, 4, 5].map((i) => {
              const filled = i <= rating;
              return (
                <Pressable
                  key={i}
                  onPress={() => setRating(i)}
                  accessibilityRole="button"
                  accessibilityLabel={`Rate ${i} stars`}
                  hitSlop={4}
                >
                  <Star
                    size={32}
                    color={filled ? t.palette.accent : t.palette.ink3}
                    fill={filled ? t.palette.accent : 'transparent'}
                    strokeWidth={1.6}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* TRICKS */}
        <View>
          <Text style={[TINY, { color: t.palette.ink3, marginBottom: 8 }]}>Tricks</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TRICK_OPTIONS.map((trick) => {
              const on = tricks.has(trick);
              return (
                <Pressable
                  key={trick}
                  onPress={() => toggleTrick(trick)}
                  accessibilityRole="button"
                  style={{
                    paddingVertical: 7,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    backgroundColor: on ? `${t.palette.accent}1a` : 'transparent',
                    borderWidth: on ? 0 : 1,
                    borderStyle: on ? 'solid' : 'dashed',
                    borderColor: on ? 'transparent' : t.palette.line,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Inter_500Medium',
                      fontWeight: '500',
                      fontSize: 13,
                      color: on ? t.palette.accent : t.palette.ink2,
                    }}
                  >
                    {trick}
                  </Text>
                </Pressable>
              );
            })}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingVertical: 7,
                paddingHorizontal: 14,
                borderRadius: 20,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: t.palette.ink3,
              }}
            >
              <Plus size={14} color={t.palette.ink3} />
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: t.palette.ink3 }}>
                Add
              </Text>
            </View>
          </View>
        </View>

        {/* HEIGHT JUMPED */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <Text style={[TINY, { color: t.palette.ink3 }]}>Height jumped</Text>
            <Text
              style={{
                fontFamily: 'Montserrat_600SemiBold',
                fontWeight: '600',
                fontSize: 13,
                color: t.palette.accent,
              }}
            >
              {height} m
            </Text>
          </View>
          <Slider value={height} onValueChange={setHeight} min={0} max={Math.max(spot.height_m, 30)} />
        </View>

        {/* WATER TEMP */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <Text style={[TINY, { color: t.palette.ink3 }]}>Water temperature</Text>
            <Text
              style={{
                fontFamily: 'Montserrat_600SemiBold',
                fontWeight: '600',
                fontSize: 13,
                color: t.palette.accent,
              }}
            >
              {waterTemp}°C
            </Text>
          </View>
          <Slider value={waterTemp} onValueChange={setWaterTemp} min={0} max={30} />
        </View>

        {/* NOTES */}
        <View>
          <Text style={[TINY, { color: t.palette.ink3, marginBottom: 8 }]}>Notes</Text>
          <View
            style={{
              backgroundColor: t.palette.cardBg,
              borderWidth: 1,
              borderColor: t.palette.glassBorder,
              borderRadius: 14,
              paddingVertical: 14,
              paddingHorizontal: 16,
              minHeight: 80,
            }}
          >
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Water was cold but crystal clear…"
              placeholderTextColor={t.palette.ink3}
              multiline
              textAlignVertical="top"
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                lineHeight: 21,
                color: t.palette.ink,
                padding: 0,
                minHeight: 56,
              }}
            />
          </View>
        </View>

        {/* MEDIA */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <Text style={[TINY, { color: t.palette.ink3 }]}>Photos / videos</Text>
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontWeight: '500',
                fontSize: 12,
                color: t.palette.accent,
              }}
            >
              {photos.length} of 6
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {photos.map((p, i) => (
              <Image key={i} source={{ uri: p }} style={{ width: 78, height: 78, borderRadius: 14 }} />
            ))}
            {photos.length < 6 ? (
              <Pressable
                onPress={() =>
                  setPhotos([
                    ...photos,
                    'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=600&q=80',
                  ])
                }
                accessibilityRole="button"
                accessibilityLabel="Add photo"
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: t.palette.ink3,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={20} color={t.palette.ink3} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* STICKY SAVE */}
      <View
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: Math.max(insets.bottom, 16) + 16,
        }}
      >
        <Button
          label="Save jump"
          variant="primary"
          onPress={handleSave}
          style={{ paddingVertical: 15 }}
          textStyle={{
            fontFamily: 'Poppins_600SemiBold',
            fontWeight: '600',
            fontSize: 15,
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function navBtn(t: ReturnType<typeof useTheme>) {
  return {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: t.palette.cardBg,
    borderWidth: 1,
    borderColor: t.palette.glassBorder,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
}
