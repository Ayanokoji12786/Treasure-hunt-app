import type { Difficulty } from "../types";

const STYLES: Record<Difficulty, string> = {
  easy: "bg-explorer-500/20 text-explorer-400 border-explorer-500/30",
  medium: "bg-gold-500/20 text-gold-400 border-gold-500/30",
  hard: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium capitalize backdrop-blur ${STYLES[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
