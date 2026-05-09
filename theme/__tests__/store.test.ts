import { useThemeStore } from '../store';

const reset = () => {
  useThemeStore.setState({ dark: false, accent: 'blue' });
};

describe('useThemeStore', () => {
  beforeEach(reset);

  test('default state is light + blue accent', () => {
    expect(useThemeStore.getState().dark).toBe(false);
    expect(useThemeStore.getState().accent).toBe('blue');
  });

  test('setAccent updates the accent key', () => {
    useThemeStore.getState().setAccent('orange');
    expect(useThemeStore.getState().accent).toBe('orange');
    useThemeStore.getState().setAccent('green');
    expect(useThemeStore.getState().accent).toBe('green');
    useThemeStore.getState().setAccent('ink');
    expect(useThemeStore.getState().accent).toBe('ink');
  });

  test('setDark updates dark', () => {
    useThemeStore.getState().setDark(true);
    expect(useThemeStore.getState().dark).toBe(true);
    useThemeStore.getState().setDark(false);
    expect(useThemeStore.getState().dark).toBe(false);
  });

  test('toggleDark flips dark', () => {
    expect(useThemeStore.getState().dark).toBe(false);
    useThemeStore.getState().toggleDark();
    expect(useThemeStore.getState().dark).toBe(true);
    useThemeStore.getState().toggleDark();
    expect(useThemeStore.getState().dark).toBe(false);
  });
});
