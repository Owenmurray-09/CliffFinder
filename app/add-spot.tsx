import { useRouter } from 'expo-router';
import {
  Camera,
  Check,
  ChevronRight,
  Plus,
  ShieldAlert,
  X,
} from 'lucide-react-native';
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
import { LocationPicker } from '@/components/LocationPicker';
import { Slider } from '@/components/Slider';
import { useAuthStore } from '@/auth/store';
import { safeBack } from '@/lib/safeBack';
import { lengthUnitLabel, useUnitsStore } from '@/lib/units';
import { useSavedSpotsStore } from '@/data/savedSpotsStore';
import { useSpotsStore } from '@/data/spotsStore';
import type { Difficulty, WaterType } from '@/data/types';
import { pickImage } from '@/lib/pickImage';
import { uploadPhoto } from '@/lib/uploadPhoto';
import { useTheme } from '@/theme/useTheme';

const STEPS = ['Location', 'Details', 'Safety', 'Media', 'Review'] as const;
type StepKey = (typeof STEPS)[number];

const ACCESS_OPTIONS: ReadonlyArray<{ value: Difficulty | 'expert'; label: string }> = [
  { value: 'beginner', label: 'easy' },
  { value: 'intermediate', label: 'moderate' },
  { value: 'advanced', label: 'hard' },
  { value: 'expert', label: 'expert' },
];

const WATER_TYPES: ReadonlyArray<{ key: WaterType; label: string }> = [
  { key: 'lake', label: 'Lake' },
  { key: 'ocean', label: 'Ocean' },
  { key: 'river', label: 'River' },
  { key: 'quarry', label: 'Quarry' },
  { key: 'falls', label: 'Falls' },
];

const TINY: TextStyle = {
  fontFamily: 'Inter_400Regular',
  fontSize: 11,
  letterSpacing: 0.55,
  textTransform: 'uppercase',
};

export default function AddSpotScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stepIdx, setStepIdx] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [height, setHeight] = useState(15);
  const [depth, setDepth] = useState(6);
  const [access, setAccess] = useState<Difficulty | 'expert'>('intermediate');
  const [waterType, setWaterType] = useState<WaterType>('lake');
  const [photos, setPhotos] = useState<string[]>([]);
  const addSpot = useSpotsStore((s) => s.addSpot);
  const toggleSaved = useSavedSpotsStore((s) => s.toggleSaved);

  const step = STEPS[stepIdx]!;
  const canNext =
    (step === 'Location' && location !== null) ||
    (step === 'Details' && name.trim().length > 0) ||
    (step === 'Safety') ||
    (step === 'Media' && photos.length >= 1) ||
    step === 'Review';

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const next = async () => {
    if (step === 'Review') {
      if (submitting) return;
      const userId = useAuthStore.getState().session?.user.id;
      if (!userId) {
        setSubmitError('You need to be signed in to add a spot.');
        return;
      }
      setSubmitting(true);
      setSubmitError(null);
      let uploaded: string[];
      try {
        uploaded = await Promise.all(photos.map((uri) => uploadPhoto(uri, userId)));
      } catch (e) {
        setSubmitting(false);
        setSubmitError(e instanceof Error ? e.message : 'Photo upload failed.');
        return;
      }
      const created = await addSpot({
        name: name.trim(),
        area: '',
        lat: location?.lat ?? 0,
        lng: location?.lng ?? 0,
        height_m: height,
        depth_m: depth,
        difficulty: access === 'expert' ? 'advanced' : access,
        photos: uploaded,
        description: description.trim(),
        waterType,
      });
      if (!created) {
        setSubmitting(false);
        setSubmitError('Could not save the spot. Try again.');
        return;
      }
      await toggleSaved(created.id);
      setSubmitting(false);
      router.replace(`/spot/${created.id}`);
      return;
    }
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  };
  const back = () => {
    if (stepIdx === 0) return safeBack(router);
    setStepIdx((i) => Math.max(0, i - 1));
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
          onPress={() => safeBack(router)}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: t.palette.cardBg,
            borderWidth: 1,
            borderColor: t.palette.glassBorder,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} color={t.palette.ink} />
        </Pressable>
        <Text
          style={{
            fontFamily: 'Poppins_600SemiBold',
            fontWeight: '600',
            fontSize: 16,
            color: t.palette.ink,
          }}
        >
          Add spot
        </Text>
        <Text
          style={{
            fontFamily: 'Montserrat_600SemiBold',
            fontWeight: '600',
            fontSize: 13,
            color: t.palette.ink3,
          }}
        >
          {stepIdx + 1} / {STEPS.length}
        </Text>
      </View>

      {/* PROGRESS BAR + STEP LABELS */}
      <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 4,
                backgroundColor: i <= stepIdx ? t.palette.accent : t.palette.line2,
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', marginTop: 14 }}>
          {STEPS.map((s, i) => (
            <View key={s} style={{ flex: 1 }}>
              <Text
                style={[
                  TINY,
                  {
                    textAlign: 'center',
                    color: i === stepIdx ? t.palette.ink : t.palette.ink3,
                    fontWeight: i === stepIdx ? '600' : '400',
                  },
                ]}
              >
                {s}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 22, paddingBottom: 24, gap: 18 }}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'Location' ? <LocationStep value={location} onChange={setLocation} /> : null}
        {step === 'Details' ? (
          <DetailsStep
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            height={height}
            setHeight={setHeight}
            depth={depth}
            setDepth={setDepth}
          />
        ) : null}
        {step === 'Safety' ? (
          <SafetyStep
            access={access}
            setAccess={setAccess}
            waterType={waterType}
            setWaterType={setWaterType}
          />
        ) : null}
        {step === 'Media' ? <MediaStep photos={photos} setPhotos={setPhotos} /> : null}
        {step === 'Review' ? (
          <ReviewStep
            name={name}
            description={description}
            height={height}
            depth={depth}
            access={access}
            waterType={waterType}
            location={location}
            photoCount={photos.length}
          />
        ) : null}

        {submitError ? (
          <Text
            style={{
              marginTop: 14,
              fontFamily: 'Inter_500Medium',
              fontWeight: '500',
              fontSize: 13,
              color: t.palette.danger,
            }}
          >
            {submitError}
          </Text>
        ) : null}
      </ScrollView>

      {/* FOOTER NAV */}
      <View
        style={{
          paddingHorizontal: 22,
          paddingTop: 14,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
          borderTopWidth: 1,
          borderTopColor: t.palette.line2,
          flexDirection: 'row',
          gap: 10,
          backgroundColor: t.palette.paper,
        }}
      >
        <Pressable
          onPress={back}
          accessibilityRole="button"
          style={{
            flex: 1,
            paddingVertical: 15,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: t.palette.line,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Poppins_600SemiBold',
              fontWeight: '500',
              fontSize: 14,
              color: t.palette.ink,
            }}
          >
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={next}
          accessibilityRole="button"
          disabled={!canNext || submitting}
          style={{
            flex: 2,
            paddingVertical: 15,
            borderRadius: 14,
            backgroundColor: t.palette.accent,
            alignItems: 'center',
            opacity: canNext && !submitting ? 1 : 0.5,
          }}
        >
          <Text
            style={{
              fontFamily: 'Poppins_600SemiBold',
              fontWeight: '600',
              fontSize: 14,
              color: t.palette.on.accent,
            }}
          >
            {step === 'Review'
              ? submitting
                ? 'Submitting…'
                : 'Submit'
              : `Next: ${STEPS[stepIdx + 1]} →`}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function LocationStep({
  value,
  onChange,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (v: { lat: number; lng: number }) => void;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: 14 }}>
      <View>
        <Text
          style={{
            fontFamily: 'Poppins_700Bold',
            fontWeight: '700',
            fontSize: 24,
            letterSpacing: -0.24,
            color: t.palette.ink,
          }}
        >
          Where is it?
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            color: t.palette.ink3,
            marginTop: 4,
          }}
        >
          Pan and zoom the map, then tap the spot to drop a pin.
        </Text>
      </View>
      <LocationPicker value={value} onChange={onChange} />
      {value ? (
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontWeight: '500',
            fontSize: 13,
            color: t.palette.ink3,
          }}
        >
          Pin: {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
        </Text>
      ) : null}
    </View>
  );
}

function DetailsStep({
  name,
  setName,
  description,
  setDescription,
  height,
  setHeight,
  depth,
  setDepth,
}: {
  name: string;
  setName: (s: string) => void;
  description: string;
  setDescription: (s: string) => void;
  height: number;
  setHeight: (n: number) => void;
  depth: number;
  setDepth: (n: number) => void;
}) {
  const t = useTheme();
  const units = useUnitsStore((s) => s.units);
  const heightDisplay = units === 'imperial' ? Math.round(height * 3.28084) : height;
  const depthDisplay = units === 'imperial' ? Math.round(depth * 3.28084) : depth;
  return (
    <View style={{ gap: 18 }}>
      <View>
        <Text
          style={{
            fontFamily: 'Poppins_700Bold',
            fontWeight: '700',
            fontSize: 24,
            letterSpacing: -0.24,
            color: t.palette.ink,
          }}
        >
          Tell us about it
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            color: t.palette.ink3,
            marginTop: 4,
          }}
        >
          You can edit any of this later.
        </Text>
      </View>

      <CardField label="Spot name">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Eagle Cliff"
          placeholderTextColor={t.palette.ink3}
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 16,
            fontWeight: '500',
            color: t.palette.ink,
            marginTop: 2,
            padding: 0,
          }}
        />
      </CardField>

      <CardField label="Description" minHeight={78}>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Granite cliff on the south side of the lake…"
          placeholderTextColor={t.palette.ink3}
          multiline
          textAlignVertical="top"
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            lineHeight: 20.3,
            color: t.palette.ink,
            marginTop: 4,
            padding: 0,
            minHeight: 56,
          }}
        />
      </CardField>

      <SliderRow
        label="Jump height"
        value={height}
        max={30}
        unit={lengthUnitLabel(units)}
        displayValue={heightDisplay}
        onChange={setHeight}
      />
      <SliderRow
        label="Water depth"
        value={depth}
        max={15}
        unit={`+ ${lengthUnitLabel(units)}`}
        displayValue={depthDisplay}
        onChange={setDepth}
      />
    </View>
  );
}

function SafetyStep({
  access,
  setAccess,
  waterType,
  setWaterType,
}: {
  access: Difficulty | 'expert';
  setAccess: (a: Difficulty | 'expert') => void;
  waterType: WaterType;
  setWaterType: (w: WaterType) => void;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: 18 }}>
      <View>
        <Text
          style={{
            fontFamily: 'Poppins_700Bold',
            fontWeight: '700',
            fontSize: 24,
            letterSpacing: -0.24,
            color: t.palette.ink,
          }}
        >
          Safety
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            color: t.palette.ink3,
            marginTop: 4,
          }}
        >
          Help others know what they're getting into.
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={[TINY, { color: t.palette.ink3 }]}>Access difficulty</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {ACCESS_OPTIONS.map((a) => {
            const on = a.value === access;
            return (
              <Pressable
                key={a.value}
                onPress={() => setAccess(a.value)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: on ? t.palette.accent : t.palette.line2,
                  backgroundColor: on ? `${t.palette.accent}1a` : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontWeight: '500',
                    fontSize: 12,
                    color: on ? t.palette.accent : t.palette.ink,
                    textTransform: 'capitalize',
                  }}
                >
                  {a.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={[TINY, { color: t.palette.ink3 }]}>Water type</Text>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {WATER_TYPES.map((w) => {
            const on = w.key === waterType;
            return (
              <Pressable
                key={w.key}
                onPress={() => setWaterType(w.key)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: on ? t.palette.accent : t.palette.line2,
                  backgroundColor: on ? `${t.palette.accent}1a` : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontWeight: '500',
                    fontSize: 12,
                    color: on ? t.palette.accent : t.palette.ink,
                  }}
                >
                  {w.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={{
          backgroundColor: t.palette.cardBg,
          borderWidth: 1,
          borderColor: t.palette.glassBorder,
          borderRadius: 14,
          padding: 14,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        <ShieldAlert size={18} color={t.palette.accent} strokeWidth={2.2} />
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            lineHeight: 19.5,
            color: t.palette.ink3,
            flex: 1,
          }}
        >
          Be honest about hazards. Anyone you list as having jumped here can verify the rating.
        </Text>
      </View>
    </View>
  );
}

function MediaStep({
  photos,
  setPhotos,
}: {
  photos: string[];
  setPhotos: (p: string[]) => void;
}) {
  const t = useTheme();
  const handleAdd = async () => {
    const r = await pickImage();
    if (r) setPhotos([...photos, r.uri]);
  };
  return (
    <View style={{ gap: 14 }}>
      <View>
        <Text
          style={{
            fontFamily: 'Poppins_700Bold',
            fontWeight: '700',
            fontSize: 24,
            letterSpacing: -0.24,
            color: t.palette.ink,
          }}
        >
          Add photos
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            color: t.palette.ink3,
            marginTop: 4,
          }}
        >
          1–6 photos. Bright, clear shots show the spot best.
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {photos.map((p, i) => (
          <Image
            key={i}
            source={{ uri: p }}
            style={{ width: 96, height: 96, borderRadius: 14 }}
            resizeMode="cover"
          />
        ))}
        {photos.length < 6 ? (
          <Pressable
            onPress={handleAdd}
            accessibilityRole="button"
            accessibilityLabel="Add photo"
            style={{
              width: 96,
              height: 96,
              borderRadius: 14,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: t.palette.ink3,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Camera size={20} color={t.palette.ink3} />
            <Plus size={14} color={t.palette.ink3} />
          </Pressable>
        ) : null}
      </View>
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: t.palette.ink3 }}>
        {photos.length} of 6 photos
      </Text>
    </View>
  );
}

function ReviewStep({
  name,
  description,
  height,
  depth,
  access,
  waterType,
  location,
  photoCount,
}: {
  name: string;
  description: string;
  height: number;
  depth: number;
  access: Difficulty | 'expert';
  waterType: WaterType;
  location: { lat: number; lng: number } | null;
  photoCount: number;
}) {
  const t = useTheme();
  const units = useUnitsStore((s) => s.units);
  const heightDisplay = units === 'imperial' ? Math.round(height * 3.28084) : height;
  const depthDisplay = units === 'imperial' ? Math.round(depth * 3.28084) : depth;
  const unitLabel = lengthUnitLabel(units);
  return (
    <View style={{ gap: 14 }}>
      <View style={{ alignItems: 'center', gap: 12, paddingTop: 8 }}>
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
        <Text
          style={{
            fontFamily: 'Poppins_700Bold',
            fontWeight: '700',
            fontSize: 22,
            letterSpacing: -0.22,
            color: t.palette.ink,
            textAlign: 'center',
          }}
        >
          Looks good?
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            lineHeight: 21,
            color: t.palette.ink3,
            textAlign: 'center',
            maxWidth: 280,
          }}
        >
          Submit to add {name || 'this spot'} to the map. You can edit details after.
        </Text>
      </View>
      <View
        style={{
          backgroundColor: t.palette.cardBg,
          borderWidth: 1,
          borderColor: t.palette.glassBorder,
          borderRadius: 14,
          padding: 14,
          gap: 6,
        }}
      >
        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontWeight: '600', fontSize: 15, color: t.palette.ink }}>
          {name || '—'}
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: t.palette.ink3 }}>
          {heightDisplay}{unitLabel} · {depthDisplay}+{unitLabel} depth · {waterType} · {access}
        </Text>
        {description ? (
          <Text
            style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: t.palette.ink2 }}
            numberOfLines={3}
          >
            {description}
          </Text>
        ) : null}
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: t.palette.ink3 }}>
          {photoCount} photo{photoCount === 1 ? '' : 's'} ·{' '}
          {location ? `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}` : 'no location'}
        </Text>
      </View>
    </View>
  );
}

function CardField({
  label,
  minHeight,
  children,
}: {
  label: string;
  minHeight?: number;
  children: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.palette.cardBg,
        borderWidth: 1,
        borderColor: t.palette.glassBorder,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minHeight,
      }}
    >
      <Text style={[TINY, { color: t.palette.ink3 }]}>{label}</Text>
      {children}
    </View>
  );
}

function SliderRow({
  label,
  value,
  max,
  unit,
  displayValue,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  /** Optional override for the rendered number (e.g. converted to feet); falls back to `value`. */
  displayValue?: number;
  onChange: (v: number) => void;
}) {
  const t = useTheme();
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <Text style={{ fontFamily: 'Inter_500Medium', fontWeight: '500', fontSize: 14, color: t.palette.ink }}>
          {label}
        </Text>
        <Text
          style={{
            fontFamily: 'Montserrat_600SemiBold',
            fontWeight: '600',
            fontSize: 13,
            color: t.palette.accent,
          }}
        >
          {displayValue ?? value} {unit}
        </Text>
      </View>
      <Slider value={value} onValueChange={onChange} min={0} max={max} />
    </View>
  );
}

// Suppress unused-import warnings for the icon set we may extend later.
void ChevronRight;
