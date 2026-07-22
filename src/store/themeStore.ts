import { create } from "zustand";
import { storage } from "../lib/storage";

interface ThemeState {
  theme: "light" | "dark";
  toggle: () => void;
}

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

const initial = storage.getTheme();
applyTheme(initial);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initial,
  toggle: () => {
    const next = get().theme === "light" ? "dark" : "light";
    storage.setTheme(next);
    applyTheme(next);
    set({ theme: next });
  },
}));
