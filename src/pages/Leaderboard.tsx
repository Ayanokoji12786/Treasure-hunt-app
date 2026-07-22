import { useMemo } from "react";
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
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      {entries.length === 0 ? (
        <div className="mt-10 text-center text-neutral-500 dark:text-neutral-400">
          <p className="text-4xl">🏆</p>
          <p className="mt-3 font-medium">No completions yet</p>
          <p className="text-sm">Be the first to complete a hunt!</p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 rounded-xl border border-sand-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <span className="w-6 text-center font-bold text-neutral-400">{i + 1}</span>
              <div className="flex-1">
                <p className="font-medium">{entry.userName}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{entry.huntTitle}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{entry.score} pts</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
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
