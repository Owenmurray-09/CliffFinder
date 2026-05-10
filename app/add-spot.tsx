import { useRouter } from 'expo-router';
import { Check, ChevronLeft, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
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
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Field } from '@/components/Field';
import { Slider } from '@/components/Slider';
import type { Difficulty, WaterType } from '@/data/types';
import { useTheme } from '@/theme/useTheme';

type Step = 'location' | 'form' | 'photos' | 'confirm';

const DIFFICULTIES: ReadonlyArray<{ key: Difficulty; label: string }> = [
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
];
const WATER_TYPES: ReadonlyArray<{ key: WaterType; label: string }> = [
  { key: 'lake', label: 'Lake' },
  { key: 'ocean', label: 'Ocean' },
  { key: 'river', label: 'River' },
  { key: 'quarry', label: 'Quarry' },
  { key: 'falls', label: 'Falls' },
];

export default function AddSpotScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('location');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [name, setName] = useState('');
  const [height, setHeight] = useState(10);
  const [depth, setDepth] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [waterType, setWaterType] = useState<WaterType>('lake');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const stepIndex = ['location', 'form', 'photos', 'confirm'].indexOf(step);
  const canProceed =
    (step === 'location' && location !== null) ||
    (step === 'form' && name.trim().length > 0) ||
    (step === 'photos' && photos.length >= 1) ||
    step === 'confirm';

  const next = () => {
    if (step === 'location') setStep('form');
    else if (step === 'form') setStep('photos');
    else if (step === 'photos') setStep('confirm');
  };
  const back = () => {
    if (step === 'form') setStep('location');
    else if (step === 'photos') setStep('form');
    else if (step === 'confirm') setStep('photos');
    else router.back();
  };

  const submit = () => {
    // Real persistence (add to spots store) lands in a follow-up.
    // eslint-disable-next-line no-console
    console.log('spot submitted', {
      name,
      location,
      height,
      depth,
      difficulty,
      waterType,
      description,
      photos: photos.length,
    });
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.palette.paper }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingTop: Math.max(insets.top, 12) + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
        }}
      >
        <Pressable
          onPress={back}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
        >
          <ChevronLeft size={24} color={t.palette.ink} />
        </Pressable>
        <Text style={[t.typography.title, { color: t.palette.ink, flex: 1 }]}>Add a spot</Text>
        <Text style={[t.typography.label, { color: t.palette.ink3 }]}>
          Step {stepIndex + 1} of 4
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 96 }}>
        {step === 'location' ? (
          <>
            <Text style={[t.typography.body, { color: t.palette.ink2 }]}>
              Tap the map below where the spot is.
            </Text>
            <Pressable
              onPress={() =>
                // Stubbed: pretend the user tapped Squamish.
                setLocation({ lat: 49.7016, lng: -123.1558 })
              }
              style={{
                height: 240,
                borderRadius: t.radius.card,
                backgroundColor: t.palette.paper2,
                borderWidth: 1,
                borderColor: t.palette.line,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              accessibilityRole="button"
              accessibilityLabel="Pick location"
            >
              <MapPin
                size={28}
                color={location ? t.palette.accent : t.palette.ink3}
                fill={location ? `${t.palette.accent}33` : 'transparent'}
              />
              <Text style={[t.typography.body, { color: t.palette.ink2 }]}>
                {location
                  ? `${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°`
                  : 'Tap to drop a pin'}
              </Text>
            </Pressable>
          </>
        ) : null}

        {step === 'form' ? (
          <>
            <Field label="Spot name" value={name} onChangeText={setName} placeholder="e.g. Eagle Cliff" />
            <View style={{ gap: t.spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>height</Text>
                <Text style={[t.typography.body, { color: t.palette.ink2 }]}>{height}m</Text>
              </View>
              <Slider value={height} onValueChange={setHeight} min={1} max={50} />
            </View>
            <View style={{ gap: t.spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>water depth</Text>
                <Text style={[t.typography.body, { color: t.palette.ink2 }]}>{depth}m</Text>
              </View>
              <Slider value={depth} onValueChange={setDepth} min={1} max={30} />
            </View>
            <View style={{ gap: t.spacing.sm }}>
              <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>difficulty</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {DIFFICULTIES.map((d) => (
                  <Chip
                    key={d.key}
                    label={d.label}
                    selected={difficulty === d.key}
                    onPress={() => setDifficulty(d.key)}
                  />
                ))}
              </View>
            </View>
            <View style={{ gap: t.spacing.sm }}>
              <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>water type</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {WATER_TYPES.map((w) => (
                  <Chip
                    key={w.key}
                    label={w.label}
                    selected={waterType === w.key}
                    onPress={() => setWaterType(w.key)}
                  />
                ))}
              </View>
            </View>
            <View style={{ gap: t.spacing.sm }}>
              <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="What should other jumpers know?"
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
          </>
        ) : null}

        {step === 'photos' ? (
          <>
            <Text style={[t.typography.body, { color: t.palette.ink2 }]}>
              Add 1–6 photos. They'll appear in the carousel on the spot's details page.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {photos.map((p, i) => (
                <Image
                  key={i}
                  source={{ uri: p }}
                  style={{ width: 96, height: 96, borderRadius: t.radius.cardSm }}
                />
              ))}
              {photos.length < 6 ? (
                <Pressable
                  onPress={() =>
                    // Stub: append a placeholder Unsplash image
                    setPhotos((prev) => [
                      ...prev,
                      'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=600&q=80',
                    ])
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Add photo"
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: t.radius.cardSm,
                    backgroundColor: t.palette.paper2,
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    borderColor: t.palette.line,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: t.palette.ink3, fontSize: 28 }}>+</Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={[t.typography.label, { color: t.palette.ink3 }]}>
              {photos.length}/6 photos added
            </Text>
          </>
        ) : null}

        {step === 'confirm' ? (
          <>
            <View style={{ alignItems: 'center', gap: 12, paddingVertical: 16 }}>
              <View
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  backgroundColor: `${t.palette.accent}22`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={40} color={t.palette.accent} strokeWidth={2.6} />
              </View>
              <Text style={[t.typography.title, { color: t.palette.ink }]}>Looks good?</Text>
              <Text
                style={[
                  t.typography.body,
                  { color: t.palette.ink3, textAlign: 'center', maxWidth: 280 },
                ]}
              >
                Submit to add {name} to the map. You can edit details after.
              </Text>
            </View>
            <Card>
              <Text style={[t.typography.cardTitle, { color: t.palette.ink }]}>{name}</Text>
              <Text style={[t.typography.label, { color: t.palette.ink3 }]}>
                {height}m · {depth}m depth · {waterType} · {difficulty}
              </Text>
              <Text style={[t.typography.body, { color: t.palette.ink2 }]} numberOfLines={3}>
                {description || 'No description yet.'}
              </Text>
              <Text style={[t.typography.label, { color: t.palette.ink3 }]}>
                {photos.length} photo{photos.length === 1 ? '' : 's'} ·{' '}
                {location
                  ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                  : 'no location'}
              </Text>
            </Card>
          </>
        ) : null}
      </ScrollView>

      <View style={{ position: 'absolute', left: 16, right: 16, bottom: Math.max(insets.bottom, 16) + 16 }}>
        <Button
          label={step === 'confirm' ? 'Submit' : 'Continue'}
          variant="primary"
          onPress={step === 'confirm' ? submit : next}
          disabled={!canProceed}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
