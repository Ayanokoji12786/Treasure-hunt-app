import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Compass, MapPin, Ticket } from "lucide-react";
import { useHuntStore } from "../store/huntStore";
import { HuntCard } from "../components/HuntCard";
import { CountUp } from "../components/CountUp";

// Landing's route/waypoint scene — the same visual language as LoadingScreen, at
// hero scale. viewBox is 800x500; percentages below convert a point to CSS position.
const WAYPOINTS = [
  { x: 110, y: 380 },
  { x: 270, y: 300 },
  { x: 430, y: 340 },
  { x: 570, y: 210 },
  { x: 690, y: 140 },
];
const ROUTE_D = `M${WAYPOINTS.map((p) => `${p.x},${p.y}`).join(" L")}`;
const FINAL = WAYPOINTS[WAYPOINTS.length - 1];
const pct = (v: number, max: number) => `${(v / max) * 100}%`;

// Scroll-sequence breakpoints. Progress (0-1) drives every value below via plain
// interpolation — see the note above `mapRange` for why this isn't done through
// Motion's useTransform-into-style, which is the idiomatic approach but proved
// unreliable here: `y`-as-transform tracked scroll correctly in testing, but
// `opacity` fed the same way stuck at its initial value and never updated, on both
// 2- and multi-point ranges, reproducibly, independent of array identity. Driving a
// single React state number and computing plain CSS values every render sidesteps
// whatever that internal quirk is, at the cost of one extra re-render per scroll tick
// — a non-issue for a handful of elements.
const HERO_OPACITY_RANGE = [0, 0.1, 0.17];
const HERO_OPACITY_OUTPUT = [1, 1, 0];
const HERO_Y_RANGE = [0, 0.17];
const HERO_Y_OUTPUT = [0, -36];
const CORNER_CTA_RANGE = [0.12, 0.2];
const OPACITY_0_1 = [0, 1];

const MAP_ROTATE_RANGE = [0.08, 0.32];
const MAP_ROTATE_OUTPUT = [0, 48];
const MAP_OPACITY_RANGE = [0.62, 0.72];
const OPACITY_1_0 = [1, 0];
const ROUTE_DASH_RANGE = [0.1, 0.38];
const ROUTE_DASH_OUTPUT = [100, 0];

const WP_RANGES = [
  [0.14, 0.19],
  [0.2, 0.25],
  [0.26, 0.31],
  [0.32, 0.37],
  [0.38, 0.44],
];

const CLUE_LABEL_RANGE = [0.42, 0.48, 0.58, 0.64];
const CLUE_LABEL_OUTPUT = [0, 1, 1, 0];
const SCENE_SCALE_RANGE = [0.44, 0.68];
const SCENE_SCALE_OUTPUT = [1, 2.8];

const CARD_OPACITY_RANGE = [0.68, 0.78];
const CARD_SCALE_RANGE = [0.68, 0.86];
const CARD_SCALE_OUTPUT = [0.85, 1];

/** Piecewise-linear interpolation, clamped at the ends — the same semantics as
 * Motion's useTransform(value, range, output), just evaluated eagerly. */
function mapRange(value: number, range: number[], output: number[]): number {
  if (value <= range[0]) return output[0];
  const last = range.length - 1;
  if (value >= range[last]) return output[last];
  for (let i = 0; i < last; i++) {
    if (value >= range[i] && value <= range[i + 1]) {
      const t = (value - range[i]) / (range[i + 1] - range[i]);
      return output[i] + t * (output[i + 1] - output[i]);
    }
  }
  return output[last];
}

export function Landing() {
  const hunts = useHuntStore((s) => s.hunts);
  const loadHunts = useHuntStore((s) => s.loadHunts);
  const loadExplorerCounts = useHuntStore((s) => s.loadExplorerCounts);
  const explorerCounts = useHuntStore((s) => s.explorerCounts);
  const globalStats = useHuntStore((s) => s.globalStats);
  const featuredHunt = hunts[0];
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    loadHunts();
    loadExplorerCounts().catch(() => {});
  }, [loadHunts, loadExplorerCounts]);

  const sequenceRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sequenceRef, offset: ["start start", "end end"] });
  const [progress, setProgress] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setProgress(v));

  const heroOpacity = mapRange(progress, HERO_OPACITY_RANGE, HERO_OPACITY_OUTPUT);
  const heroY = mapRange(progress, HERO_Y_RANGE, HERO_Y_OUTPUT);
  const cornerCtaOpacity = mapRange(progress, CORNER_CTA_RANGE, OPACITY_0_1);

  const mapRotateXVal = mapRange(progress, MAP_ROTATE_RANGE, MAP_ROTATE_OUTPUT);
  const mapOpacityVal = mapRange(progress, MAP_OPACITY_RANGE, OPACITY_1_0);
  const routeDashoffsetVal = mapRange(progress, ROUTE_DASH_RANGE, ROUTE_DASH_OUTPUT);
  const waypointOpacity = WP_RANGES.map((range) => mapRange(progress, range, OPACITY_0_1));

  const clueLabelOpacityVal = mapRange(progress, CLUE_LABEL_RANGE, CLUE_LABEL_OUTPUT);
  const sceneScaleVal = mapRange(progress, SCENE_SCALE_RANGE, SCENE_SCALE_OUTPUT);

  const cardOpacityVal = mapRange(progress, CARD_OPACITY_RANGE, OPACITY_0_1);
  const cardScaleVal = mapRange(progress, CARD_SCALE_RANGE, CARD_SCALE_OUTPUT);

  const showStats = globalStats.placesFound > 0 || globalStats.explorers > 0;

  return (
    <div className="relative">
      <div ref={sequenceRef} className="relative h-[240vh] sm:h-[340vh]">
        <div className="sticky top-0 h-svh overflow-hidden bg-[var(--luma-canvas)]">
          {/* Backdrop atmosphere: heavy navy darkening, no decorative star/glow stack */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(1100px circle at 50% 15%, rgba(201,154,69,0.08), transparent 55%), linear-gradient(180deg, #07090C 0%, #0B0E13 55%, #0D1117 100%)",
            }}
            aria-hidden
          />

          <div
            className="pointer-events-none absolute right-4 top-4 z-20 sm:right-8 sm:top-6"
            style={{ opacity: prefersReducedMotion ? 1 : cornerCtaOpacity }}
          >
            <Link to="/explore" className="btn-ghost-link pointer-events-auto">
              Explore <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Section 1 — hero statement */}
          <div
            style={prefersReducedMotion ? undefined : { opacity: heroOpacity, transform: `translateY(${heroY}px)` }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--luma-tertiary)] text-navy-950">
              <Compass className="h-7 w-7" strokeWidth={2} />
            </span>
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.4em] text-slate-400">Luma</p>
            <h1 className="mt-3 text-4xl font-semibold uppercase leading-[1.05] tracking-tight text-slate-100 sm:text-6xl">
              The city is
              <br />
              <span className="font-display-serif normal-case tracking-normal text-[var(--luma-tertiary)]">
                hiding something.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-balance text-sm text-slate-400 sm:text-base">
              Follow clues. Find real places. Prove what you discovered.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <Link to="/explore" className="btn-primary">
                Start exploring
              </Link>
              <Link to="/join" className="btn-glass">
                <Ticket className="h-4 w-4" strokeWidth={2} />
                Enter hunt code
              </Link>
            </div>
            <Link to="/create-hunt" className="btn-ghost-link mt-5 text-xs">
              Create your own hunt <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Section 2–4 — map tilts, route draws, waypoints rise, camera pushes in */}
          <div
            style={prefersReducedMotion ? { opacity: 0 } : { opacity: mapOpacityVal, perspective: 900 }}
            className="absolute inset-0 z-0 flex items-center justify-center"
            aria-hidden
          >
            <svg
              viewBox="0 0 800 500"
              className="h-[70vh] w-[92vw] max-w-3xl"
              style={{
                transform: `rotateX(${mapRotateXVal}deg) scale(${sceneScaleVal})`,
                transformOrigin: `${pct(FINAL.x, 800)} ${pct(FINAL.y, 500)}`,
              }}
            >
              <path
                d={ROUTE_D}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={ROUTE_D}
                fill="none"
                stroke="var(--luma-tertiary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={100}
                strokeDasharray={100}
                style={{ strokeDashoffset: routeDashoffsetVal, filter: "drop-shadow(0 0 4px rgba(201,154,69,0.5))" }}
              />
              {WAYPOINTS.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={i === WAYPOINTS.length - 1 ? 8 : 5}
                  fill="var(--luma-tertiary)"
                  style={{ opacity: waypointOpacity[i] }}
                />
              ))}
            </svg>

            <div
              className="absolute font-coord text-xs uppercase tracking-[0.3em] text-[var(--luma-tertiary-soft)]"
              style={{
                opacity: clueLabelOpacityVal,
                left: pct(FINAL.x, 800),
                top: pct(FINAL.y, 500),
                transform: "translate(-50%, -220%)",
              }}
            >
              Clue 01
            </div>
          </div>

          {/* Section 5 — waypoint expands into a real hunt card */}
          {featuredHunt && (
            <div
              style={prefersReducedMotion ? { opacity: 1 } : { opacity: cardOpacityVal, transform: `scale(${cardScaleVal})` }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6"
            >
              <div className="w-72 sm:w-80">
                <HuntCard hunt={featuredHunt} explorerCount={explorerCounts[featuredHunt.id]} />
              </div>
              <Link to="/explore" className="btn-primary">
                Begin the hunt
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats bar — real counts, not decorative filler */}
      <section className="border-t border-white/8 bg-[var(--luma-surface)] py-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 text-center">
          <div>
            <p className="font-coord text-xl font-semibold text-slate-100">
              <CountUp value={hunts.length} />
            </p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Active hunts</p>
          </div>
          {showStats && (
            <>
              <div className="divider hidden h-8 w-px sm:block" />
              <div>
                <p className="font-coord text-xl font-semibold text-slate-100">
                  <CountUp value={globalStats.placesFound} />
                </p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Places found</p>
              </div>
              <div className="divider hidden h-8 w-px sm:block" />
              <div>
                <p className="font-coord text-xl font-semibold text-slate-100">
                  <CountUp value={globalStats.explorers} />
                </p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Explorers</p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Non-scroll-jacked fallback content so hunts are reachable even before the
          pinned sequence resolves, and for prefers-reduced-motion visitors. */}
      {featuredHunt && prefersReducedMotion && (
        <section className="mx-auto max-w-sm px-4 pb-16 pt-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
            Featured hunt
          </p>
          <HuntCard hunt={featuredHunt} explorerCount={explorerCounts[featuredHunt.id]} />
        </section>
      )}
    </div>
  );
}
