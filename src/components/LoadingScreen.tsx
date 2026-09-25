import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Compass } from "lucide-react";

export type LoadingContext = "default" | "explore" | "hunt" | "clue" | "verify" | "leaderboard";

const FINAL_STAGE: Record<LoadingContext, string> = {
  default: "Locating your next clue…",
  explore: "Mapping nearby hunts…",
  hunt: "Preparing your expedition…",
  clue: "Calibrating your compass…",
  verify: "Analyzing the landmark…",
  leaderboard: "Gathering explorer rankings…",
};

const STAGES: Record<LoadingContext, [string, string, string]> = Object.fromEntries(
  Object.entries(FINAL_STAGE).map(([ctx, final]) => [
    ctx,
    ["Scanning the city…", "Tracing hidden routes…", final],
  ]),
) as Record<LoadingContext, [string, string, string]>;

// Route drawn as a simple polyline; pathLength="100" lets stroke-dash* be read directly
// as a percentage instead of computing real SVG geometry.
const WAYPOINTS = [
  { x: 34, y: 118 },
  { x: 108, y: 78 },
  { x: 186, y: 100 },
  { x: 266, y: 42 },
];
const ROUTE_D = `M${WAYPOINTS.map((p) => `${p.x},${p.y}`).join(" L")}`;
const FINAL = WAYPOINTS[WAYPOINTS.length - 1];

interface LoadingScreenProps {
  /** Whether the real work this screen is covering is still in flight. */
  active: boolean;
  context?: LoadingContext;
  /** Called once the finish + zoom-out sequence completes — unmount the screen here. */
  onDone: () => void;
}

export function LoadingScreen({ active, context = "default", onDone }: LoadingScreenProps) {
  const [progress, setProgress] = useState(6);
  const [phase, setPhase] = useState<"loading" | "holding" | "exiting">("loading");
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (phase !== "loading") return;
    const tick = window.setInterval(() => {
      setProgress((p) => {
        const ceiling = activeRef.current ? 88 : 100;
        const rate = activeRef.current ? 0.05 : 0.22;
        const next = p + (ceiling - p) * rate;
        return next > 99.4 ? 100 : next;
      });
    }, 50);
    return () => window.clearInterval(tick);
  }, [phase]);

  // Split from the progress watcher below on purpose: that effect's own setPhase call
  // re-runs it (phase is a dep), and a timeout scheduled inside it would be cancelled
  // by its own cleanup on that very re-render before ever firing.
  useEffect(() => {
    if (phase !== "holding") return;
    const hold = window.setTimeout(() => setPhase("exiting"), 650);
    return () => window.clearTimeout(hold);
  }, [phase]);

  useEffect(() => {
    if (phase === "loading" && progress >= 100) setPhase("holding");
  }, [phase, progress]);

  const stages = STAGES[context];
  const stageIndex = progress < 35 ? 0 : progress < 72 ? 1 : 2;
  const needleAngle = phase === "loading" ? undefined : 0;

  return (
    <motion.div
      className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-[var(--luma-canvas)]"
      initial={{ opacity: 1 }}
      animate={phase === "exiting" ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5, delay: phase === "exiting" ? 0.35 : 0, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => {
        if (phase === "exiting") onDone();
      }}
      aria-live="polite"
      aria-busy={phase !== "exiting"}
    >
      {/* Faint 3D topographic floor grid. The tilt lives on a plain wrapper, and only
          the drift is animated on the child: Motion writes an inline `transform` for
          `y`, which silently overrides any transform class on the same element — the
          tilt used to be on the animated element and never applied. */}
      <div className="absolute inset-0 [perspective:500px]" aria-hidden>
        <div className="absolute inset-x-[-60%] top-1/2 h-[220%] [transform:rotateX(62deg)]">
          <motion.div
            className="absolute inset-x-0 -top-[44px] bottom-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "linear-gradient(var(--luma-border) 1px, transparent 1px), linear-gradient(90deg, var(--luma-border) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
            animate={{ y: [0, 44] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(560px circle at 50% 42%, rgba(201,154,69,0.08), transparent 60%)",
        }}
        aria-hidden
      />

      {/* Zoom target: scales/centers on the final waypoint as the scene exits */}
      <motion.div
        className="relative flex flex-col items-center"
        animate={
          phase === "exiting"
            ? { scale: 38, opacity: 0 }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        style={{
          transformOrigin: `${(FINAL.x / 300) * 100}% ${(FINAL.y / 160) * 100}%`,
        }}
      >
        <svg viewBox="0 0 300 160" className="h-32 w-64 sm:h-36 sm:w-72" aria-hidden>
          <path
            d={ROUTE_D}
            fill="none"
            stroke="var(--luma-border)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={ROUTE_D}
            fill="none"
            stroke="var(--luma-tertiary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 - Math.min(progress, 100)}
            style={{ filter: "drop-shadow(0 0 3px rgba(201,154,69,0.6))" }}
          />
          {WAYPOINTS.map((p, i) => {
            const threshold = (i / (WAYPOINTS.length - 1)) * 100;
            const revealed = progress >= threshold - 6;
            const isFinal = i === WAYPOINTS.length - 1;
            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isFinal ? 5 : 3.5}
                  fill={revealed ? "var(--luma-tertiary)" : "var(--luma-border)"}
                  opacity={revealed ? 1 : 0.5}
                  style={{
                    transition: "fill 300ms var(--ease-luma-narrative), opacity 300ms var(--ease-luma-narrative)",
                  }}
                  className={isFinal && progress >= 100 ? "animate-waypoint-pulse" : undefined}
                />
                {isFinal && progress >= 100 && (
                  <circle cx={p.x} cy={p.y} r={5} fill="none" stroke="var(--luma-tertiary-soft)" strokeWidth={1.5}>
                    <animate attributeName="r" values="5;16" dur="0.9s" begin="0s" fill="freeze" />
                    <animate attributeName="opacity" values="0.9;0" dur="0.9s" begin="0s" fill="freeze" />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Compass */}
        <div className="relative -mt-3 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[var(--luma-raised)]/80">
          <motion.div
            className="flex h-full w-full items-center justify-center"
            animate={
              needleAngle === undefined
                ? { rotate: [-6, 6, -3, 5, -6] }
                : { rotate: 0 }
            }
            transition={
              needleAngle === undefined
                ? { duration: 5, repeat: Infinity, ease: "easeInOut" }
                : { type: "spring", bounce: 0, duration: 0.6 }
            }
          >
            <Compass className="h-7 w-7 text-[var(--luma-tertiary)]" strokeWidth={1.5} />
          </motion.div>
        </div>
        <p className="mt-2 font-coord text-[10px] uppercase tracking-[0.25em] text-slate-500">Compass</p>

        <p className="mt-5 h-5 text-sm text-slate-300">
          <motion.span
            key={stageIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {stages[stageIndex]}
          </motion.span>
        </p>

        <p className="mt-3 font-coord text-lg text-[var(--luma-tertiary)]">{Math.round(Math.min(progress, 100))}%</p>
      </motion.div>
    </motion.div>
  );
}
