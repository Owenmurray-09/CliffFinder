import { useAuthStore } from '@/auth/store';
import { useLogEntriesStore } from './logEntriesStore';
import { useSavedSpotsStore } from './savedSpotsStore';
import { useSpotsStore } from './spotsStore';

/**
 * Whenever the auth state flips, refresh / clear the data stores accordingly.
 * Imported by the root layout for its side effect — runs once at module load.
 */

let lastAuthed: boolean | null = null;
useAuthStore.subscribe((state) => {
  const authed = state.isAuthenticated;
  if (authed === lastAuthed) return;
  lastAuthed = authed;

  if (authed) {
    useSpotsStore.getState().loadSpots();
    useSavedSpotsStore.getState().loadSavedSpots();
    useLogEntriesStore.getState().loadLogEntries();
  } else {
    useSpotsStore.getState().clear();
    useSavedSpotsStore.getState().clear();
    useLogEntriesStore.getState().clear();
  }
});
