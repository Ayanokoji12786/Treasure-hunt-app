import { Link } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";
import type { Hunt } from "../types";
import { DifficultyBadge } from "./DifficultyBadge";

export function HuntCard({ hunt }: { hunt: Hunt }) {
  return (
    <Link
      to={`/hunt/${hunt.id}`}
      className="glass group overflow-hidden rounded-2xl transition-transform hover:-translate-y-0.5"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={hunt.coverImage}
          alt={hunt.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
        <div className="absolute right-2 top-2">
          <DifficultyBadge difficulty={hunt.difficulty} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-100">{hunt.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-400">{hunt.description}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-gold-500" strokeWidth={2} />
            {hunt.clues.length} clues
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-explorer-400" strokeWidth={2} />
            Active
          </span>
        </div>
      </div>
    </Link>
  );
}
