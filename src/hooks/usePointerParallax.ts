import { useEffect, useRef } from "react";

/** Normalized (-1..1) pointer position tracked on `window`, not scoped to a single
 * canvas — the 3D scenes react to mouse movement anywhere on the page, not just
 * while hovering the canvas itself. Read via `.current` inside useFrame, not state,
 * so scene updates don't trigger React re-renders. */
export function usePointerParallax() {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function onMove(e: PointerEvent) {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return pointer;
}
