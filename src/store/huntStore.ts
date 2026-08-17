import { create } from "zustand";
import { base44 } from "../lib/base44";
import { storage } from "../lib/storage";
import { generateId, generateHuntCode } from "../lib/id";
import { verifyPhoto } from "../lib/verify";
import type { Clue, Hunt, Participation } from "../types";

interface RawHunt {
  id: string;
  title: string;
  description: string;
  difficulty: Hunt["difficulty"];
  cover_image: string;
  status: string;
  total_clues: number;
  join_code?: string;
  created_by_id: string;
  created_by: string;
  created_date: string;
}

interface RawClue {
  id: string;
  hunt_id: string;
  location_name: string;
  location_map_query?: string | null;
  hint_text: string;
  location_description: string;
  reference_image_url: string | null;
  order: number;
}

interface RawProgress {
  id: string;
  player_id: string;
  hunt_id: string;
  status: "in_progress" | "completed";
  current_clue_order: number;
  completed_clues: number;
  scan_attempts: number;
  created_date: string;
  updated_date: string;
}

function mapClue(c: RawClue): Clue {
  return {
    id: c.id,
    order: c.order,
    locationName: c.location_name,
    locationQuery: c.location_map_query || c.location_name,
    hint: c.hint_text,
    verificationDescription: c.location_description,
    referencePhoto: c.reference_image_url,
  };
}

function mapHunt(h: RawHunt, clues: Clue[]): Hunt {
  return {
    id: h.id,
    joinCode: h.join_code,
    title: h.title,
    description: h.description,
    difficulty: h.difficulty,
    coverImage: h.cover_image,
    clues: clues.sort((a, b) => a.order - b.order),
    creatorId: h.created_by_id,
    creatorName: h.created_by,
    status: "published",
    createdAt: h.created_date,
  };
}

function mapParticipation(p: RawProgress): Participation {
  return {
    id: p.id,
    huntId: p.hunt_id,
    userId: p.player_id,
    status: p.status,
    currentClueOrder: p.current_clue_order,
    completedClues: p.completed_clues,
    scanAttempts: p.scan_attempts,
    createdAt: p.created_date,
    updatedAt: p.updated_date,
  };
}

async function fetchCluesForHunt(huntId: string): Promise<Clue[]> {
  const raw = (await base44.entities.Clue.filter({ hunt_id: huntId }, "order")) as RawClue[];
  return raw.map(mapClue);
}

interface HuntState {
  hunts: Hunt[];
  drafts: Hunt[];
  participations: Participation[];
  loadingHunts: boolean;
  huntsError: string | null;

  loadHunts: () => Promise<void>;
  loadDrafts: () => void;
  loadParticipations: (userId: string) => Promise<void>;

  getHunt: (id: string) => Hunt | undefined;
  loadHuntById: (id: string) => Promise<Hunt | undefined>;
  getHuntByCode: (code: string) => Promise<Hunt | undefined>;
  getParticipation: (huntId: string, userId: string) => Participation | undefined;

  createHunt: (
    data: {
      title: string;
      description: string;
      difficulty: Hunt["difficulty"];
      coverImage: string;
      clues: Clue[];
      creatorId: string;
      creatorName: string;
    },
    publish: boolean,
  ) => Promise<Hunt>;

  startHunt: (huntId: string, userId: string) => Promise<Participation>;

  hintsUsedFor: (participationId: string) => number[];
  revealHint: (participationId: string, clueOrder: number) => void;

  submitVerification: (
    participationId: string,
    imageDataUrl: string,
  ) => Promise<{ verified: boolean; reasoning: string; huntComplete: boolean }>;

  exportHunt: (huntId: string) => string;
  importHunt: (json: string, creatorId: string, creatorName: string) => Promise<Hunt>;
}

export const useHuntStore = create<HuntState>((set, get) => ({
  hunts: [],
  drafts: storage.getDrafts(),
  participations: [],
  loadingHunts: false,
  huntsError: null,

  loadHunts: async () => {
    set({ loadingHunts: true, huntsError: null });
    try {
      const rawHunts = (await base44.entities.Hunt.filter({ status: "active" })) as RawHunt[];
      const hunts = await Promise.all(
        rawHunts.map(async (h) => mapHunt(h, await fetchCluesForHunt(h.id))),
      );
      set({ hunts });
    } catch (err) {
      set({
        huntsError: err instanceof Error ? err.message : "Couldn't load hunts. Please try again.",
      });
    } finally {
      set({ loadingHunts: false });
    }
  },

  loadDrafts: () => set({ drafts: storage.getDrafts() }),

  loadParticipations: async (userId) => {
    const raw = (await base44.entities.PlayerProgress.filter({ player_id: userId })) as RawProgress[];
    set({ participations: raw.map(mapParticipation) });
  },

  getHunt: (id) => get().hunts.find((h) => h.id === id) ?? get().drafts.find((h) => h.id === id),

  loadHuntById: async (id) => {
    const draft = get().drafts.find((h) => h.id === id);
    if (draft) return draft;
    const cached = get().hunts.find((h) => h.id === id);
    if (cached) return cached;
    const h = (await base44.entities.Hunt.get(id)) as RawHunt;
    const hunt = mapHunt(h, await fetchCluesForHunt(id));
    set({ hunts: [...get().hunts.filter((x) => x.id !== id), hunt] });
    return hunt;
  },

  getHuntByCode: async (code) => {
    const matches = (await base44.entities.Hunt.filter({ join_code: code.trim().toUpperCase() })) as RawHunt[];
    const match = matches[0];
    if (!match) return undefined;
    return mapHunt(match, await fetchCluesForHunt(match.id));
  },

  getParticipation: (huntId, userId) =>
    get().participations.find((p) => p.huntId === huntId && p.userId === userId),

  createHunt: async (data, publish) => {
    if (!publish) {
      const hunt: Hunt = {
        id: generateId(),
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        coverImage: data.coverImage,
        clues: data.clues,
        creatorId: data.creatorId,
        creatorName: data.creatorName,
        status: "draft",
        createdAt: new Date().toISOString(),
      };
      const drafts = [...get().drafts, hunt];
      storage.setDrafts(drafts);
      set({ drafts });
      return hunt;
    }

    const joinCode = generateHuntCode();
    const rawHunt = (await base44.entities.Hunt.create({
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      cover_image: data.coverImage,
      status: "active",
      total_clues: data.clues.length,
      join_code: joinCode,
    })) as RawHunt;

    const rawClues = (await base44.entities.Clue.bulkCreate(
      data.clues.map((c, i) => ({
        hunt_id: rawHunt.id,
        location_name: c.locationName,
        location_map_query: c.locationQuery,
        hint_text: c.hint,
        location_description: c.verificationDescription,
        reference_image_url: c.referencePhoto ?? null,
        order: i + 1,
      })),
    )) as RawClue[];

    const hunt = mapHunt(rawHunt, rawClues.map(mapClue));
    set({ hunts: [...get().hunts, hunt] });
    return hunt;
  },

  startHunt: async (huntId, userId) => {
    const cached = get().getParticipation(huntId, userId);
    if (cached) return cached;

    // The local list can be empty because loadParticipations hasn't run yet or failed,
    // so confirm against the server before creating. Without this, a player whose
    // progress simply hadn't loaded would get a second PlayerProgress row for the same
    // hunt — resetting them to clue 1 and double-counting them on the leaderboard.
    const existing = (await base44.entities.PlayerProgress.filter({
      player_id: userId,
      hunt_id: huntId,
    })) as RawProgress[];

    // Players who already accumulated duplicate rows from this bug keep their furthest
    // progress rather than whichever row happens to come back first.
    const furthest = existing.reduce<RawProgress | undefined>((best, p) => {
      if (!best) return p;
      if (p.status === "completed" && best.status !== "completed") return p;
      if (best.status === "completed" && p.status !== "completed") return best;
      return p.current_clue_order > best.current_clue_order ? p : best;
    }, undefined);

    const raw =
      furthest ??
      ((await base44.entities.PlayerProgress.create({
        hunt_id: huntId,
        player_id: userId,
        status: "in_progress",
        current_clue_order: 1,
        completed_clues: 0,
        scan_attempts: 0,
      })) as RawProgress);

    const participation = mapParticipation(raw);
    set({
      participations: [
        ...get().participations.filter((p) => p.id !== participation.id),
        participation,
      ],
    });
    return participation;
  },

  hintsUsedFor: (participationId) => storage.getHintsUsed()[participationId] ?? [],

  revealHint: (participationId, clueOrder) => {
    const map = storage.getHintsUsed();
    const existing = map[participationId] ?? [];
    if (existing.includes(clueOrder)) return;
    map[participationId] = [...existing, clueOrder];
    storage.setHintsUsed(map);
  },

  submitVerification: async (participationId, imageDataUrl) => {
    const participation = get().participations.find((p) => p.id === participationId);
    if (!participation) throw new Error("Participation not found.");
    const hunt = get().getHunt(participation.huntId);
    if (!hunt) throw new Error("Hunt not found.");
    const clue = hunt.clues.find((c) => c.order === participation.currentClueOrder);
    if (!clue) throw new Error("No active clue.");

    const result = await verifyPhoto(imageDataUrl, clue);

    if (!result.verified) {
      const raw = (await base44.entities.PlayerProgress.update(participationId, {
        scan_attempts: participation.scanAttempts + 1,
      })) as RawProgress;
      set({
        participations: get().participations.map((p) =>
          p.id === participationId ? mapParticipation(raw) : p,
        ),
      });
      return { verified: false, reasoning: result.reasoning, huntComplete: false };
    }

    const nextOrder = participation.currentClueOrder + 1;
    const isComplete = nextOrder > hunt.clues.length;
    const raw = (await base44.entities.PlayerProgress.update(participationId, {
      current_clue_order: nextOrder,
      completed_clues: participation.completedClues + 1,
      scan_attempts: participation.scanAttempts + 1,
      status: isComplete ? "completed" : "in_progress",
    })) as RawProgress;
    set({
      participations: get().participations.map((p) =>
        p.id === participationId ? mapParticipation(raw) : p,
      ),
    });

    return { verified: true, reasoning: result.reasoning, huntComplete: isComplete };
  },

  exportHunt: (huntId) => {
    const hunt = get().getHunt(huntId);
    if (!hunt) throw new Error("Hunt not found.");
    return JSON.stringify(hunt, null, 2);
  },

  importHunt: async (json, creatorId, creatorName) => {
    let parsed: Partial<Hunt>;
    try {
      parsed = JSON.parse(json) as Partial<Hunt>;
    } catch {
      throw new Error("That file isn't valid JSON.");
    }
    if (!parsed?.title?.trim() || !Array.isArray(parsed.clues) || parsed.clues.length === 0) {
      throw new Error("That file doesn't look like an exported hunt (missing a title or clues).");
    }
    const difficulty = parsed.difficulty;
    return get().createHunt(
      {
        title: parsed.title,
        description: parsed.description ?? "",
        difficulty:
          difficulty === "easy" || difficulty === "medium" || difficulty === "hard"
            ? difficulty
            : "medium",
        coverImage: parsed.coverImage ?? "",
        clues: parsed.clues,
        creatorId,
        creatorName,
      },
      true,
    );
  },
}));
