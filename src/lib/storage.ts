import type { Hunt } from "../types";

const KEYS = {
  drafts: "lh_drafts",
  hintsUsed: "lh_hints_used",
} as const;

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getDrafts: () => read<Hunt[]>(KEYS.drafts, []),
  setDrafts: (drafts: Hunt[]) => write(KEYS.drafts, drafts),

  getHintsUsed: () => read<Record<string, number[]>>(KEYS.hintsUsed, {}),
  setHintsUsed: (map: Record<string, number[]>) => write(KEYS.hintsUsed, map),
};
