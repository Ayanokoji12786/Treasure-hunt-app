export type Difficulty = "easy" | "medium" | "hard";

export interface Clue {
  id: string;
  order: number;
  locationName: string;
  locationQuery: string;
  hint: string;
  verificationDescription: string;
  referencePhoto?: string | null;
}

export interface Hunt {
  id: string;
  joinCode?: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  coverImage: string;
  clues: Clue[];
  creatorId: string;
  creatorName: string;
  status: "draft" | "published";
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

export type ParticipationStatus = "in_progress" | "completed";

export interface Participation {
  id: string;
  huntId: string;
  userId: string;
  status: ParticipationStatus;
  currentClueOrder: number;
  completedClues: number;
  scanAttempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  participationId: string;
  huntId: string;
  huntTitle: string;
  userId: string;
  userName: string;
  score: number;
  elapsedSeconds: number;
  completedAt: string;
}
