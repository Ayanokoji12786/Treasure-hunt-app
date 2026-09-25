import { motion, AnimatePresence } from "motion/react";

/** Plays once when a clue is solved — a waypoint ring opens outward through a dark
 * veil, so the next clue arrives by "traveling through" rather than cutting to it.
 * Gold is a hairline ring, never a flood (DESIGN.md: gold stays under ~5% of a
 * surface). Only transform and opacity animate, so it stays on the compositor. */
export function PortalTransition({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-150 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "var(--luma-canvas)" }}
            initial={{ opacity: 0.92 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="rounded-full"
            style={{
              width: "100vmax",
              height: "100vmax",
              border: "2px solid var(--luma-tertiary-soft)",
              boxShadow: "0 0 80px 6px rgba(201,154,69,0.35), inset 0 0 70px rgba(201,154,69,0.22)",
              willChange: "transform, opacity",
            }}
            initial={{ scale: 0.02, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{
              scale: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.7, ease: "easeIn" },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
