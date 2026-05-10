import { create } from 'zustand';
import { useAuthStore } from '@/auth/store';
import { supabase } from '@/lib/supabase';
import { todayIso } from './date';
import { logEntryFromRow, logEntryInsertRow, type LogEntryRow } from './rowMappers';
import type { LogEntry } from './types';

export type NewLogEntry = Omit<LogEntry, 'id' | 'date'> & {
  /** Optional ISO date (defaults to today, local). */
  date?: string;
};

type LogEntriesState = {
  entries: LogEntry[];
  loading: boolean;
  error: string | null;
  loadLogEntries: () => Promise<void>;
  addEntry: (entry: NewLogEntry) => Promise<LogEntry | null>;
  clear: () => void;
};

export const useLogEntriesStore = create<LogEntriesState>((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  loadLogEntries: async () => {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) return;
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('log_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ entries: (data as LogEntryRow[]).map(logEntryFromRow), loading: false });
  },

  addEntry: async (entry) => {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) {
      set({ error: 'Not signed in' });
      return null;
    }
    const draft = { ...entry, date: entry.date ?? todayIso() } as Omit<LogEntry, 'id'>;
    const { data, error } = await supabase
      .from('log_entries')
      .insert(logEntryInsertRow(draft, userId))
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      return null;
    }
    const created = logEntryFromRow(data as LogEntryRow);
    set((state) => ({ entries: [created, ...state.entries], error: null }));
    return created;
  },

  clear: () => set({ entries: [], error: null }),
}));
