import { Link } from "react-router-dom";
import type { Hunt } from "../types";
import { DifficultyBadge } from "./DifficultyBadge";

export function HuntCard({ hunt }: { hunt: Hunt }) {
  return (
    <Link
      to={`/hunt/${hunt.id}`}
      className="group overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={hunt.coverImage}
          alt={hunt.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute right-2 top-2">
          <DifficultyBadge difficulty={hunt.difficulty} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{hunt.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
          {hunt.description}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <span>📍 {hunt.clues.length} clues</span>
          <span>⏱️ Active</span>
        </div>
      </div>
    </Link>
  );
}
