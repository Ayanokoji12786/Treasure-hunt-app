import type { Hunt } from "../types";

const MINUTES_PER_CLUE: Record<Hunt["difficulty"], number> = {
  easy: 8,
  medium: 12,
  hard: 18,
};

/** A clearly-approximate play-time range, derived from clue count and difficulty. */
export function estimateDuration(hunt: Hunt): string {
  const per = MINUTES_PER_CLUE[hunt.difficulty];
  const total = per * Math.max(hunt.clues.length, 1);
  const low = Math.max(5, Math.round((total * 0.8) / 5) * 5);
  const high = Math.max(low + 5, Math.round((total * 1.3) / 5) * 5);
  if (high >= 60) {
    const fmt = (m: number) => (m % 60 === 0 ? `${m / 60}` : (m / 60).toFixed(1));
    return `~${fmt(low)}–${fmt(high)}h`;
  }
  return `~${low}–${high} min`;
}
