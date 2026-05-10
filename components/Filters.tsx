import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Button } from './Button';
import { Sheet } from './Sheet';
import { Slider } from './Slider';
import { Toggle } from './Toggle';
import { LOG_ENTRIES, SAVED_SPOT_IDS } from '@/data/logEntries';
import type { Difficulty, Spot } from '@/data/types';
import { distanceKm, HOME_POINT } from '@/map/projection';
import { useTheme } from '@/theme/useTheme';

const HEIGHT_MAX_DEFAULT = 30;
const DEPTH_MAX_DEFAULT = 15;
const DISTANCE_OPTIONS: ReadonlyArray<{ km: number; label: string }> = [
  { km: 10, label: '10km' },
  { km: 50, label: '50km' },
  { km: 100, label: '100km' },
];
const RATING_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 0, label: 'any' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 4.5, label: '4.5+' },
];
const EXP_OPTIONS: ReadonlyArray<{ value: Difficulty | 'any'; label: string }> = [
  { value: 'any', label: 'any' },
  { value: 'beginner', label: 'beginner' },
  { value: 'intermediate', label: 'intermediate' },
  // Design uses "expert"; our schema uses "advanced" — same thing.
  { value: 'advanced', label: 'expert' },
];

export type FilterValues = {
  heightMax: number;
  depthMax: number;
  distanceMaxKm: number;
  favoritesOnly: boolean;
  hasMedia: boolean;
  hasBeenJumped: boolean;
  minRating: number;
  exp: Difficulty | 'any';
};

export const EMPTY_FILTERS: FilterValues = {
  heightMax: HEIGHT_MAX_DEFAULT,
  depthMax: DEPTH_MAX_DEFAULT,
  distanceMaxKm: 100,
  favoritesOnly: false,
  hasMedia: false,
  hasBeenJumped: false,
  minRating: 0,
  exp: 'any',
};

export function isFilterActive(f: FilterValues): boolean {
  return (
    f.heightMax !== HEIGHT_MAX_DEFAULT ||
    f.depthMax !== DEPTH_MAX_DEFAULT ||
    f.distanceMaxKm !== 100 ||
    f.favoritesOnly ||
    f.hasMedia ||
    f.hasBeenJumped ||
    f.minRating !== 0 ||
    f.exp !== 'any'
  );
}

const SEEDED_JUMPED_SET: ReadonlySet<string> = new Set(
  LOG_ENTRIES.map((e) => e.spotId),
);
const SEEDED_SAVED_SET: ReadonlySet<string> = new Set(SAVED_SPOT_IDS);

/** Pure filter predicate — applied alongside category + search filters on Map. */
export function passesFilters(
  spot: Spot,
  f: FilterValues,
  savedIds: ReadonlySet<string> = SEEDED_SAVED_SET,
  jumpedIds: ReadonlySet<string> = SEEDED_JUMPED_SET,
): boolean {
  if (spot.height_m > f.heightMax) return false;
  if (spot.depth_m > f.depthMax) return false;
  if (distanceKm(HOME_POINT, spot) > f.distanceMaxKm) return false;
  if (f.favoritesOnly && !savedIds.has(spot.id)) return false;
  if (f.hasMedia && spot.photos.length === 0) return false;
  if (f.hasBeenJumped && !jumpedIds.has(spot.id)) return false;
  if (spot.rating < f.minRating) return false;
  if (f.exp !== 'any' && spot.difficulty !== f.exp) return false;
  return true;
}

export type FiltersProps = {
  visible: boolean;
  initialValues: FilterValues;
  onApply: (next: FilterValues) => void;
  onClose: () => void;
  /** Visible spot count after filters apply — feeds the "Apply · N spots" CTA. */
  matchCount: number;
};

export function Filters({ visible, initialValues, onApply, onClose, matchCount }: FiltersProps) {
  const t = useTheme();
  const [v, setV] = useState<FilterValues>(initialValues);

  useEffect(() => {
    if (visible) setV(initialValues);
  }, [visible, initialValues]);

  const update = <K extends keyof FilterValues>(key: K, val: FilterValues[K]) =>
    setV((prev) => ({ ...prev, [key]: val }));

  return (
    <Sheet visible={visible} onClose={onClose} testID="filters-sheet">
      <ScrollView
        contentContainerStyle={{ paddingTop: 6, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header: Filters / Clear all */}
        <View
          style={{
            paddingHorizontal: 22,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontFamily: 'Poppins_700Bold',
              fontWeight: '700',
              fontSize: 22,
              letterSpacing: -0.22,
              color: t.palette.ink,
            }}
          >
            Filters
          </Text>
          <Pressable onPress={() => setV(EMPTY_FILTERS)} accessibilityRole="button" hitSlop={6}>
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontWeight: '500',
                fontSize: 13,
                color: t.palette.accent,
              }}
            >
              Clear all
            </Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 14, gap: 14 }}>
          <SliderRow
            label="Jump height"
            value={v.heightMax}
            max={HEIGHT_MAX_DEFAULT}
            unit="m"
            onChange={(x) => update('heightMax', x)}
          />
          <SliderRow
            label="Water depth"
            value={v.depthMax}
            max={DEPTH_MAX_DEFAULT}
            unit="m"
            onChange={(x) => update('depthMax', x)}
          />

          <PickerSection
            label="Distance"
            options={DISTANCE_OPTIONS.map((d) => ({ key: String(d.km), label: d.label }))}
            selected={String(v.distanceMaxKm)}
            onSelect={(k) => update('distanceMaxKm', Number(k))}
          />

          <ToggleRow
            label="Favorites only"
            sub="Show pins you've saved"
            value={v.favoritesOnly}
            onChange={(x) => update('favoritesOnly', x)}
          />
          <ToggleRow
            label="Has photos / videos"
            value={v.hasMedia}
            onChange={(x) => update('hasMedia', x)}
          />
          <ToggleRow
            label="Has been jumped"
            sub="At least one logged jump"
            value={v.hasBeenJumped}
            onChange={(x) => update('hasBeenJumped', x)}
          />

          <RatingSection value={v.minRating} onChange={(x) => update('minRating', x)} />
          <ExpSection value={v.exp} onChange={(x) => update('exp', x)} />
        </View>

        <View
          style={{
            paddingHorizontal: 22,
            paddingTop: 14,
            paddingBottom: 24,
            flexDirection: 'row',
            gap: 10,
            borderTopWidth: 1,
            borderTopColor: t.palette.line2,
            marginTop: 14,
          }}
        >
          <Button
            label="Reset"
            variant="outline"
            onPress={() => setV(EMPTY_FILTERS)}
            style={{ flex: 1, paddingVertical: 15 }}
            textStyle={{
              fontFamily: 'Poppins_600SemiBold',
              fontWeight: '500',
              fontSize: 14,
            }}
          />
          <Button
            label={`Apply · ${matchCount} ${matchCount === 1 ? 'spot' : 'spots'}`}
            variant="primary"
            onPress={() => {
              onApply(v);
              onClose();
            }}
            style={{ flex: 2, paddingVertical: 15 }}
            textStyle={{
              fontFamily: 'Poppins_600SemiBold',
              fontWeight: '600',
              fontSize: 14,
            }}
          />
        </View>
      </ScrollView>
    </Sheet>
  );
}

function SliderRow({
  label,
  value,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
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
          {value}
          {unit}
        </Text>
      </View>
      <Slider value={value} onValueChange={onChange} min={0} max={max} />
    </View>
  );
}

function PickerSection({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: ReadonlyArray<{ key: string; label: string }>;
  selected: string;
  onSelect: (key: string) => void;
}) {
  const t = useTheme();
  return (
    <View>
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontWeight: '500',
          fontSize: 14,
          color: t.palette.ink,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {options.map((o) => {
          const on = o.key === selected;
          return (
            <Pressable
              key={o.key}
              onPress={() => onSelect(o.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: on ? t.palette.accent : t.palette.sheetSoft,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Montserrat_600SemiBold',
                  fontWeight: '600',
                  fontSize: 13,
                  color: on ? t.palette.on.accent : t.palette.ink,
                }}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ToggleRow({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: t.palette.line2,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Inter_500Medium', fontWeight: '500', fontSize: 14, color: t.palette.ink }}>
          {label}
        </Text>
        {sub ? (
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: t.palette.ink3, marginTop: 1 }}>
            {sub}
          </Text>
        ) : null}
      </View>
      <Toggle value={value} onValueChange={onChange} accessibilityLabel={label} />
    </View>
  );
}

function RatingSection({
  value,
  onChange,
}: {
  value: number;
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
          Minimum rating
        </Text>
        <Text
          style={{
            fontFamily: 'Montserrat_600SemiBold',
            fontWeight: '600',
            fontSize: 13,
            color: t.palette.accent,
          }}
        >
          {value > 0 ? `${value.toFixed(1)}+` : 'any'}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {RATING_OPTIONS.map((r) => {
          const on = r.value === value;
          return (
            <Pressable
              key={r.value}
              onPress={() => onChange(r.value)}
              accessibilityRole="button"
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: on ? t.palette.accent : t.palette.line2,
                backgroundColor: on ? `${t.palette.accent}1a` : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Montserrat_600SemiBold',
                  fontWeight: '600',
                  fontSize: 12,
                  color: on ? t.palette.accent : t.palette.ink,
                }}
              >
                {r.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ExpSection({
  value,
  onChange,
}: {
  value: Difficulty | 'any';
  onChange: (v: Difficulty | 'any') => void;
}) {
  const t = useTheme();
  return (
    <View>
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontWeight: '500',
          fontSize: 14,
          color: t.palette.ink,
          marginBottom: 8,
        }}
      >
        Experience needed
      </Text>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        {EXP_OPTIONS.map((e) => {
          const on = e.value === value;
          return (
            <Pressable
              key={e.value}
              onPress={() => onChange(e.value)}
              accessibilityRole="button"
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
                  textTransform: 'capitalize',
                  color: on ? t.palette.accent : t.palette.ink,
                }}
              >
                {e.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
