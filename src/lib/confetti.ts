import confetti from "canvas-confetti";

export function celebrate() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#c99a45", "#e7c879", "#54b889", "#f5f5f3"],
  });
}
