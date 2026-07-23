import { create } from "zustand";
import { base44 } from "../lib/base44";
import type { AppUser } from "../types";

function toAppUser(user: { id: string; email: string; full_name?: string | null }): AppUser {
  return { id: user.id, name: user.full_name || user.email, email: user.email };
}

interface AuthState {
  currentUser: AppUser | null;
  loading: boolean;
  error: string | null;
  restoreSession: () => Promise<void>;
  register: (email: string, password: string) => Promise<boolean>;
  verifyOtp: (email: string, otpCode: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (fromUrl?: string) => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<boolean>;
  setDisplayName: (name: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  loading: true,
  error: null,

  restoreSession: async () => {
    try {
      // Skip the network round-trip (and its noisy 401) when there's no stored token
      // — the SDK persists it here after login / OAuth redirect.
      const hasToken =
        typeof window !== "undefined" && !!window.localStorage.getItem("base44_access_token");
      if (hasToken) {
        const user = await base44.auth.me();
        set({ currentUser: toAppUser(user) });
      }
    } catch {
      // token invalid/expired; stay logged out
    } finally {
      set({ loading: false });
    }
  },

  register: async (email, password) => {
    try {
      await base44.auth.register({ email, password });
      set({ error: null });
      return true;
    } catch (err) {
      set({ error: errorMessage(err) });
      return false;
    }
  },

  verifyOtp: async (email, otpCode) => {
    try {
      await base44.auth.verifyOtp({ email, otpCode });
      set({ error: null });
      return true;
    } catch (err) {
      set({ error: errorMessage(err) });
      return false;
    }
  },

  resendOtp: async (email) => {
    try {
      await base44.auth.resendOtp(email);
      return true;
    } catch (err) {
      set({ error: errorMessage(err) });
      return false;
    }
  },

  login: async (email, password) => {
    try {
      const { user } = await base44.auth.loginViaEmailPassword(email, password);
      set({ currentUser: toAppUser(user), error: null });
      return true;
    } catch (err) {
      set({ error: errorMessage(err) });
      return false;
    }
  },

  loginWithGoogle: (fromUrl) => {
    base44.auth.loginWithProvider("google", fromUrl ?? "/explore");
  },

  requestPasswordReset: async (email) => {
    try {
      await base44.auth.resetPasswordRequest(email);
      set({ error: null });
      return true;
    } catch (err) {
      set({ error: errorMessage(err) });
      return false;
    }
  },

  resetPassword: async (resetToken, newPassword) => {
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      set({ error: null });
      return true;
    } catch (err) {
      set({ error: errorMessage(err) });
      return false;
    }
  },

  setDisplayName: async (name) => {
    const current = get().currentUser;
    if (!current) return;
    await base44.entities.User.update(current.id, { full_name: name });
    set({ currentUser: { ...current, name } });
  },

  logout: () => {
    base44.auth.logout();
    set({ currentUser: null });
  },

  clearError: () => set({ error: null }),
}));
