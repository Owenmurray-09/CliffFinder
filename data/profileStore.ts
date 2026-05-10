import { create } from 'zustand';
import { useAuthStore } from '@/auth/store';
import { supabase } from '@/lib/supabase';

type ProfileRow = {
  id: string;
  avatar_url: string | null;
  cover_url: string | null;
  updated_at: string;
};

type ProfileState = {
  avatarUrl: string | null;
  coverUrl: string | null;
  loading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  setAvatar: (url: string) => Promise<void>;
  setCover: (url: string) => Promise<void>;
  clear: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  avatarUrl: null,
  coverUrl: null,
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
      loading: false,
    });
  },

  setAvatar: async (url) => {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) return;
    set({ avatarUrl: url });
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, avatar_url: url, updated_at: new Date().toISOString() });
    if (error) set({ error: error.message });
  },

  setCover: async (url) => {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) return;
    set({ coverUrl: url });
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, cover_url: url, updated_at: new Date().toISOString() });
    if (error) set({ error: error.message });
  },

  clear: () => set({ avatarUrl: null, coverUrl: null, error: null }),
}));
