import type { Difficulty, Hunt, Participation } from "../types";

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.4,
  hard: 1.8,
};
const POINTS_PER_CLUE = 100;
const HINT_PENALTY = 15;

export function elapsedSeconds(p: Participation): number {
  return Math.round((new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime()) / 1000);
}

export function computeScore(hunt: Hunt, participation: Participation, hintsUsed: number[]): number {
  const perClue = Math.round(POINTS_PER_CLUE * DIFFICULTY_MULTIPLIER[hunt.difficulty]);
  const hintPenalty = hintsUsed.length * HINT_PENALTY;
  const base = participation.completedClues * perClue - hintPenalty;
  const speedBonus =
    participation.status === "completed"
      ? Math.max(0, 300 - Math.floor(elapsedSeconds(participation) / 5))
      : 0;
  return Math.max(0, base + speedBonus);
}
