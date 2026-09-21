import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Compass, Users } from "lucide-react";
import type { Hunt } from "../types";
import { DifficultyBadge } from "./DifficultyBadge";
import { estimateDuration } from "../lib/estimate";

export function HuntCard({
  hunt,
  distanceKm,
  explorerCount,
}: {
  hunt: Hunt;
  /** Straight-line distance from the viewer, if already known — omitted otherwise. */
  distanceKm?: number;
  explorerCount?: number;
}) {
  const location = hunt.clues[0]?.locationName;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      className="group"
    >
      <Link
        to={`/hunt/${hunt.id}`}
        className="surface-1 block overflow-hidden rounded-[var(--radius-luma-md)] shadow-[0_0_0_rgba(0,0,0,0)] transition-shadow duration-300 hover:shadow-[0_16px_32px_-16px_rgba(7,9,12,0.6)]"
      >
        <div className="relative h-44 overflow-hidden sm:h-48">
          <img
            src={hunt.coverImage}
            alt={hunt.title}
            className="h-full w-full origin-center object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--luma-canvas)] via-[var(--luma-canvas)]/10 to-transparent" />
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <DifficultyBadge difficulty={hunt.difficulty} />
            {distanceKm !== undefined && (
              <span className="font-coord rounded-full border border-white/10 bg-[var(--luma-raised)]/85 px-2.5 py-1 text-[10px] text-slate-200 backdrop-blur-sm">
                {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`}
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="truncate text-[15px] font-semibold uppercase tracking-wide text-slate-100">
            {hunt.title}
          </h3>
          {location && <p className="mt-0.5 truncate text-xs text-slate-400">{location}</p>}

          <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Compass className="h-3.5 w-3.5 text-[var(--luma-tertiary)]" strokeWidth={2} />
              {hunt.clues.length} clues
            </span>
            <span className="font-coord">{estimateDuration(hunt)}</span>
          </div>

          {explorerCount !== undefined && explorerCount > 0 && (
            <div className="divider mt-3" />
          )}
          {explorerCount !== undefined && explorerCount > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <Users className="h-3.5 w-3.5" strokeWidth={2} />
              {explorerCount.toLocaleString()} explorer{explorerCount === 1 ? "" : "s"}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
