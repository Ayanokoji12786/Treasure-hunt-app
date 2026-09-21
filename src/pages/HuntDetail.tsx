import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  Camera,
  Check,
  Compass,
  Download,
  Lightbulb,
  Link2,
  Lock,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";
import { useHuntStore } from "../store/huntStore";
import { useAuthStore } from "../store/authStore";
import { DifficultyBadge } from "../components/DifficultyBadge";
import { CameraVerification } from "../components/CameraVerification";
import { LoadingScreen } from "../components/LoadingScreen";
import { usePageLoader } from "../hooks/usePageLoader";
import { celebrate } from "../lib/confetti";
import { getCurrentPosition, haversineMeters } from "../lib/geo";
import { geocodeQuery } from "../lib/geocode";
import { isAiVerificationEnabled } from "../lib/verify";
import { computeScore, elapsedSeconds, perCluePoints } from "../lib/scoring";
import { estimateDuration } from "../lib/estimate";
import type { Hunt } from "../types";
import { QRCodeSVG } from "qrcode.react";

const PROXIMITY_THRESHOLD_METERS = 300;
const MAX_PLAUSIBLE_LEG_METERS = 50_000;

function RadarDial({ distance }: { distance: number | null }) {
  const color =
    distance === null || distance > PROXIMITY_THRESHOLD_METERS
      ? "var(--luma-neutral)"
      : distance < 100
        ? "var(--luma-tertiary)"
        : "var(--luma-tertiary-soft)";
  return (
    <div className="relative mx-auto mt-4 flex h-36 w-36 items-center justify-center" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border"
          style={{ borderColor: color }}
          initial={{ width: 36, height: 36, opacity: 0.5 }}
          animate={{ width: [36, 144], height: [36, 144], opacity: [0.5, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut", delay: i * 0.85 }}
        />
      ))}
      <motion.span
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative h-3.5 w-3.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 18px 2px ${color}` }}
      />
    </div>
  );
}

function RoutePreview({ clueCount, solvedCount, started }: { clueCount: number; solvedCount: number; started: boolean }) {
  return (
    <div>
      <div className="flex items-center">
        <span className="font-coord mr-1.5 text-[10px] text-slate-500">START</span>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--luma-tertiary)]" />
        {Array.from({ length: clueCount }).map((_, i) => {
          const solved = i < solvedCount;
          const current = started && i === solvedCount;
          const isLast = i === clueCount - 1;
          return (
            <div key={i} className="flex flex-1 items-center">
              <span className={`h-px flex-1 ${solved ? "bg-[var(--luma-tertiary)]" : "bg-[var(--luma-border)]"}`} />
              {isLast ? (
                <span
                  className={`h-2.5 w-2.5 shrink-0 rotate-45 ${solved ? "bg-[var(--luma-tertiary)]" : "border border-[var(--luma-border)]"}`}
                />
              ) : (
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-medium ${
                    solved
                      ? "bg-[var(--luma-tertiary)] text-navy-950"
                      : current
                        ? "animate-waypoint-pulse bg-[var(--luma-tertiary)]"
                        : "border border-[var(--luma-border)] text-slate-500"
                  }`}
                >
                  {!solved && !current ? "?" : ""}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className="font-coord mt-1.5 text-right text-[10px] text-slate-500">TREASURE</p>
    </div>
  );
}

export function HuntDetail() {
  const { huntId } = useParams<{ huntId: string }>();
  const currentUser = useAuthStore((s) => s.currentUser);
  const loadHuntById = useHuntStore((s) => s.loadHuntById);
  const participation = useHuntStore((s) =>
    huntId && currentUser ? s.getParticipation(huntId, currentUser.id) : undefined,
  );
  const startHunt = useHuntStore((s) => s.startHunt);
  const revealHint = useHuntStore((s) => s.revealHint);
  const hintsUsedFor = useHuntStore((s) => s.hintsUsedFor);
  const submitVerification = useHuntStore((s) => s.submitVerification);
  const exportHunt = useHuntStore((s) => s.exportHunt);
  const explorerCounts = useHuntStore((s) => s.explorerCounts);
  const loadExplorerCounts = useHuntStore((s) => s.loadExplorerCounts);

  const [hunt, setHunt] = useState<Hunt | undefined>();
  const [loadingHunt, setLoadingHunt] = useState(true);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [totalDistanceKm, setTotalDistanceKm] = useState<number | null>(null);
  const celebratedRef = useRef(false);
  const { loaderVisible, hideLoader } = usePageLoader();

  useEffect(() => {
    if (!huntId) return;
    setLoadingHunt(true);
    loadHuntById(huntId)
      .then(setHunt)
      .catch(() => setHunt(undefined))
      .finally(() => setLoadingHunt(false));
    loadExplorerCounts().catch(() => {});
  }, [huntId, loadHuntById, loadExplorerCounts]);

  const currentClue =
    hunt && participation ? hunt.clues.find((c) => c.order === participation.currentClueOrder) : undefined;

  // Deliberately does not clear `feedback`-equivalent state: this runs whenever the clue
  // changes, which includes right after a successful scan.
  useEffect(() => {
    setDistance(null);
    setGeoError(null);
    if (!currentClue) return;
    Promise.all([getCurrentPosition(), geocodeQuery(currentClue.locationQuery)])
      .then(([pos, target]) => {
        if (target) setDistance(haversineMeters(pos.lat, pos.lng, target.lat, target.lng));
      })
      .catch((err) => setGeoError(err.message ?? "Location unavailable."));
  }, [currentClue?.id]);

  // Total route distance — geocodes each clue in sequence (small, bounded set) and
  // sums consecutive legs. Best-effort: a hunt with ungeocodable clues just shows no
  // distance stat rather than a wrong one.
  useEffect(() => {
    if (!hunt) return;
    let cancelled = false;
    async function run() {
      const points: Array<{ lat: number; lng: number }> = [];
      for (const clue of hunt!.clues) {
        if (cancelled) return;
        try {
          const p = await geocodeQuery(clue.locationQuery);
          if (p) points.push(p);
        } catch {
          // skip this leg
        }
        await new Promise((r) => setTimeout(r, 200));
      }
      if (cancelled || points.length < 2) return;
      let total = 0;
      let countedLegs = 0;
      for (let i = 1; i < points.length; i++) {
        const leg = haversineMeters(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng);
        // A free-text geocode occasionally matches a same-named place on another
        // continent. A real hunt's clues are walkable/drivable from each other, so an
        // implausible jump is a bad match, not a real leg — skip it rather than let one
        // bad geocode turn "0.8 km" into "12,664 km".
        if (leg > MAX_PLAUSIBLE_LEG_METERS) continue;
        total += leg;
        countedLegs++;
      }
      if (countedLegs > 0) setTotalDistanceKm(total / 1000);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [hunt]);

  useEffect(() => {
    if (participation?.status === "completed" && !celebratedRef.current) {
      celebratedRef.current = true;
      celebrate();
    }
  }, [participation?.status]);

  if (loaderVisible) {
    return <LoadingScreen active={loadingHunt} context="hunt" onDone={hideLoader} />;
  }

  if (!hunt) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-400">Hunt not found.</div>;
  }

  async function handleStart() {
    if (!currentUser || !huntId) return;
    setStarting(true);
    setStartError(null);
    try {
      await startHunt(huntId, currentUser.id);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Couldn't start this hunt. Please try again.");
    } finally {
      setStarting(false);
    }
  }

  const joinUrl = hunt.joinCode ? `${window.location.origin}/join?code=${hunt.joinCode}` : undefined;
  const hintsUsed = participation ? hintsUsedFor(participation.id) : [];
  const score = participation ? computeScore(hunt, participation, hintsUsed) : 0;
  const location = hunt.clues[0]?.locationName;
  const solvedCount = participation
    ? participation.status === "completed"
      ? hunt.clues.length
      : participation.currentClueOrder - 1
    : 0;

  return (
    <div className="pb-16">
      {/* Hero — mission briefing, not an information page */}
      <div className="relative h-72 w-full overflow-hidden sm:h-96">
        <img src={hunt.coverImage} alt={hunt.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--luma-canvas)] via-[var(--luma-canvas)]/35 to-black/10" />
        <Link
          to="/explore"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-slate-200 backdrop-blur-sm"
        >
          ←
        </Link>
        {hunt.joinCode && (
          <button
            onClick={() => setShowShare((v) => !v)}
            className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-sm"
          >
            <Link2 className="h-3.5 w-3.5" strokeWidth={2} />
            {hunt.joinCode}
          </button>
        )}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-8 sm:pb-8">
          {location && (
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.22em] text-slate-300">
              <MapPin className="h-3.5 w-3.5 text-[var(--luma-tertiary)]" strokeWidth={2} />
              {location}
            </p>
          )}
          <h1 className="font-display-serif mt-2 text-4xl leading-[1.05] text-slate-50 sm:text-5xl">{hunt.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <DifficultyBadge difficulty={hunt.difficulty} />
            <span className="font-coord text-xs text-slate-300">{hunt.clues.length} clues</span>
            <span className="font-coord text-xs text-slate-300">{estimateDuration(hunt)}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4">
        {showShare && joinUrl && (
          <div className="surface-1 mt-4 flex items-center gap-4 rounded-[var(--radius-luma-md)] p-4">
            <div className="rounded-lg bg-white p-2">
              <QRCodeSVG value={joinUrl} size={96} />
            </div>
            <div className="text-sm">
              <p className="font-medium text-slate-100">Scan to join</p>
              <p className="text-slate-400">Code: {hunt.joinCode}</p>
              <button
                onClick={() => {
                  const json = exportHunt(hunt.id);
                  const blob = new Blob([json], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${hunt.title.replace(/\s+/g, "-").toLowerCase()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="mt-2 flex items-center gap-1 text-sky-400"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2} />
                Export hunt as JSON
              </button>
            </div>
          </div>
        )}

        {!participation && hunt.status === "draft" && (
          <p className="mt-6 rounded-[var(--radius-luma-md)] border border-gold-500/20 bg-gold-500/10 p-3 text-sm text-gold-300">
            This is a draft only you can see. Publish it from Create Hunt before anyone can play it.
          </p>
        )}

        {!participation && hunt.status !== "draft" && (
          <div className="relative z-10 -mt-6">
            <button onClick={handleStart} disabled={starting} className="btn-primary w-full">
              <Compass className="h-4 w-4" strokeWidth={2} />
              {starting ? "Starting…" : "Begin Hunt"}
            </button>
            {startError && (
              <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-sm text-rose-400">
                {startError}
              </p>
            )}
          </div>
        )}

        {participation?.status === "completed" && (
          <div className="surface-1 mt-6 rounded-[var(--radius-luma-lg)] p-6 text-center">
            <Trophy className="mx-auto h-9 w-9 text-gold-500" strokeWidth={1.75} />
            <h2 className="mt-2 text-xl font-bold text-slate-100">Hunt complete!</h2>
            <p className="mt-1 text-sm text-slate-300">
              Score: <strong className="text-explorer-400">{score}</strong> · Time:{" "}
              {`${Math.floor(elapsedSeconds(participation) / 60)}m ${elapsedSeconds(participation) % 60}s`}
            </p>
            <Link to="/leaderboard" className="mt-4 inline-block text-sm font-medium text-sky-400">
              View leaderboard →
            </Link>
          </div>
        )}

        {/* Mission */}
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Mission</h2>
          <p className="mt-2 max-w-[65ch] text-slate-300">{hunt.description}</p>
        </div>

        {/* Route — abstracted progression, not exact clue locations */}
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Route</h2>
          <div className="mt-4">
            <RoutePreview clueCount={hunt.clues.length} solvedCount={solvedCount} started={!!participation} />
          </div>
        </div>

        {/* Details */}
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-luma-md)] border border-white/8 sm:grid-cols-4">
          {[
            { label: "Distance", value: totalDistanceKm ? `${totalDistanceKm.toFixed(1)} km` : "—" },
            { label: "Time", value: estimateDuration(hunt) },
            { label: "Difficulty", value: hunt.difficulty },
            { label: "Players", value: explorerCounts[hunt.id]?.toLocaleString() ?? "—" },
          ].map((d) => (
            <div key={d.label} className="bg-[var(--luma-surface)] p-4">
              <p className="font-coord text-lg capitalize text-slate-100">{d.value}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{d.label}</p>
            </div>
          ))}
        </div>

        {/* Active clue — HUD */}
        {participation?.status === "in_progress" && currentClue && (
          <div className="surface-1 relative mt-8 overflow-hidden rounded-[var(--radius-luma-lg)] p-6">
            <div className="flex items-center justify-between">
              <span className="font-coord text-xs text-slate-400">
                CLUE {String(currentClue.order).padStart(2, "0")}/{String(hunt.clues.length).padStart(2, "0")}
              </span>
              <span className="font-coord text-xs text-[var(--luma-tertiary)]">
                {perCluePoints(hunt.difficulty, hintsUsed.includes(currentClue.order))} PTS
              </span>
            </div>

            <RadarDial distance={distance} />

            {distance !== null && (
              <>
                <p className="font-coord mt-3 text-center text-3xl text-slate-100">{Math.round(distance)}m</p>
                <p className="text-center text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  From target
                  {distance > PROXIMITY_THRESHOLD_METERS && " — head closer for a better verification"}
                </p>
              </>
            )}
            {geoError && (
              <p className="mt-2 text-center text-xs text-slate-500">Location unavailable ({geoError}) — you can still scan a photo.</p>
            )}
            {!isAiVerificationEnabled && (
              <p className="mt-2 text-center text-xs text-gold-400">
                ⚠ AI verification isn't configured — photos are auto-accepted.
              </p>
            )}

            <p className="font-display-serif mt-6 text-center text-2xl leading-snug text-slate-200">
              "{currentClue.hint}"
            </p>

            <div className="divider my-6" />
            <p className="text-center text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Search area · <span className="font-coord text-slate-400">± {PROXIMITY_THRESHOLD_METERS}m</span>
            </p>

            {!hintsUsed.includes(currentClue.order) ? (
              <button
                onClick={() => revealHint(participation.id, currentClue.order)}
                className="mx-auto mt-4 flex items-center gap-1 text-xs font-medium text-gold-400"
              >
                <Lightbulb className="h-3.5 w-3.5" strokeWidth={2} />
                Need another hint? (−15 pts)
              </button>
            ) : (
              <p className="mt-4 rounded-lg border border-gold-500/20 bg-gold-500/10 p-2 text-center text-xs text-gold-300">
                {currentClue.verificationDescription}
              </p>
            )}

            <button onClick={() => setCameraOpen(true)} className="btn-treasure mt-5 w-full">
              <Camera className="h-4 w-4" strokeWidth={2} />
              Open Camera to Verify
            </button>
          </div>
        )}

        {/* Clue progress */}
        {participation && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Clue progress</h3>
            <div className="mt-3 space-y-2">
              {hunt.clues.map((clue) => {
                const isCurrent = clue.order === participation.currentClueOrder && participation.status === "in_progress";
                const isSolved = clue.order < participation.currentClueOrder || participation.status === "completed";
                return (
                  <div
                    key={clue.id}
                    className={`surface-1 flex items-start gap-3 rounded-[var(--radius-luma-md)] p-3 ${isCurrent ? "border-sky-400/40" : ""}`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        isSolved
                          ? "bg-explorer-500 text-white"
                          : isCurrent
                            ? "border-2 border-sky-400 text-sky-400"
                            : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {isSolved ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : clue.order}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        {clue.locationName}
                        {isCurrent && (
                          <span className="ml-2 rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] text-sky-400">Current</span>
                        )}
                      </p>
                      {(isCurrent || isSolved) && <p className="text-xs text-slate-400">{clue.hint}</p>}
                      {!isCurrent && !isSolved && (
                        <p className="flex items-center gap-1 text-xs text-slate-500">
                          <Lock className="h-3 w-3" strokeWidth={2} />
                          Solve previous clues to unlock
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {explorerCounts[hunt.id] !== undefined && explorerCounts[hunt.id] > 0 && (
          <p className="mt-8 flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5" strokeWidth={2} />
            {explorerCounts[hunt.id].toLocaleString()} explorer{explorerCounts[hunt.id] === 1 ? "" : "s"} have taken this hunt
          </p>
        )}
      </div>

      {cameraOpen && currentClue && participation && (
        <CameraVerification
          clueOrder={currentClue.order}
          totalClues={hunt.clues.length}
          pointsOnSuccess={perCluePoints(hunt.difficulty, hintsUsed.includes(currentClue.order))}
          onCapture={(dataUrl) => submitVerification(participation.id, dataUrl)}
          onClose={() => setCameraOpen(false)}
          onVerified={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}
