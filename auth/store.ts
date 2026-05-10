import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

type AuthStore = {
  session: Session | null;
  isAuthenticated: boolean;
  hasGrantedLocation: boolean;
  /** True once we've checked for an existing session on app boot. */
  bootstrapped: boolean;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signUpWithPassword: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<string | null>;
  grantLocation: () => void;
  declineLocation: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  isAuthenticated: false,
  hasGrantedLocation: false,
  bootstrapped: false,

  signInWithPassword: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  },

  signUpWithPassword: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: name ? { data: { name } } : undefined,
    });
    if (error) return { error: error.message, needsConfirmation: false };
    return { error: null, needsConfirmation: !data.session };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ hasGrantedLocation: false });
  },

  sendPasswordReset: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return error?.message ?? null;
  },

  grantLocation: () => set({ hasGrantedLocation: true }),
  declineLocation: () => set({ hasGrantedLocation: true }),
}));

// Restore an existing session on app boot, then keep the store in sync with
// any later auth events (sign-in, sign-out, token refresh, password reset).
supabase.auth.getSession().then(({ data }) => {
  useAuthStore.setState({
    session: data.session,
    isAuthenticated: !!data.session,
    bootstrapped: true,
  });
});
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({
    session,
    isAuthenticated: !!session,
  });
});

export {
  EMAIL_RE,
  ERROR_MESSAGES,
  MIN_PASSWORD_LENGTH,
  type SigninError,
  validateForgot,
  validateSignin,
  validateSignup,
} from './validation';
