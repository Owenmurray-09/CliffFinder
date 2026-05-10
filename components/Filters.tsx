import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button } from './Button';
import { Chip } from './Chip';
import { Sheet } from './Sheet';
import { Slider } from './Slider';
import type { Difficulty, WaterType } from '@/data/types';
import { useTheme } from '@/theme/useTheme';

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

export const HEIGHT_MAX_DEFAULT = 50;

export type FilterValues = {
  heightMax: number;
  difficulties: ReadonlySet<Difficulty>;
  waterTypes: ReadonlySet<WaterType>;
};

export const EMPTY_FILTERS: FilterValues = {
  heightMax: HEIGHT_MAX_DEFAULT,
  difficulties: new Set(),
  waterTypes: new Set(),
};

export function isFilterActive(f: FilterValues): boolean {
  return (
    f.heightMax !== HEIGHT_MAX_DEFAULT || f.difficulties.size > 0 || f.waterTypes.size > 0
  );
}

export type FiltersProps = {
  visible: boolean;
  initialValues: FilterValues;
  onApply: (next: FilterValues) => void;
  onClose: () => void;
};

export function Filters({ visible, initialValues, onApply, onClose }: FiltersProps) {
  const t = useTheme();
  // Buffer state: edits don't propagate until Apply is tapped.
  const [heightMax, setHeightMax] = useState(initialValues.heightMax);
  const [difficulties, setDifficulties] = useState<Set<Difficulty>>(
    new Set(initialValues.difficulties),
  );
  const [waterTypes, setWaterTypes] = useState<Set<WaterType>>(
    new Set(initialValues.waterTypes),
  );

  // Reset the buffer to the live values whenever the sheet (re)opens.
  useEffect(() => {
    if (visible) {
      setHeightMax(initialValues.heightMax);
      setDifficulties(new Set(initialValues.difficulties));
      setWaterTypes(new Set(initialValues.waterTypes));
    }
  }, [visible, initialValues]);

  const toggleDifficulty = (key: Difficulty) => {
    setDifficulties((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const toggleWaterType = (key: WaterType) => {
    setWaterTypes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleReset = () => {
    setHeightMax(HEIGHT_MAX_DEFAULT);
    setDifficulties(new Set());
    setWaterTypes(new Set());
  };

  const handleApply = () => {
    onApply({ heightMax, difficulties, waterTypes });
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} testID="filters-sheet">
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[t.typography.title, { color: t.palette.ink }]}>Filters</Text>

        <View style={{ gap: t.spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>
              max height
            </Text>
            <Text style={[t.typography.body, { color: t.palette.ink2 }]}>{heightMax}m</Text>
          </View>
          <Slider value={heightMax} onValueChange={setHeightMax} min={0} max={50} />
        </View>

        <View style={{ gap: t.spacing.sm }}>
          <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>difficulty</Text>
          <View style={{ flexDirection: 'row', gap: t.spacing.sm, flexWrap: 'wrap' }}>
            {DIFFICULTIES.map((d) => (
              <Chip
                key={d.key}
                label={d.label}
                selected={difficulties.has(d.key)}
                onPress={() => toggleDifficulty(d.key)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: t.spacing.sm }}>
          <Text style={[t.typography.fieldLabel, { color: t.palette.ink3 }]}>water type</Text>
          <View style={{ flexDirection: 'row', gap: t.spacing.sm, flexWrap: 'wrap' }}>
            {WATER_TYPES.map((w) => (
              <Chip
                key={w.key}
                label={w.label}
                selected={waterTypes.has(w.key)}
                onPress={() => toggleWaterType(w.key)}
              />
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'center', marginTop: 8 }}>
          <Button
            label="Apply"
            variant="primary"
            onPress={handleApply}
            style={{ flex: 1 }}
          />
          <Button label="Reset" variant="link" onPress={handleReset} />
        </View>
      </ScrollView>
    </Sheet>
  );
}

/** Pure filter predicate — applied alongside category + search filters. */
export function passesFilters(
  spot: { difficulty: Difficulty; waterType: WaterType; height_m: number },
  f: FilterValues,
): boolean {
  if (spot.height_m > f.heightMax) return false;
  if (f.difficulties.size > 0 && !f.difficulties.has(spot.difficulty)) return false;
  if (f.waterTypes.size > 0 && !f.waterTypes.has(spot.waterType)) return false;
  return true;
}
