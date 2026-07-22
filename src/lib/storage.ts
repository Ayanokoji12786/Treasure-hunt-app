import type { Hunt, Participation, User } from "../types";

const KEYS = {
  users: "tq_users",
  hunts: "tq_hunts",
  participations: "tq_participations",
  session: "tq_session",
  theme: "tq_theme",
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
  getUsers: () => read<User[]>(KEYS.users, []),
  setUsers: (users: User[]) => write(KEYS.users, users),

  getHunts: () => read<Hunt[]>(KEYS.hunts, []),
  setHunts: (hunts: Hunt[]) => write(KEYS.hunts, hunts),

  getParticipations: () => read<Participation[]>(KEYS.participations, []),
  setParticipations: (p: Participation[]) => write(KEYS.participations, p),

  getSessionUserId: () => read<string | null>(KEYS.session, null),
  setSessionUserId: (id: string | null) => write(KEYS.session, id),

  getTheme: () => read<"light" | "dark">(KEYS.theme, "light"),
  setTheme: (theme: "light" | "dark") => write(KEYS.theme, theme),
};
