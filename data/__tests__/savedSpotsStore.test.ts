import { useSavedSpotsStore } from '../savedSpotsStore';

describe('savedSpotsStore', () => {
  beforeEach(() => {
    useSavedSpotsStore.getState().reset();
  });

  test('seeds from SAVED_SPOTS', () => {
    const { saved, isSaved } = useSavedSpotsStore.getState();
    expect(saved.length).toBeGreaterThan(0);
    expect(isSaved('mossy')).toBe(true);
    expect(isSaved('eagle')).toBe(false);
  });

  test('toggleSaved adds an unsaved spot to the front with today as savedAt', () => {
    const before = useSavedSpotsStore.getState().saved.length;
    useSavedSpotsStore.getState().toggleSaved('eagle');

    const { saved, isSaved } = useSavedSpotsStore.getState();
    expect(saved.length).toBe(before + 1);
    expect(isSaved('eagle')).toBe(true);
    expect(saved[0].spotId).toBe('eagle');
    expect(saved[0].savedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('toggleSaved removes a saved spot', () => {
    useSavedSpotsStore.getState().toggleSaved('mossy');
    expect(useSavedSpotsStore.getState().isSaved('mossy')).toBe(false);
  });

  test('reset restores seeded state', () => {
    useSavedSpotsStore.getState().toggleSaved('eagle');
    useSavedSpotsStore.getState().toggleSaved('mossy');
    useSavedSpotsStore.getState().reset();

    const { isSaved } = useSavedSpotsStore.getState();
    expect(isSaved('eagle')).toBe(false);
    expect(isSaved('mossy')).toBe(true);
  });
});
