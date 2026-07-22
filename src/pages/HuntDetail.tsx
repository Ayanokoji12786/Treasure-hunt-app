import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useHuntStore } from "../store/huntStore";
import { useAuthStore } from "../store/authStore";
import { DifficultyBadge } from "../components/DifficultyBadge";
import { celebrate } from "../lib/confetti";
import { getCurrentPosition, haversineMeters } from "../lib/geo";
import { isAiVerificationEnabled } from "../lib/verify";
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
  const hunt = useHuntStore((s) => (huntId ? s.getHunt(huntId) : undefined));
  const participation = useHuntStore((s) =>
    huntId && currentUser ? s.getParticipation(huntId, currentUser.id) : undefined,
  );
  const startHunt = useHuntStore((s) => s.startHunt);
  const useHint = useHuntStore((s) => s.useHint);
  const submitVerification = useHuntStore((s) => s.submitVerification);
  const exportHunt = useHuntStore((s) => s.exportHunt);

  const [starting, setStarting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const celebratedRef = useRef(false);

  const currentClue = hunt && participation ? hunt.clues[participation.currentClueIndex] : undefined;

  useEffect(() => {
    setDistance(null);
    setGeoError(null);
    setFeedback(null);
    if (!currentClue) return;
    getCurrentPosition()
      .then((pos) => setDistance(haversineMeters(pos.lat, pos.lng, currentClue.lat, currentClue.lng)))
      .catch((err) => setGeoError(err.message ?? "Location unavailable."));
  }, [currentClue?.id]);

  useEffect(() => {
    if (participation?.status === "completed" && !celebratedRef.current) {
      celebratedRef.current = true;
      celebrate();
    }
  }, [participation?.status]);

  if (!hunt) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-neutral-500 dark:text-neutral-400">
        Hunt not found.
      </div>
    );
  }

  async function handleStart() {
    if (!currentUser || !huntId) return;
    setStarting(true);
    startHunt(huntId, currentUser.id);
    setStarting(false);
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

  const joinUrl = `${window.location.origin}/join?code=${hunt.code}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/explore" className="text-sm text-neutral-500 dark:text-neutral-400">
        ← Back
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl">
        <img src={hunt.coverImage} alt={hunt.title} className="h-56 w-full object-cover" />
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">{hunt.title}</h1>
        <DifficultyBadge difficulty={hunt.difficulty} />
      </div>
      <p className="mt-1 text-neutral-500 dark:text-neutral-400">{hunt.description}</p>
      <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
        <span>📍 {hunt.clues.length} clues</span>
        <button onClick={() => setShowShare((v) => !v)} className="font-medium text-brand-600">
          🔗 Share code: {hunt.code}
        </button>
      </div>

      {showShare && (
        <div className="mt-3 flex items-center gap-4 rounded-xl border border-sand-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <QRCodeSVG value={joinUrl} size={96} />
          <div className="text-sm">
            <p className="font-medium">Scan to join</p>
            <p className="text-neutral-500 dark:text-neutral-400">Code: {hunt.code}</p>
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
              className="mt-2 text-brand-600"
            >
              ⬇️ Export hunt as JSON
            </button>
          </div>
        </div>
      )}

      {!participation && (
        <button
          onClick={handleStart}
          disabled={starting}
          className="mt-6 w-full rounded-lg bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          ▶ Start Hunt
        </button>
      )}

      {participation?.status === "completed" && (
        <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center dark:border-brand-900 dark:bg-brand-900/20">
          <p className="text-3xl">🏆</p>
          <h2 className="mt-2 text-xl font-bold">Hunt complete!</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            Score: <strong>{participation.score}</strong> · Time:{" "}
            {participation.elapsedSeconds ? `${Math.floor(participation.elapsedSeconds / 60)}m ${participation.elapsedSeconds % 60}s` : "—"}
          </p>
          <Link to="/leaderboard" className="mt-4 inline-block text-sm font-medium text-brand-600">
            View leaderboard →
          </Link>
        </div>
      )}

      {participation?.status === "in_progress" && currentClue && (
        <div className="mt-6 rounded-2xl border border-sand-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm font-medium">{currentClue.locationName}</p>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">{currentClue.hint}</p>

          <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
            {distance !== null && (
              <p>
                📡 You're about {Math.round(distance)}m from this spot
                {distance > PROXIMITY_THRESHOLD_METERS && " — head closer before scanning for a better verification."}
              </p>
            )}
            {geoError && <p>📡 Location unavailable ({geoError}) — you can still scan a photo.</p>}
            {!isAiVerificationEnabled && (
              <p className="mt-1 text-amber-600 dark:text-amber-400">
                ⚠️ AI photo verification isn't configured — photos are auto-accepted. Add VITE_GROQ_API_KEY to enable it.
              </p>
            )}
          </div>

          {!participation.hintsUsed.includes(participation.currentClueIndex) && (
            <button
              onClick={() => useHint(participation.id)}
              className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400"
            >
              💡 Reveal AI-verification hint (−15 pts)
            </button>
          )}
          {participation.hintsUsed.includes(participation.currentClueIndex) && (
            <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
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
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={verifying}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {verifying ? "Verifying…" : "📷 Scan Surroundings"}
          </button>

          {feedback && (
            <p
              className={`mt-3 rounded-lg p-2 text-sm ${
                feedback.ok
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
              }`}
            >
              {feedback.message}
            </p>
          )}
        </div>
      )}

      {participation && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Clue progress
          </h3>
          <div className="mt-2 space-y-2">
            {hunt.clues.map((clue, i) => {
              const isCurrent = i === participation.currentClueIndex && participation.status === "in_progress";
              const isSolved = i < participation.currentClueIndex || participation.status === "completed";
              return (
                <div
                  key={clue.id}
                  className={`flex items-start gap-3 rounded-xl border p-3 ${
                    isCurrent
                      ? "border-brand-300 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/20"
                      : "border-sand-200 dark:border-neutral-800"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isSolved
                        ? "bg-brand-600 text-white"
                        : isCurrent
                          ? "border-2 border-brand-500 text-brand-600"
                          : "bg-sand-200 text-neutral-500 dark:bg-neutral-800"
                    }`}
                  >
                    {isSolved ? "✓" : i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {clue.locationName}
                      {isCurrent && (
                        <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] text-white">
                          Current
                        </span>
                      )}
                    </p>
                    {(isCurrent || isSolved) && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{clue.hint}</p>
                    )}
                    {!isCurrent && !isSolved && (
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        🔒 Solve previous clues to unlock
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
