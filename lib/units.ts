import { create } from 'zustand';

export type Units = 'metric' | 'imperial';

type UnitsStore = {
  units: Units;
  setUnits: (u: Units) => void;
};

const STORAGE_KEY = 'cf-units';

const readInitial = (): Units => {
  if (typeof globalThis === 'undefined') return 'metric';
  const ls = (globalThis as unknown as { localStorage?: Storage }).localStorage;
  if (!ls) return 'metric';
  const raw = ls.getItem(STORAGE_KEY);
  return raw === 'imperial' ? 'imperial' : 'metric';
};

export const useUnitsStore = create<UnitsStore>((set) => ({
  units: readInitial(),
  setUnits: (units) => {
    set({ units });
    const ls = (globalThis as unknown as { localStorage?: Storage }).localStorage;
    if (ls) ls.setItem(STORAGE_KEY, units);
  },
}));

const M_PER_FT = 3.28084;
const KM_PER_MI = 0.621371;

/** Format a length stored in meters. */
export const formatMeters = (m: number, units: Units): string =>
  units === 'imperial' ? `${Math.round(m * M_PER_FT)} ft` : `${m} m`;

/** Format a depth (adds a trailing "+" for "8+ m / 26+ ft" style). */
export const formatDepth = (m: number, units: Units): string =>
  units === 'imperial' ? `${Math.round(m * M_PER_FT)}+ ft` : `${m}+ m`;

/** Format a water temperature stored in Celsius. */
export const formatTemp = (c: number, units: Units): string =>
  units === 'imperial' ? `${Math.round((c * 9) / 5 + 32)}°F` : `${c}°C`;

/** Format a distance stored in kilometers. */
export const formatDistance = (km: number, units: Units): string => {
  if (units === 'imperial') {
    const mi = km * KM_PER_MI;
    return mi < 10 ? `${mi.toFixed(1)} mi` : `${Math.round(mi)} mi`;
  }
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
};

/** The unit suffix on its own (for slider readouts that already render the value). */
export const lengthUnitLabel = (units: Units): string => (units === 'imperial' ? 'ft' : 'm');
export const tempUnitLabel = (units: Units): string => (units === 'imperial' ? '°F' : '°C');
