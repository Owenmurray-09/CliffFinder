import { create } from 'zustand';

type AuthStore = {
  isAuthenticated: boolean;
  hasGrantedLocation: boolean;
  signIn: () => void;
  signOut: () => void;
  grantLocation: () => void;
  declineLocation: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  hasGrantedLocation: false,
  signIn: () => set({ isAuthenticated: true }),
  signOut: () => set({ isAuthenticated: false, hasGrantedLocation: false }),
  grantLocation: () => set({ hasGrantedLocation: true }),
  declineLocation: () => set({ hasGrantedLocation: true }), // sentinel: prompted
}));

// Email regex per HANDOFF "Sign-in flow" — adequate for client-side validation.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

export type SigninError =
  | 'email_required'
  | 'email_invalid'
  | 'password_required'
  | 'password_too_short'
  | 'name_required'
  | 'confirm_mismatch';

export const ERROR_MESSAGES: Record<SigninError, string> = {
  email_required: 'Enter your email.',
  email_invalid: 'Enter a valid email.',
  password_required: 'Enter your password.',
  password_too_short: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  name_required: 'Enter your name.',
  confirm_mismatch: 'Passwords do not match.',
};

export const validateSignin = (email: string, password: string): SigninError | null => {
  if (!email) return 'email_required';
  if (!EMAIL_RE.test(email)) return 'email_invalid';
  if (!password) return 'password_required';
  if (password.length < MIN_PASSWORD_LENGTH) return 'password_too_short';
  return null;
};

export const validateSignup = (
  name: string,
  email: string,
  password: string,
  confirm: string,
): SigninError | null => {
  if (!name.trim()) return 'name_required';
  const base = validateSignin(email, password);
  if (base) return base;
  if (password !== confirm) return 'confirm_mismatch';
  return null;
};

export const validateForgot = (email: string): SigninError | null => {
  if (!email) return 'email_required';
  if (!EMAIL_RE.test(email)) return 'email_invalid';
  return null;
};
