import type { ReactNode } from "react";

export function StatCard({ icon, value, label }: { icon: ReactNode; value: number | string; label: string }) {
  return (
    <div className="surface-1 flex flex-col items-center gap-1 rounded-[var(--radius-luma-md)] p-4">
      <span className="text-[var(--luma-tertiary)]">{icon}</span>
      <span className="font-coord text-xl font-semibold text-slate-100">{value}</span>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}
