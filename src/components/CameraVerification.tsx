import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Check, X } from "lucide-react";
import { fileToDataUrl } from "../lib/file";

interface VerifyOutcome {
  verified: boolean;
  reasoning: string;
  huntComplete: boolean;
}

interface CameraVerificationProps {
  clueOrder: number;
  totalClues: number;
  pointsOnSuccess: number;
  onCapture: (dataUrl: string) => Promise<VerifyOutcome>;
  onClose: () => void;
  /** Called once, right after a successful verification is done being shown. */
  onVerified: (outcome: VerifyOutcome) => void;
}

const CHECKLIST = ["Architecture detected", "Landmark geometry matching", "Location proximity verified"];
const MIN_ANALYSIS_MS = 1700;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function CameraVerification({
  clueOrder,
  totalClues,
  pointsOnSuccess,
  onCapture,
  onClose,
  onVerified,
}: CameraVerificationProps) {
  const [phase, setPhase] = useState<"ready" | "analyzing" | "result">("ready");
  const [checklistStep, setChecklistStep] = useState(0);
  const [outcome, setOutcome] = useState<VerifyOutcome | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase !== "analyzing") return;
    const timers = CHECKLIST.map((_, i) => window.setTimeout(() => setChecklistStep(i + 1), 450 + i * 480));
    return () => timers.forEach(window.clearTimeout);
  }, [phase]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setPhoto(dataUrl);
    setPhase("analyzing");
    setChecklistStep(0);
    const [result] = await Promise.all([onCapture(dataUrl), wait(MIN_ANALYSIS_MS)]);
    setOutcome(result);
    setPhase("result");
    if (result.verified) {
      window.setTimeout(() => onVerified(result), 1600);
    }
  }

  return (
    <div className="fixed inset-0 z-200 flex flex-col bg-[var(--luma-canvas)]">
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

      <div className="flex items-center justify-between px-4 pt-4">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-slate-200">
          <X className="h-4.5 w-4.5" strokeWidth={2} />
        </button>
        <span className="font-coord text-xs text-slate-400">
          CLUE {clueOrder}/{totalClues}
        </span>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {photo && (
          <img
            src={photo}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-[filter,opacity] duration-500 ${
              phase === "analyzing" ? "opacity-60 blur-[1px]" : "opacity-35"
            }`}
          />
        )}

        <AnimatePresence mode="wait">
          {phase === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 flex flex-col items-center px-8 text-center"
            >
              <div className="relative h-56 w-56">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="absolute h-6 w-6 border-[var(--luma-tertiary)]"
                    style={{
                      top: i < 2 ? 0 : undefined,
                      bottom: i >= 2 ? 0 : undefined,
                      left: i % 2 === 0 ? 0 : undefined,
                      right: i % 2 === 1 ? 0 : undefined,
                      borderTopWidth: i < 2 ? 2 : 0,
                      borderBottomWidth: i >= 2 ? 2 : 0,
                      borderLeftWidth: i % 2 === 0 ? 2 : 0,
                      borderRightWidth: i % 2 === 1 ? 2 : 0,
                    }}
                  />
                ))}
              </div>
              <p className="-mt-40 max-w-[220px] text-sm text-slate-300">
                Point your camera at the structure you found
              </p>
            </motion.div>
          )}

          {phase === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 flex w-full max-w-xs flex-col items-center px-6 text-center"
            >
              <div className="relative h-40 w-56 overflow-hidden rounded-[var(--radius-luma-md)] border border-white/15">
                <span className="animate-scan-line absolute inset-x-0 h-px bg-[var(--luma-tertiary)] shadow-[0_0_12px_2px_rgba(201,154,69,0.7)]" />
              </div>
              <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-slate-300">
                Analyzing the landmark…
              </p>
              <ul className="mt-4 space-y-1.5 text-left">
                {CHECKLIST.map((label, i) => (
                  <motion.li
                    key={label}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: i < checklistStep ? 1 : 0.25, x: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-2 text-xs text-slate-300"
                  >
                    <Check
                      className={`h-3.5 w-3.5 shrink-0 ${i < checklistStep ? "text-[var(--luma-secondary)]" : "text-slate-600"}`}
                      strokeWidth={2.5}
                    />
                    {label}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {phase === "result" && outcome && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex flex-col items-center px-8 text-center"
            >
              {outcome.verified ? (
                <>
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--luma-tertiary)]">
                    <span className="animate-gold-ring absolute inset-0 rounded-full border-2 border-[var(--luma-tertiary-soft)]" />
                    <Check className="h-8 w-8 text-navy-950" strokeWidth={2.5} />
                  </div>
                  <p className="mt-4 text-lg font-semibold uppercase tracking-wide text-slate-100">
                    Treasure confirmed
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {outcome.huntComplete ? "Hunt complete!" : `Clue ${clueOrder + 1} unlocked`}
                  </p>
                  <p className="font-coord mt-2 text-[var(--luma-tertiary)]">+{pointsOnSuccess} pts</p>
                </>
              ) : (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--luma-raised)]">
                    <X className="h-8 w-8 text-[var(--luma-error)]" strokeWidth={2.5} />
                  </div>
                  <p className="mt-4 max-w-xs text-sm text-slate-300">{outcome.reasoning}</p>
                  <button
                    onClick={() => {
                      setPhase("ready");
                      setPhoto(null);
                      setOutcome(null);
                    }}
                    className="btn-glass mt-5"
                  >
                    Try again
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === "ready" && (
        <div className="flex justify-center pb-10 pt-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/20 bg-[var(--luma-tertiary)] text-navy-950 transition-transform active:scale-95"
            aria-label="Capture photo"
          >
            <Camera className="h-6 w-6" strokeWidth={2.25} />
          </button>
        </div>
      )}
    </div>
  );
}
