import { create } from "zustand";
import { storage } from "../lib/storage";
import { generateId, generateHuntCode } from "../lib/id";
import { SEED_HUNTS } from "../data/seedHunts";
import { verifyPhoto } from "../lib/verify";
import type { Difficulty, Hunt, Participation } from "../types";

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.4,
  hard: 1.8,
};
const POINTS_PER_CLUE = 100;
const HINT_PENALTY = 15;

function ensureSeeded(): Hunt[] {
  const existing = storage.getHunts();
  if (existing.length > 0) return existing;
  storage.setHunts(SEED_HUNTS);
  return SEED_HUNTS;
}

interface HuntState {
  hunts: Hunt[];
  participations: Participation[];
  createHunt: (data: Omit<Hunt, "id" | "code" | "createdAt" | "status">, publish: boolean) => Hunt;
  getHunt: (id: string) => Hunt | undefined;
  getHuntByCode: (code: string) => Hunt | undefined;
  getParticipation: (huntId: string, userId: string) => Participation | undefined;
  startHunt: (huntId: string, userId: string) => Participation;
  useHint: (participationId: string) => void;
  submitVerification: (
    participationId: string,
    imageDataUrl: string,
  ) => Promise<{ verified: boolean; reasoning: string; huntComplete: boolean }>;
  exportHunt: (huntId: string) => string;
  importHunt: (json: string) => Hunt;
}

export const useHuntStore = create<HuntState>((set, get) => ({
  hunts: ensureSeeded(),
  participations: storage.getParticipations(),

  createHunt: (data, publish) => {
    const hunt: Hunt = {
      ...data,
      id: generateId(),
      code: generateHuntCode(),
      status: publish ? "published" : "draft",
      createdAt: new Date().toISOString(),
    };
    const hunts = [...get().hunts, hunt];
    storage.setHunts(hunts);
    set({ hunts });
    return hunt;
  },

  getHunt: (id) => get().hunts.find((h) => h.id === id),

  getHuntByCode: (code) =>
    get().hunts.find((h) => h.code.toLowerCase() === code.trim().toLowerCase()),

  getParticipation: (huntId, userId) =>
    get().participations.find((p) => p.huntId === huntId && p.userId === userId),

  startHunt: (huntId, userId) => {
    const existing = get().getParticipation(huntId, userId);
    if (existing) return existing;
    const participation: Participation = {
      id: generateId(),
      huntId,
      userId,
      status: "in_progress",
      currentClueIndex: 0,
      hintsUsed: [],
      startedAt: new Date().toISOString(),
      score: 0,
    };
    const participations = [...get().participations, participation];
    storage.setParticipations(participations);
    set({ participations });
    return participation;
  },

  useHint: (participationId) => {
    const participations = get().participations.map((p) => {
      if (p.id !== participationId) return p;
      if (p.hintsUsed.includes(p.currentClueIndex)) return p;
      return { ...p, hintsUsed: [...p.hintsUsed, p.currentClueIndex] };
    });
    storage.setParticipations(participations);
    set({ participations });
  },

  submitVerification: async (participationId, imageDataUrl) => {
    const participation = get().participations.find((p) => p.id === participationId);
    if (!participation) throw new Error("Participation not found.");
    const hunt = get().getHunt(participation.huntId);
    if (!hunt) throw new Error("Hunt not found.");
    const clue = hunt.clues[participation.currentClueIndex];
    if (!clue) throw new Error("No active clue.");

    const result = await verifyPhoto(imageDataUrl, clue);
    if (!result.verified) {
      return { verified: false, reasoning: result.reasoning, huntComplete: false };
    }

    const hintPenalty = participation.hintsUsed.includes(participation.currentClueIndex)
      ? HINT_PENALTY
      : 0;
    const cluePoints = Math.round(POINTS_PER_CLUE * DIFFICULTY_MULTIPLIER[hunt.difficulty]) - hintPenalty;
    const nextIndex = participation.currentClueIndex + 1;
    const isComplete = nextIndex >= hunt.clues.length;

    const startedAt = new Date(participation.startedAt).getTime();
    const elapsedSeconds = isComplete ? Math.round((Date.now() - startedAt) / 1000) : undefined;
    const speedBonus =
      isComplete && elapsedSeconds !== undefined
        ? Math.max(0, 300 - Math.floor(elapsedSeconds / 5))
        : 0;

    const participations = get().participations.map((p) => {
      if (p.id !== participationId) return p;
      return {
        ...p,
        currentClueIndex: nextIndex,
        score: p.score + cluePoints + speedBonus,
        status: isComplete ? ("completed" as const) : p.status,
        completedAt: isComplete ? new Date().toISOString() : p.completedAt,
        elapsedSeconds: isComplete ? elapsedSeconds : p.elapsedSeconds,
      };
    });
    storage.setParticipations(participations);
    set({ participations });

    return { verified: true, reasoning: result.reasoning, huntComplete: isComplete };
  },

  exportHunt: (huntId) => {
    const hunt = get().getHunt(huntId);
    if (!hunt) throw new Error("Hunt not found.");
    return JSON.stringify(hunt, null, 2);
  },

  importHunt: (json) => {
    const parsed = JSON.parse(json) as Hunt;
    const hunt: Hunt = {
      ...parsed,
      id: generateId(),
      code: generateHuntCode(),
      createdAt: new Date().toISOString(),
    };
    const hunts = [...get().hunts, hunt];
    storage.setHunts(hunts);
    set({ hunts });
    return hunt;
  },
}));
