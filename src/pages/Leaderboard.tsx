import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { base44 } from "../lib/base44";
import { computeScore, elapsedSeconds } from "../lib/scoring";
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
  huntTitle: string;
  userName: string;
  score: number;
  elapsedSeconds: number;
}

export function Leaderboard() {
  const [entries, setEntries] = useState<Entry[] | null>(null);

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
          huntTitle: hunt?.title ?? "Unknown hunt",
          userName: nameByPlayerId.get(p.player_id) ?? "Explorer",
          score: hunt ? computeScore({ difficulty: hunt.difficulty } as Hunt, participation, []) : 0,
          elapsedSeconds: elapsedSeconds(participation),
        };
      });

      built.sort((a, b) => b.score - a.score || a.elapsedSeconds - b.elapsedSeconds);
      if (!cancelled) setEntries(built);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-100">Leaderboard</h1>
      {entries === null && <p className="mt-10 text-center text-sm text-slate-400">Loading…</p>}
      {entries?.length === 0 && (
        <div className="glass mt-10 rounded-2xl p-10 text-center text-slate-400">
          <Trophy className="mx-auto h-10 w-10 text-gold-500/60" strokeWidth={1.5} />
          <p className="mt-3 font-medium text-slate-200">No completions yet</p>
          <p className="text-sm">Be the first to complete a hunt!</p>
        </div>
      )}
      {entries && entries.length > 0 && (
        <div className="mt-6 space-y-2">
          {entries.map((entry, i) => (
            <div key={entry.id} className="glass flex items-center gap-4 rounded-xl p-4">
              <span className="w-6 text-center font-bold text-gold-500">{i + 1}</span>
              <div className="flex-1">
                <p className="font-medium text-slate-100">{entry.userName}</p>
                <p className="text-xs text-slate-400">{entry.huntTitle}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-explorer-400">{entry.score} pts</p>
                <p className="text-xs text-slate-400">
                  {Math.floor(entry.elapsedSeconds / 60)}m {entry.elapsedSeconds % 60}s
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
