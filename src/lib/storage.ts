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

// Drafts embed cover/reference photos as base64 data URLs, which can exceed the ~5MB
// localStorage quota. Surface that as a real error the caller can show rather than an
// opaque DOMException.
function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error(
      "Not enough browser storage to save this draft — the photos are likely too large. Try smaller images, or publish the hunt instead.",
    );
  }
}

export const storage = {
  getDrafts: () => read<Hunt[]>(KEYS.drafts, []),
  setDrafts: (drafts: Hunt[]) => write(KEYS.drafts, drafts),

  getHintsUsed: () => read<Record<string, number[]>>(KEYS.hintsUsed, {}),
  setHintsUsed: (map: Record<string, number[]>) => write(KEYS.hintsUsed, map),
};
