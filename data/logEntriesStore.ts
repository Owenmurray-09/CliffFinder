import { create } from 'zustand';
import { LOG_ENTRIES as SEED } from './logEntries';
import type { LogEntry } from './types';

export type NewLogEntry = Omit<LogEntry, 'id' | 'date'> & {
  /** Optional ISO date (defaults to today). */
  date?: string;
};

type LogEntriesState = {
  entries: LogEntry[];
  addEntry: (entry: NewLogEntry) => LogEntry;
  reset: () => void;
};

const today = (): string => new Date().toISOString().slice(0, 10);
let nextId = 1;
const makeId = (): string => `log-${Date.now().toString(36)}-${nextId++}`;

export const useLogEntriesStore = create<LogEntriesState>((set) => ({
  entries: [...SEED],
  addEntry: (entry) => {
    const created: LogEntry = {
      ...entry,
      id: makeId(),
      date: entry.date ?? today(),
    };
    set((state) => ({ entries: [created, ...state.entries] }));
    return created;
  },
  reset: () => set({ entries: [...SEED] }),
}));
