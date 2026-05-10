import { fireEvent, render } from '@testing-library/react-native';
import { EMPTY_FILTERS, Filters, isFilterActive, passesFilters } from '../Filters';
import { SPOTS } from '@/data/spots';
import type { FilterValues } from '../Filters';

describe('passesFilters', () => {
  test('default empty filters passes everything', () => {
    for (const s of SPOTS) {
      expect(passesFilters(s, EMPTY_FILTERS)).toBe(true);
    }
  });

  test('heightMax filters out taller spots', () => {
    const eagle = SPOTS.find((s) => s.id === 'eagle')!; // 18m
    const mossy = SPOTS.find((s) => s.id === 'mossy')!; // 22m
    const f: FilterValues = { ...EMPTY_FILTERS, heightMax: 20 };
    expect(passesFilters(eagle, f)).toBe(true);
    expect(passesFilters(mossy, f)).toBe(false);
  });

  test('depthMax filters out deeper spots', () => {
    const eagle = SPOTS.find((s) => s.id === 'eagle')!; // depth 6
    const mossy = SPOTS.find((s) => s.id === 'mossy')!; // depth 10
    const f: FilterValues = { ...EMPTY_FILTERS, depthMax: 8 };
    expect(passesFilters(eagle, f)).toBe(true);
    expect(passesFilters(mossy, f)).toBe(false);
  });

  test('exp single-select matches difficulty', () => {
    const f: FilterValues = { ...EMPTY_FILTERS, exp: 'beginner' };
    const beginner = SPOTS.find((s) => s.difficulty === 'beginner')!;
    const advanced = SPOTS.find((s) => s.difficulty === 'advanced')!;
    expect(passesFilters(beginner, f)).toBe(true);
    expect(passesFilters(advanced, f)).toBe(false);
  });

  test("exp 'any' is a no-op", () => {
    for (const s of SPOTS) {
      expect(passesFilters(s, { ...EMPTY_FILTERS, exp: 'any' })).toBe(true);
    }
  });

  test('minRating filters out low-rated spots', () => {
    const lowRated = SPOTS.find((s) => s.rating < 4)!; // riverside 3.8
    const highRated = SPOTS.find((s) => s.rating >= 4.5)!; // mossy 4.8
    const f: FilterValues = { ...EMPTY_FILTERS, minRating: 4 };
    expect(passesFilters(lowRated, f)).toBe(false);
    expect(passesFilters(highRated, f)).toBe(true);
  });

  test('favoritesOnly includes only saved spots', () => {
    const saved = SPOTS.find((s) => s.id === 'hidden')!; // in SAVED_SPOTS
    const notSaved = SPOTS.find((s) => s.id === 'eagle')!; // not in SAVED_SPOTS
    const f: FilterValues = { ...EMPTY_FILTERS, favoritesOnly: true };
    expect(passesFilters(saved, f)).toBe(true);
    expect(passesFilters(notSaved, f)).toBe(false);
  });

  test('hasBeenJumped includes only spots with at least one log entry', () => {
    const jumped = SPOTS.find((s) => s.id === 'eagle')!; // has a log entry
    const notJumped = SPOTS.find((s) => s.id === 'mossy')!; // no log entry
    const f: FilterValues = { ...EMPTY_FILTERS, hasBeenJumped: true };
    expect(passesFilters(jumped, f)).toBe(true);
    expect(passesFilters(notJumped, f)).toBe(false);
  });

  test('combined: exp + minRating + heightMax', () => {
    const f: FilterValues = {
      ...EMPTY_FILTERS,
      exp: 'beginner',
      minRating: 4,
      heightMax: 15,
    };
    const hidden = SPOTS.find((s) => s.id === 'hidden')!; // beginner, 4.3, 12m
    const riverside = SPOTS.find((s) => s.id === 'riverside')!; // beginner, 3.8, 8m
    expect(passesFilters(hidden, f)).toBe(true);
    expect(passesFilters(riverside, f)).toBe(false); // rating 3.8 < 4
  });
});

describe('isFilterActive', () => {
  test('default state: not active', () => {
    expect(isFilterActive(EMPTY_FILTERS)).toBe(false);
  });
  test('any single dimension changed: active', () => {
    expect(isFilterActive({ ...EMPTY_FILTERS, heightMax: 20 })).toBe(true);
    expect(isFilterActive({ ...EMPTY_FILTERS, depthMax: 5 })).toBe(true);
    expect(isFilterActive({ ...EMPTY_FILTERS, distanceMaxKm: 50 })).toBe(true);
    expect(isFilterActive({ ...EMPTY_FILTERS, favoritesOnly: true })).toBe(true);
    expect(isFilterActive({ ...EMPTY_FILTERS, hasMedia: true })).toBe(true);
    expect(isFilterActive({ ...EMPTY_FILTERS, hasBeenJumped: true })).toBe(true);
    expect(isFilterActive({ ...EMPTY_FILTERS, minRating: 4 })).toBe(true);
    expect(isFilterActive({ ...EMPTY_FILTERS, exp: 'beginner' })).toBe(true);
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
        previewCount={() => 5}
      />,
    );
    // Toggle "Favorites only" (exact text match for the row label)
    fireEvent.press(tree.getByLabelText('Favorites only'));
    fireEvent.press(tree.getByText(/^Apply/));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0]![0].favoritesOnly).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('Apply CTA shows the match count', () => {
    const tree = render(
      <Filters
        visible={true}
        initialValues={EMPTY_FILTERS}
        onApply={jest.fn()}
        onClose={jest.fn()}
        previewCount={() => 3}
      />,
    );
    expect(tree.getByText('Apply · 3 spots')).toBeTruthy();
  });

  test('Apply CTA singular when matchCount is 1', () => {
    const tree = render(
      <Filters
        visible={true}
        initialValues={EMPTY_FILTERS}
        onApply={jest.fn()}
        onClose={jest.fn()}
        previewCount={() => 1}
      />,
    );
    expect(tree.getByText('Apply · 1 spot')).toBeTruthy();
  });

  test('Reset clears buffered changes without applying', () => {
    const onApply = jest.fn();
    const tree = render(
      <Filters
        visible={true}
        initialValues={EMPTY_FILTERS}
        onApply={onApply}
        onClose={jest.fn()}
        previewCount={() => 5}
      />,
    );
    fireEvent.press(tree.getByLabelText('Favorites only'));
    fireEvent.press(tree.getByText('Reset'));
    fireEvent.press(tree.getByText(/^Apply/));
    expect(onApply.mock.calls[0]![0].favoritesOnly).toBe(false);
  });

  test('not visible: sheet content not rendered', () => {
    const tree = render(
      <Filters
        visible={false}
        initialValues={EMPTY_FILTERS}
        onApply={jest.fn()}
        onClose={jest.fn()}
        previewCount={() => 5}
      />,
    );
    expect(tree.queryByText('Filters')).toBeNull();
  });
});
