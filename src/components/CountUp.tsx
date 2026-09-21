import { useEffect, useState } from "react";
import { animate } from "motion/react";

/** Numeric stats count upward instead of jumping (DESIGN.md Motion — ambient list). */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);

  return <span className={className}>{display.toLocaleString()}</span>;
}
