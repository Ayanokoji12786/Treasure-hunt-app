import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useHuntStore } from "../store/huntStore";
import { HuntCard } from "../components/HuntCard";
import type { Difficulty } from "../types";

const FILTERS: Array<Difficulty | "all"> = ["all", "easy", "medium", "hard"];

export function Explore() {
  const hunts = useHuntStore((s) => s.hunts);
  const loadingHunts = useHuntStore((s) => s.loadingHunts);
  const huntsError = useHuntStore((s) => s.huntsError);
  const loadHunts = useHuntStore((s) => s.loadHunts);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");

  useEffect(() => {
    loadHunts();
  }, [loadHunts]);

  const filtered = hunts.filter((h) => {
    const matchesQuery =
      h.title.toLowerCase().includes(query.toLowerCase()) ||
      h.description.toLowerCase().includes(query.toLowerCase());
    const matchesDifficulty = difficulty === "all" || h.difficulty === difficulty;
    return matchesQuery && matchesDifficulty;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-1 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-400">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          AI-Powered Treasure Hunts
        </span>
        <h1 className="mt-4 text-3xl font-bold text-slate-100 sm:text-4xl">Explore. Scan. Discover.</h1>
        <p className="mt-2 text-slate-400">
          Find real-world locations by scanning your surroundings. The adventure begins now.
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-md">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search hunts..."
          className="input-glass"
        />
        <div className="mt-3 flex justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setDifficulty(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                difficulty === f ? "bg-sky-500/20 text-sky-400" : "glass text-slate-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loadingHunts && (
          <p className="col-span-full text-center text-sm text-slate-400">Loading hunts…</p>
        )}
        {!loadingHunts && huntsError && (
          <div className="col-span-full rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center">
            <p className="text-sm text-rose-400">{huntsError}</p>
            <button onClick={() => loadHunts()} className="mt-2 text-sm font-medium text-sky-400">
              Retry
            </button>
          </div>
        )}
        {!loadingHunts && !huntsError && filtered.map((hunt) => <HuntCard key={hunt.id} hunt={hunt} />)}
        {!loadingHunts && !huntsError && filtered.length === 0 && (
          <p className="col-span-full text-center text-sm text-slate-400">No hunts match your search.</p>
        )}
      </div>
    </div>
  );
}
