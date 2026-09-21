import type { Difficulty } from "../types";

const DOT: Record<Difficulty, string> = {
  easy: "bg-explorer-500",
  medium: "bg-gold-500",
  hard: "bg-rose-400",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[var(--luma-raised)]/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-200 backdrop-blur-sm">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[difficulty]}`} aria-hidden />
      {difficulty}
    </span>
  );
}
