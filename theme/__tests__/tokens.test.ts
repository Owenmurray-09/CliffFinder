import {
  ACCENTS,
  ACCENT_KEYS,
  DANGER,
  ON,
  PIN,
  STAR,
  darkColors,
  glass,
  lightColors,
  radius,
  shadows,
  spacing,
  typography,
} from '../tokens';

const colorKeys = ['paper', 'paper2', 'sheetBg', 'sheetSoft', 'ink', 'ink2', 'ink3', 'line', 'line2', 'chipBorder', 'glassBorder'].sort();

describe('tokens — palettes', () => {
  test('light palette has the exact expected key set', () => {
    expect(Object.keys(lightColors).sort()).toEqual(colorKeys);
  });

  test('dark palette has the exact expected key set', () => {
    expect(Object.keys(darkColors).sort()).toEqual(colorKeys);
  });

  test('light palette matches design HTML byte-exact', () => {
    expect(lightColors).toEqual({
      paper: '#F2EAD0',
      paper2: '#E8DDBE',
      sheetBg: '#FBF8EE',
      sheetSoft: 'rgba(30,47,35,0.06)',
      ink: '#1E2F23',
      ink2: '#3a4a3e',
      ink3: '#7a8579',
      line: 'rgba(30,47,35,0.12)',
      line2: 'rgba(30,47,35,0.06)',
      chipBorder: 'rgba(30,47,35,0.12)',
      glassBorder: 'rgba(30,47,35,0.08)',
    });
  });

  test('dark palette matches design HTML byte-exact', () => {
    expect(darkColors).toEqual({
      paper: '#0F1A14',
      paper2: '#1A2820',
      sheetBg: '#1A2820',
      sheetSoft: 'rgba(234,226,200,0.08)',
      ink: '#EAE2C8',
      ink2: '#cfc7af',
      ink3: '#9AB096',
      line: 'rgba(234,226,200,0.14)',
      line2: 'rgba(234,226,200,0.06)',
      chipBorder: 'rgba(234,226,200,0.12)',
      glassBorder: 'rgba(234,226,200,0.12)',
    });
  });

  test('chipBorder diverges from line in dark mode (design overrides --line specifically for chip)', () => {
    // Light: chipBorder == line (both 0.12)
    expect(lightColors.chipBorder).toBe(lightColors.line);
    // Dark: chipBorder is 0.12 vs line 0.14 — deliberate per Components.html
    expect(darkColors.chipBorder).not.toBe(darkColors.line);
    expect(darkColors.chipBorder).toBe('rgba(234,226,200,0.12)');
  });

  test('sheetSoft is an alpha overlay, not a solid hex', () => {
    expect(lightColors.sheetSoft).toMatch(/^rgba\(/);
    expect(darkColors.sheetSoft).toMatch(/^rgba\(/);
  });

  test('sheetBg is distinct from paper in light mode', () => {
    expect(lightColors.sheetBg).not.toEqual(lightColors.paper);
  });
});

describe('tokens — accent + pin', () => {
  test('exposes exactly 4 accent options with the brief hex values', () => {
    expect(ACCENT_KEYS).toEqual(['blue', 'orange', 'green', 'ink']);
    expect(ACCENTS.blue).toBe('#7BA7C8');
    expect(ACCENTS.orange).toBe('#E07A2E');
    expect(ACCENTS.green).toBe('#2E7D32');
    expect(ACCENTS.ink).toBe('#1E2F23');
  });

  test('accent values are unique', () => {
    const values = Object.values(ACCENTS);
    expect(new Set(values).size).toBe(values.length);
  });

  test('pin colors match the design HTML', () => {
    expect(PIN).toEqual({
      trending: '#E07A2E',
      saved: '#E8B742',
      friends: '#D17EA8',
    });
  });

  test('pin saved + friends are not in any accent palette', () => {
    const accentValues = Object.values(ACCENTS) as string[];
    expect(accentValues).not.toContain(PIN.saved);
    expect(accentValues).not.toContain(PIN.friends);
  });

  test('pin trending coincides with orange accent (regression pin)', () => {
    // Both reference the same hex from the design HTML. If either drifts
    // independently of the other, this fires — forcing a deliberate decision.
    expect(PIN.trending).toBe(ACCENTS.orange);
  });

  test('star + danger tokens', () => {
    expect(STAR.interactive).toBe('#E8B742');
    expect(STAR.readonly).toBe('#C9A227');
    expect(DANGER).toBe('#B0413E');
  });

  test('on-accent / on-pin contrast text is white', () => {
    expect(ON.accent).toBe('#FFFFFF');
    expect(ON.pin).toBe('#FFFFFF');
  });
});

describe('tokens — geometry', () => {
  test('spacing scale matches 4 · 8 · 12 · 16 · 22 · 28 · 40', () => {
    expect([
      spacing.xs,
      spacing.sm,
      spacing.md,
      spacing.lg,
      spacing.xl,
      spacing['2xl'],
      spacing['3xl'],
    ]).toEqual([4, 8, 12, 16, 22, 28, 40]);
  });

  test('radius constants match design HTML', () => {
    expect(radius.pill).toBe(999);
    expect(radius.sheet).toBe(28);
    expect(radius.tabBar).toBe(22);
    expect(radius.card).toBe(16); // .card surfaces
    expect(radius.control).toBe(14); // buttons, fields, glass
    expect(radius.cardSm).toBe(12);
  });
});

describe('tokens — typography', () => {
  test('display is Poppins 700 / 28', () => {
    expect(typography.display.fontFamily).toBe('Poppins_700Bold');
    expect(typography.display.fontSize).toBe(28);
    expect(typography.display.fontWeight).toBe('700');
  });

  test('statNumber is Montserrat 700 / 18 (design source, not HANDOFF\'s 22)', () => {
    expect(typography.statNumber.fontFamily).toBe('Montserrat_700Bold');
    expect(typography.statNumber.fontSize).toBe(18);
  });

  test('statLabel is Inter 400 / 10.5, uppercase, letterSpacing 0.6', () => {
    expect(typography.statLabel.fontFamily).toBe('Inter_400Regular');
    expect(typography.statLabel.fontSize).toBe(10.5);
    expect(typography.statLabel.fontWeight).toBe('400');
    expect(typography.statLabel.textTransform).toBe('uppercase');
    expect(typography.statLabel.letterSpacing).toBe(0.6);
  });

  test('fieldLabel is uppercase with letterSpacing 0.6', () => {
    expect(typography.fieldLabel.textTransform).toBe('uppercase');
    expect(typography.fieldLabel.letterSpacing).toBe(0.6);
    expect(typography.fieldLabel.fontSize).toBe(11);
  });

  test('input is Inter 400 / 14.5 (matches design `.field input`)', () => {
    expect(typography.input.fontFamily).toBe('Inter_400Regular');
    expect(typography.input.fontSize).toBe(14.5);
    expect(typography.input.fontWeight).toBe('400');
  });
});

describe('tokens — shadows', () => {
  test('sm/md/lg numeric values', () => {
    expect(shadows.sm.shadowOpacity).toBe(0.06);
    expect(shadows.sm.shadowRadius).toBe(3);
    expect(shadows.md.shadowOpacity).toBe(0.1);
    expect(shadows.md.shadowRadius).toBe(12);
    expect(shadows.lg.shadowOpacity).toBe(0.18);
    expect(shadows.lg.shadowRadius).toBe(28);
  });

  test('sheet shadow projects upward (negative Y offset)', () => {
    expect(shadows.sheet.shadowOffset).toEqual({ width: 0, height: -10 });
    expect(shadows.sheet.shadowRadius).toBe(40);
  });
});

describe('tokens — glass', () => {
  test('search intensity 24, light tint 85% white', () => {
    expect(glass.search.intensity).toBe(24);
    expect(glass.search.tint.light).toBe('rgba(255,255,255,0.85)');
  });

  test('topbar intensity 18, paper-tinted at 78% (matches design color-mix)', () => {
    expect(glass.topbar.intensity).toBe(18);
    expect(glass.topbar.tint.light).toContain('0.78');
  });

  test('tabBar intensity 20', () => {
    expect(glass.tabBar.intensity).toBe(20);
  });
});
