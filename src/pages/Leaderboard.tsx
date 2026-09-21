import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { motion } from "motion/react";
import { base44 } from "../lib/base44";
import { useAuthStore } from "../store/authStore";
import { computeScore, elapsedSeconds } from "../lib/scoring";
import { CountUp } from "../components/CountUp";
import { LoadingScreen } from "../components/LoadingScreen";
import { usePageLoader } from "../hooks/usePageLoader";
import type { Hunt, Participation } from "../types";

interface RawHunt {
  id: string;
  title: string;
  difficulty: Hunt["difficulty"];
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

interface Entry {
  id: string;
  userId: string;
  huntTitle: string;
  userName: string;
  score: number;
  elapsedSeconds: number;
}

const PODIUM_HEIGHT = ["h-24", "h-32", "h-16"]; // rendered in visual order: 2nd, 1st, 3rd

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Leaderboard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"all-time" | "week" | "friends">("all-time");
  const { loaderVisible, hideLoader } = usePageLoader();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const completed = (await base44.entities.PlayerProgress.filter({
        status: "completed",
      })) as RawProgress[];

      const huntIds = [...new Set(completed.map((p) => p.hunt_id))];
      const hunts = await Promise.all(
        huntIds.map((id) => base44.entities.Hunt.get(id).catch(() => null)),
      );
      const huntById = new Map(hunts.filter(Boolean).map((h) => [(h as RawHunt).id, h as RawHunt]));

      const playerIds = [...new Set(completed.map((p) => p.player_id))];
      const users = await Promise.all(
        playerIds.map((id) =>
          base44.entities.User.get(id).catch(() => null),
        ),
      );
      const nameByPlayerId = new Map(
        users
          .filter(Boolean)
          .map((u) => [(u as { id: string }).id, (u as { full_name?: string; email: string }).full_name || (u as { email: string }).email]),
      );

      const built: Entry[] = completed.map((p) => {
        const hunt = huntById.get(p.hunt_id);
        const participation: Participation = {
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
        return {
          id: p.id,
          userId: p.player_id,
          huntTitle: hunt?.title ?? "Unknown hunt",
          userName: nameByPlayerId.get(p.player_id) ?? "Explorer",
          score: hunt ? computeScore({ difficulty: hunt.difficulty } as Hunt, participation, []) : 0,
          elapsedSeconds: elapsedSeconds(participation),
        };
      });

      built.sort((a, b) => b.score - a.score || a.elapsedSeconds - b.elapsedSeconds);
      if (!cancelled) setEntries(built);
    }

    load().catch((err) => {
      if (cancelled) return;
      setError(
        err instanceof Error ? err.message : "Couldn't load the leaderboard. Please try again.",
      );
      setEntries([]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loaderVisible) {
    return <LoadingScreen active={entries === null} context="leaderboard" onDone={hideLoader} />;
  }

  const podium = entries?.slice(0, 3) ?? [];
  const rest = entries?.slice(3) ?? [];
  const yourRank = currentUser ? (entries?.findIndex((e) => e.userId === currentUser.id) ?? -1) : -1;
  const [first, second, third] = podium;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-100">Leaderboard</h1>

      <div className="mt-4 flex gap-1">
        {(
          [
            ["all-time", "All Time"],
            ["week", "This Week"],
            ["friends", "Friends"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => key === "all-time" && setTab(key)}
            disabled={key !== "all-time"}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === key ? "bg-sky-400/20 text-sky-400" : "text-slate-500"
            } ${key !== "all-time" ? "cursor-default opacity-50" : "hover:text-slate-200"}`}
            title={key !== "all-time" ? "Coming soon" : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">{error}</p>
      )}

      {!error && entries?.length === 0 && (
        <div className="surface-1 mt-10 rounded-[var(--radius-luma-lg)] p-10 text-center text-slate-400">
          <Trophy className="mx-auto h-10 w-10 text-gold-500/60" strokeWidth={1.5} />
          <p className="mt-3 font-medium text-slate-200">No completions yet</p>
          <p className="text-sm">Be the first to complete a hunt!</p>
        </div>
      )}

      {entries && entries.length > 0 && (
        <>
          {/* Podium — only #1 gets treasure gold text; scarcity is the point */}
          <div className="mt-8 flex items-end justify-center gap-3">
            {[second, first, third].map((entry, i) => {
              if (!entry) return <div key={i} className="w-24" />;
              const place = i === 1 ? 1 : i === 0 ? 2 : 3;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: (2 - place) * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="flex w-24 flex-col items-center"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${
                      place === 1 ? "bg-[var(--luma-tertiary)] text-navy-950" : "surface-2 text-slate-200"
                    }`}
                  >
                    {initials(entry.userName)}
                  </div>
                  <p className={`mt-2 max-w-full truncate text-xs font-medium ${place === 1 ? "text-[var(--luma-tertiary)]" : "text-slate-200"}`}>
                    {entry.userName}
                  </p>
                  <p className="font-coord text-[11px] text-slate-500">
                    <CountUp value={entry.score} /> XP
                  </p>
                  <div className={`surface-2 mt-2 flex w-full items-start justify-center rounded-t-[var(--radius-luma-sm)] pt-1.5 ${PODIUM_HEIGHT[i]}`}>
                    <span className="font-coord text-lg text-slate-400">#{place}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {rest.length > 0 && (
            <div className="mt-8 space-y-2">
              {rest.map((entry, i) => (
                <div key={entry.id} className="surface-1 flex items-center gap-4 rounded-[var(--radius-luma-md)] p-4">
                  <span className="font-coord w-6 text-center text-slate-500">{i + 4}</span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-100">{entry.userName}</p>
                    <p className="text-xs text-slate-400">{entry.huntTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-coord font-semibold text-explorer-400">{entry.score} pts</p>
                    <p className="text-xs text-slate-400">
                      {Math.floor(entry.elapsedSeconds / 60)}m {entry.elapsedSeconds % 60}s
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {yourRank >= 0 && (
            <div className="surface-1 mt-8 rounded-[var(--radius-luma-md)] p-4 text-center">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Your position</p>
              <p className="font-coord mt-1 text-2xl text-[var(--luma-tertiary)]">#{yourRank + 1}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
