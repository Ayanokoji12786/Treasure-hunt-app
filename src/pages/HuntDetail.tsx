import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Camera,
  Check,
  Compass,
  Download,
  Lightbulb,
  Link2,
  Lock,
  MapPin,
  Radar,
  Trophy,
} from "lucide-react";
import { useHuntStore } from "../store/huntStore";
import { useAuthStore } from "../store/authStore";
import { DifficultyBadge } from "../components/DifficultyBadge";
import { celebrate } from "../lib/confetti";
import { getCurrentPosition, haversineMeters } from "../lib/geo";
import { geocodeQuery } from "../lib/geocode";
import { isAiVerificationEnabled } from "../lib/verify";
import { computeScore, elapsedSeconds } from "../lib/scoring";
import type { Hunt } from "../types";
import { QRCodeSVG } from "qrcode.react";

const PROXIMITY_THRESHOLD_METERS = 300;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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

  const [hunt, setHunt] = useState<Hunt | undefined>();
  const [loadingHunt, setLoadingHunt] = useState(true);
  const [starting, setStarting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const celebratedRef = useRef(false);

  useEffect(() => {
    if (!huntId) return;
    setLoadingHunt(true);
    loadHuntById(huntId)
      .then(setHunt)
      .catch(() => setHunt(undefined))
      .finally(() => setLoadingHunt(false));
  }, [huntId, loadHuntById]);

  const currentClue =
    hunt && participation ? hunt.clues.find((c) => c.order === participation.currentClueOrder) : undefined;

  // Deliberately does not clear `feedback`: this runs whenever the clue changes, which
  // includes right after a successful scan — clearing here would wipe the "next clue
  // unlocked" message before the player ever sees it.
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

  useEffect(() => {
    if (participation?.status === "completed" && !celebratedRef.current) {
      celebratedRef.current = true;
      celebrate();
    }
  }, [participation?.status]);

  if (loadingHunt) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-400">Loading hunt…</div>;
  }

  if (!hunt) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-400">Hunt not found.</div>;
  }

  async function handleStart() {
    if (!currentUser || !huntId) return;
    setStarting(true);
    setFeedback(null);
    try {
      await startHunt(huntId, currentUser.id);
    } catch (err) {
      setFeedback({
        ok: false,
        message: err instanceof Error ? err.message : "Couldn't start this hunt. Please try again.",
      });
    } finally {
      setStarting(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !participation) return;
    setVerifying(true);
    setFeedback(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      const result = await submitVerification(participation.id, dataUrl);
      if (result.verified) {
        setFeedback({
          ok: true,
          message: result.huntComplete
            ? "Hunt complete! Great work."
            : result.reasoning || "Location verified — next clue unlocked!",
        });
      } else {
        setFeedback({ ok: false, message: result.reasoning || "That doesn't look like the right spot yet." });
      }
    } catch (err) {
      setFeedback({ ok: false, message: err instanceof Error ? err.message : "Verification failed." });
    } finally {
      setVerifying(false);
    }
  }

  const joinUrl = hunt.joinCode ? `${window.location.origin}/join?code=${hunt.joinCode}` : undefined;
  const hintsUsed = participation ? hintsUsedFor(participation.id) : [];
  const score = participation ? computeScore(hunt, participation, hintsUsed) : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/explore" className="text-sm text-slate-400">
        ← Back
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl">
        <img src={hunt.coverImage} alt={hunt.title} className="h-56 w-full object-cover" />
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-100">{hunt.title}</h1>
        <DifficultyBadge difficulty={hunt.difficulty} />
      </div>
      <p className="mt-1 text-slate-400">{hunt.description}</p>
      <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-gold-500" strokeWidth={2} />
          {hunt.clues.length} clues
        </span>
        {hunt.joinCode && (
          <button onClick={() => setShowShare((v) => !v)} className="flex items-center gap-1 font-medium text-sky-400">
            <Link2 className="h-3.5 w-3.5" strokeWidth={2} />
            Share code: {hunt.joinCode}
          </button>
        )}
      </div>

      {showShare && joinUrl && (
        <div className="glass mt-3 flex items-center gap-4 rounded-xl p-4">
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
        <p className="mt-6 rounded-xl border border-gold-500/20 bg-gold-500/10 p-3 text-sm text-gold-300">
          This is a draft only you can see. Publish it from Create Hunt before anyone can play it.
        </p>
      )}

      {!participation && hunt.status !== "draft" && (
        <>
          <button onClick={handleStart} disabled={starting} className="btn-primary mt-6 w-full">
            <Compass className="h-4 w-4" strokeWidth={2} />
            {starting ? "Starting…" : "Start Hunt"}
          </button>
          {feedback && !feedback.ok && (
            <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-sm text-rose-400">
              {feedback.message}
            </p>
          )}
        </>
      )}

      {participation?.status === "completed" && (
        <div className="glass mt-6 rounded-2xl border-explorer-500/30 p-6 text-center">
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

      {participation?.status === "in_progress" && currentClue && (
        <div className="glass mt-6 rounded-2xl p-5">
          <p className="text-sm font-medium text-slate-100">{currentClue.locationName}</p>
          <p className="mt-2 text-slate-300">{currentClue.hint}</p>

          <div className="mt-3 space-y-1 text-xs text-slate-400">
            {distance !== null && (
              <p className="flex items-start gap-1.5">
                <Radar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400" strokeWidth={2} />
                You're about {Math.round(distance)}m from this spot
                {distance > PROXIMITY_THRESHOLD_METERS && " — head closer before scanning for a better verification."}
              </p>
            )}
            {geoError && (
              <p className="flex items-start gap-1.5">
                <Radar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={2} />
                Location unavailable ({geoError}) — you can still scan a photo.
              </p>
            )}
            {!isAiVerificationEnabled && (
              <p className="mt-1 text-gold-400">
                ⚠ AI photo verification isn't configured — photos are auto-accepted. Add VITE_GROQ_API_KEY to enable it.
              </p>
            )}
          </div>

          {!hintsUsed.includes(currentClue.order) && (
            <button
              onClick={() => {
                revealHint(participation.id, currentClue.order);
                setFeedback(null);
              }}
              className="mt-3 flex items-center gap-1 text-xs font-medium text-gold-400"
            >
              <Lightbulb className="h-3.5 w-3.5" strokeWidth={2} />
              Reveal AI-verification hint (−15 pts)
            </button>
          )}
          {hintsUsed.includes(currentClue.order) && (
            <p className="mt-3 rounded-lg border border-gold-500/20 bg-gold-500/10 p-2 text-xs text-gold-300">
              {currentClue.verificationDescription}
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <button onClick={() => fileInputRef.current?.click()} disabled={verifying} className="btn-primary mt-4 w-full">
            <Camera className="h-4 w-4" strokeWidth={2} />
            {verifying ? "Verifying…" : "Find Treasure"}
          </button>

          {feedback && (
            <p
              className={`mt-3 rounded-lg border p-2 text-sm ${
                feedback.ok
                  ? "border-explorer-500/30 bg-explorer-500/10 text-explorer-400"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-400"
              }`}
            >
              {feedback.message}
            </p>
          )}
        </div>
      )}

      {participation && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Clue progress</h3>
          <div className="mt-2 space-y-2">
            {hunt.clues.map((clue) => {
              const isCurrent = clue.order === participation.currentClueOrder && participation.status === "in_progress";
              const isSolved = clue.order < participation.currentClueOrder || participation.status === "completed";
              return (
                <div
                  key={clue.id}
                  className={`glass flex items-start gap-3 rounded-xl p-3 ${isCurrent ? "border-sky-400/40" : ""}`}
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
                        <span className="ml-2 rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] text-sky-400">
                          Current
                        </span>
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
    </div>
  );
}
