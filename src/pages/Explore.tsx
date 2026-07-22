import { useMemo, useState } from "react";
import { useHuntStore } from "../store/huntStore";
import { HuntCard } from "../components/HuntCard";
import type { Difficulty } from "../types";

const FILTERS: Array<Difficulty | "all"> = ["all", "easy", "medium", "hard"];

export function Explore() {
  const hunts = useHuntStore((s) => s.hunts);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");

  const published = useMemo(() => hunts.filter((h) => h.status === "published"), [hunts]);

  const filtered = published.filter((h) => {
    const matchesQuery =
      h.title.toLowerCase().includes(query.toLowerCase()) ||
      h.description.toLowerCase().includes(query.toLowerCase());
    const matchesDifficulty = difficulty === "all" || h.difficulty === difficulty;
    return matchesQuery && matchesDifficulty;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          ✨ AI-Powered Treasure Hunts
        </span>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Explore. Scan. Discover.</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          Find real-world locations by scanning your surroundings. The adventure begins now.
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-md">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search hunts..."
          className="w-full rounded-lg border border-sand-200 bg-white px-4 py-2 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <div className="mt-3 flex justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setDifficulty(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                difficulty === f
                  ? "bg-brand-600 text-white"
                  : "bg-sand-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((hunt) => (
          <HuntCard key={hunt.id} hunt={hunt} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-sm text-neutral-500 dark:text-neutral-400">
            No hunts match your search.
          </p>
        )}
      </div>
    </div>
  );
}
