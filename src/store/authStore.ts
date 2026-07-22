import { create } from "zustand";
import { storage } from "../lib/storage";
import { generateId, hashPassword } from "../lib/id";
import type { User } from "../types";

interface AuthState {
  currentUser: User | null;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

function findSessionUser(): User | null {
  const id = storage.getSessionUserId();
  if (!id) return null;
  return storage.getUsers().find((u) => u.id === id) ?? null;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: findSessionUser(),
  error: null,

  register: async (name, email, password) => {
    const users = storage.getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      set({ error: "An account with this email already exists." });
      return false;
    }
    const user: User = {
      id: generateId(),
      name,
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    storage.setUsers([...users, user]);
    storage.setSessionUserId(user.id);
    set({ currentUser: user, error: null });
    return true;
  },

  login: async (email, password) => {
    const users = storage.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      set({ error: "No account found with this email." });
      return false;
    }
    const hash = await hashPassword(password);
    if (hash !== user.passwordHash) {
      set({ error: "Incorrect password." });
      return false;
    }
    storage.setSessionUserId(user.id);
    set({ currentUser: user, error: null });
    return true;
  },

  logout: () => {
    storage.setSessionUserId(null);
    set({ currentUser: null });
  },

  clearError: () => set({ error: null }),
}));
