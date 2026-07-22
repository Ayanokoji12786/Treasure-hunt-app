export type Difficulty = "easy" | "medium" | "hard";

export interface Clue {
  id: string;
  locationName: string;
  lat: number;
  lng: number;
  hint: string;
  verificationDescription: string;
  referencePhoto?: string;
}

export interface Hunt {
  id: string;
  code: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export type ParticipationStatus = "in_progress" | "completed";

export interface Participation {
  id: string;
  huntId: string;
  userId: string;
  status: ParticipationStatus;
  currentClueIndex: number;
  hintsUsed: number[];
  startedAt: string;
  completedAt?: string;
  elapsedSeconds?: number;
  score: number;
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
