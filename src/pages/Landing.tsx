import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Compass, MapPin, Ticket } from "lucide-react";
import { useHuntStore } from "../store/huntStore";
import { HuntCard } from "../components/HuntCard";
import { CountUp } from "../components/CountUp";
import type { NeedleTarget } from "../components/CompassScene";
import { mapRange } from "../lib/mapRange";

// three.js + fiber + drei roughly double the JS payload, and only this page uses
// them — split them out so logged-in users landing on /explore never download them.
const CompassScene = lazy(() => import("../components/CompassScene").then((m) => ({ default: m.CompassScene })));
const TerrainScene = lazy(() => import("../components/TerrainScene").then((m) => ({ default: m.TerrainScene })));

// Scroll-sequence breakpoints. Progress (0-1) drives every value below via plain
// interpolation — see the note above `mapRange` for why this isn't done through
// Motion's useTransform-into-style, which is the idiomatic approach but proved
// unreliable here: `y`-as-transform tracked scroll correctly in testing, but
// `opacity` fed the same way stuck at its initial value and never updated, on both
// 2- and multi-point ranges, reproducibly, independent of array identity. Driving a
// single React state number and computing plain CSS values every render sidesteps
// whatever that internal quirk is, at the cost of one extra re-render per scroll tick
// — a non-issue for a handful of elements. The 3D terrain scene reads scroll
// progress from a ref instead (updated alongside the state, see below), since its
// camera rig runs inside useFrame, not React's render cycle.
const HERO_OPACITY_RANGE = [0, 0.1, 0.17];
const HERO_OPACITY_OUTPUT = [1, 1, 0];
const HERO_Y_RANGE = [0, 0.17];
const HERO_Y_OUTPUT = [0, -36];
const CORNER_CTA_RANGE = [0.12, 0.2];
const OPACITY_0_1 = [0, 1];

const MAP_OPACITY_RANGE = [0.62, 0.72];
const OPACITY_1_0 = [1, 0];

const CLUE_LABEL_RANGE = [0.42, 0.48, 0.58, 0.64];
const CLUE_LABEL_OUTPUT = [0, 1, 1, 0];

const CARD_OPACITY_RANGE = [0.68, 0.78];
const CARD_SCALE_RANGE = [0.68, 0.86];
const CARD_SCALE_OUTPUT = [0.85, 1];

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
  const progressRef = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
    setProgress(v);
  });

  const [needleTarget, setNeedleTarget] = useState<NeedleTarget>("idle");

  const heroOpacity = mapRange(progress, HERO_OPACITY_RANGE, HERO_OPACITY_OUTPUT);
  const heroY = mapRange(progress, HERO_Y_RANGE, HERO_Y_OUTPUT);
  const cornerCtaOpacity = mapRange(progress, CORNER_CTA_RANGE, OPACITY_0_1);

  const mapOpacityVal = mapRange(progress, MAP_OPACITY_RANGE, OPACITY_1_0);
  const clueLabelOpacityVal = mapRange(progress, CLUE_LABEL_RANGE, CLUE_LABEL_OUTPUT);

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
            {/* Soft scrim behind the hero copy only: the skyline behind the text is busy
                enough to swallow the subhead. It lives inside the hero, so it fades out
                with the text and leaves the city fully visible once you scroll. */}
            {!prefersReducedMotion && (
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(ellipse 58% 52% at 50% 54%, rgba(7,9,12,0.84) 0%, rgba(7,9,12,0.6) 45%, transparent 76%)",
                }}
                aria-hidden
              />
            )}
            {prefersReducedMotion ? (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--luma-tertiary)] text-navy-950">
                <Compass className="h-7 w-7" strokeWidth={2} />
              </span>
            ) : (
              <div className="pointer-events-none flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
                {/* Unmounted once scrolled past — no need to keep a second WebGL
                    canvas alive underneath the terrain scene once it's faded out. */}
                {progress < 0.25 && (
                  <Suspense
                    fallback={
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--luma-tertiary)] text-navy-950">
                        <Compass className="h-7 w-7" strokeWidth={2} />
                      </span>
                    }
                  >
                    <div className="h-full w-full">
                      <CompassScene needleTarget={needleTarget} />
                    </div>
                  </Suspense>
                )}
              </div>
            )}
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.4em] text-slate-400">Luma</p>
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
              <Link
                to="/explore"
                className="btn-primary"
                onMouseEnter={() => setNeedleTarget("left")}
                onMouseLeave={() => setNeedleTarget("idle")}
              >
                Start exploring
              </Link>
              <Link
                to="/join"
                className="btn-glass"
                onMouseEnter={() => setNeedleTarget("right")}
                onMouseLeave={() => setNeedleTarget("idle")}
              >
                <Ticket className="h-4 w-4" strokeWidth={2} />
                Enter hunt code
              </Link>
            </div>
            <Link to="/create-hunt" className="btn-ghost-link mt-5 text-xs">
              Create your own hunt <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Section 2–4 — a real 3D terrain: buildings rise off the map, the gold
              route draws itself, waypoints surface, the camera descends toward one */}
          {!prefersReducedMotion && (
            <div
              style={{ opacity: mapOpacityVal }}
              className="absolute inset-0 z-0"
              aria-hidden
            >
              <Suspense fallback={null}>
                <TerrainScene progress={progress} progressRef={progressRef} active={mapOpacityVal > 0} />
              </Suspense>

              <div
                className="absolute font-coord text-xs uppercase tracking-[0.3em] text-[var(--luma-tertiary-soft)]"
                style={{
                  opacity: clueLabelOpacityVal,
                  left: "64%",
                  top: "42%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                Clue 01
              </div>
            </div>
          )}

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
