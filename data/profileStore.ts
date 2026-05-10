import { create } from 'zustand';
import { useAuthStore } from '@/auth/store';
import { supabase } from '@/lib/supabase';

type ProfileRow = {
  id: string;
  avatar_url: string | null;
  cover_url: string | null;
  display_name: string | null;
  handle: string | null;
  updated_at: string;
};

type ProfileState = {
  avatarUrl: string | null;
  coverUrl: string | null;
  displayName: string | null;
  handle: string | null;
  loading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  setAvatar: (url: string) => Promise<void>;
  setCover: (url: string) => Promise<void>;
  setDisplayName: (name: string) => Promise<string | null>;
  setHandle: (handle: string) => Promise<string | null>;
  clear: () => void;
};

const upsertField = async (
  userId: string,
  field: Partial<ProfileRow>,
): Promise<string | null> => {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...field, updated_at: new Date().toISOString() });
  return error?.message ?? null;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  avatarUrl: null,
  coverUrl: null,
  displayName: null,
  handle: null,
  loading: false,
  error: null,

  loadProfile: async () => {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) return;
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    const row = data as ProfileRow | null;
    set({
      avatarUrl: row?.avatar_url ?? null,
      coverUrl: row?.cover_url ?? null,
      displayName: row?.display_name ?? null,
      handle: row?.handle ?? null,
      loading: false,
    });
  },

  setAvatar: async (url) => {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) return;
    set({ avatarUrl: url });
    const err = await upsertField(userId, { avatar_url: url });
    if (err) set({ error: err });
  },

  setCover: async (url) => {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) return;
    set({ coverUrl: url });
    const err = await upsertField(userId, { cover_url: url });
    if (err) set({ error: err });
  },

  setDisplayName: async (name) => {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) return 'Not signed in';
    const trimmed = name.trim();
    if (!trimmed) return 'Display name cannot be empty';
    const prev = get().displayName;
    set({ displayName: trimmed });
    const err = await upsertField(userId, { display_name: trimmed });
    if (err) {
      set({ displayName: prev, error: err });
      return err;
    }
    return null;
  },

  setHandle: async (handle) => {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) return 'Not signed in';
    const cleaned = handle.trim().replace(/^@+/, '');
    if (!cleaned) return 'Username cannot be empty';
    if (!/^[a-zA-Z0-9_]+$/.test(cleaned)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    if (cleaned.length < 3 || cleaned.length > 20) {
      return 'Username must be 3–20 characters';
    }
    const prev = get().handle;
    set({ handle: cleaned });
    const err = await upsertField(userId, { handle: cleaned });
    if (err) {
      set({ handle: prev, error: err });
      // Postgres unique-violation surfaces with code 23505 / "duplicate key".
      if (/duplicate key|unique/i.test(err)) return 'That username is taken';
      return err;
    }
    return null;
  },

  clear: () =>
    set({
      avatarUrl: null,
      coverUrl: null,
      displayName: null,
      handle: null,
      error: null,
    }),
}));
