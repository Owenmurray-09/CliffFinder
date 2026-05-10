import { fireEvent, render } from '@testing-library/react-native';
import {
  EMPTY_FILTERS,
  Filters,
  HEIGHT_MAX_DEFAULT,
  isFilterActive,
  passesFilters,
} from '../Filters';
import { SPOTS } from '@/data/spots';
import type { Difficulty, WaterType } from '@/data/types';

describe('passesFilters', () => {
  test('default empty filters passes everything', () => {
    for (const s of SPOTS) {
      expect(passesFilters(s, EMPTY_FILTERS)).toBe(true);
    }
  });

  test('heightMax filters out taller spots', () => {
    const eagle = SPOTS.find((s) => s.id === 'eagle')!; // 18m
    const mossy = SPOTS.find((s) => s.id === 'mossy')!; // 22m
    const f = { ...EMPTY_FILTERS, heightMax: 20 };
    expect(passesFilters(eagle, f)).toBe(true);
    expect(passesFilters(mossy, f)).toBe(false);
  });

  test('difficulties: empty set passes all', () => {
    for (const s of SPOTS) {
      expect(passesFilters(s, EMPTY_FILTERS)).toBe(true);
    }
  });

  test('difficulties: matches only selected', () => {
    const f = {
      ...EMPTY_FILTERS,
      difficulties: new Set<Difficulty>(['beginner']),
    };
    const beginner = SPOTS.find((s) => s.difficulty === 'beginner')!;
    const advanced = SPOTS.find((s) => s.difficulty === 'advanced')!;
    expect(passesFilters(beginner, f)).toBe(true);
    expect(passesFilters(advanced, f)).toBe(false);
  });

  test('waterTypes: matches only selected', () => {
    const f = {
      ...EMPTY_FILTERS,
      waterTypes: new Set<WaterType>(['ocean']),
    };
    const eagle = SPOTS.find((s) => s.id === 'eagle')!; // ocean
    const hidden = SPOTS.find((s) => s.id === 'hidden')!; // quarry
    expect(passesFilters(eagle, f)).toBe(true);
    expect(passesFilters(hidden, f)).toBe(false);
  });

  test('combined: difficulty + waterType + height all must pass', () => {
    const f = {
      heightMax: 15,
      difficulties: new Set<Difficulty>(['beginner']),
      waterTypes: new Set<WaterType>(['quarry', 'lake']),
    };
    const hidden = SPOTS.find((s) => s.id === 'hidden')!; // beginner, quarry, 12m
    const riverside = SPOTS.find((s) => s.id === 'riverside')!; // beginner, river, 8m
    expect(passesFilters(hidden, f)).toBe(true);
    expect(passesFilters(riverside, f)).toBe(false); // river not in waterTypes
  });
});

describe('isFilterActive', () => {
  test('default state: not active', () => {
    expect(isFilterActive(EMPTY_FILTERS)).toBe(false);
  });
  test('heightMax changed: active', () => {
    expect(isFilterActive({ ...EMPTY_FILTERS, heightMax: 20 })).toBe(true);
  });
  test('difficulties non-empty: active', () => {
    expect(
      isFilterActive({ ...EMPTY_FILTERS, difficulties: new Set(['beginner']) }),
    ).toBe(true);
  });
  test('waterTypes non-empty: active', () => {
    expect(isFilterActive({ ...EMPTY_FILTERS, waterTypes: new Set(['ocean']) })).toBe(
      true,
    );
  });
});

describe('<Filters /> sheet', () => {
  test('Apply commits buffer state and closes sheet', () => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    const tree = render(
      <Filters
        visible={true}
        initialValues={EMPTY_FILTERS}
        onApply={onApply}
        onClose={onClose}
      />,
    );
    // Toggle a difficulty chip then Apply
    fireEvent.press(tree.getByText('Beginner'));
    fireEvent.press(tree.getByText('Apply'));
    expect(onApply).toHaveBeenCalledTimes(1);
    const applied = onApply.mock.calls[0]![0];
    expect(applied.difficulties.has('beginner')).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('Reset clears buffered chips without applying', () => {
    const onApply = jest.fn();
    const tree = render(
      <Filters
        visible={true}
        initialValues={EMPTY_FILTERS}
        onApply={onApply}
        onClose={jest.fn()}
      />,
    );
    fireEvent.press(tree.getByText('Beginner'));
    fireEvent.press(tree.getByText('Reset'));
    // After reset, Beginner chip is unselected — pressing Apply yields empty difficulties
    fireEvent.press(tree.getByText('Apply'));
    expect(onApply.mock.calls[0]![0].difficulties.size).toBe(0);
    expect(onApply.mock.calls[0]![0].heightMax).toBe(HEIGHT_MAX_DEFAULT);
  });

  test('not visible: sheet content not rendered', () => {
    const tree = render(
      <Filters
        visible={false}
        initialValues={EMPTY_FILTERS}
        onApply={jest.fn()}
        onClose={jest.fn()}
      />,
    );
    expect(tree.queryByText('Filters')).toBeNull();
  });
});
