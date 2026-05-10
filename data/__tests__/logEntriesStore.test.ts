import { useLogEntriesStore } from '../logEntriesStore';

describe('logEntriesStore', () => {
  beforeEach(() => {
    useLogEntriesStore.getState().reset();
  });

  test('seeds from LOG_ENTRIES', () => {
    const { entries } = useLogEntriesStore.getState();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].spotId).toBeTruthy();
  });

  test('addEntry prepends with a generated id and today date', () => {
    const before = useLogEntriesStore.getState().entries.length;
    const created = useLogEntriesStore.getState().addEntry({
      spotId: 'eagle',
      heightJumped_m: 12,
      waterTemp_c: 14,
      rating: 5,
      tricks: ['cannonball'],
    });

    const { entries } = useLogEntriesStore.getState();
    expect(entries.length).toBe(before + 1);
    expect(entries[0].id).toBe(created.id);
    expect(entries[0].spotId).toBe('eagle');
    expect(entries[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(created.id).toMatch(/^log-/);
  });

  test('addEntry honors an explicit date', () => {
    const created = useLogEntriesStore.getState().addEntry({
      spotId: 'mossy',
      heightJumped_m: 8,
      waterTemp_c: 12,
      rating: 4,
      date: '2025-12-31',
    });
    expect(created.date).toBe('2025-12-31');
  });

  test('reset restores seeded state', () => {
    useLogEntriesStore.getState().addEntry({
      spotId: 'eagle',
      heightJumped_m: 1,
      waterTemp_c: 1,
      rating: 1,
    });
    const seeded = useLogEntriesStore.getState().entries.length - 1;
    useLogEntriesStore.getState().reset();
    expect(useLogEntriesStore.getState().entries.length).toBe(seeded);
  });
});
