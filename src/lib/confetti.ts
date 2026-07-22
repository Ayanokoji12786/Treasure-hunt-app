import confetti from "canvas-confetti";

export function celebrate() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#2f8f6c", "#52ac87", "#aee1c6", "#f5f4f0"],
  });
}
