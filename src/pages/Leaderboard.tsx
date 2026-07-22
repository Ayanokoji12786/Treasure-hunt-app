import { useMemo } from "react";
import { Trophy } from "lucide-react";
import { useHuntStore } from "../store/huntStore";

export function Leaderboard() {
  const hunts = useHuntStore((s) => s.hunts);
  const participations = useHuntStore((s) => s.participations);

  const entries = useMemo(() => {
    const allUsers = JSON.parse(localStorage.getItem("tq_users") ?? "[]") as Array<{
      id: string;
      name: string;
    }>;
    return participations
      .filter((p) => p.status === "completed")
      .map((p) => {
        const hunt = hunts.find((h) => h.id === p.huntId);
        const user = allUsers.find((u) => u.id === p.userId);
        return {
          id: p.id,
          huntTitle: hunt?.title ?? "Unknown hunt",
          userName: user?.name ?? "Anonymous",
          score: p.score,
          elapsedSeconds: p.elapsedSeconds ?? 0,
        };
      })
      .sort((a, b) => b.score - a.score || a.elapsedSeconds - b.elapsedSeconds);
  }, [hunts, participations]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-100">Leaderboard</h1>
      {entries.length === 0 ? (
        <div className="glass mt-10 rounded-2xl p-10 text-center text-slate-400">
          <Trophy className="mx-auto h-10 w-10 text-gold-500/60" strokeWidth={1.5} />
          <p className="mt-3 font-medium text-slate-200">No completions yet</p>
          <p className="text-sm">Be the first to complete a hunt!</p>
        </div>
      ) : (
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
