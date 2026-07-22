import type { ReactNode } from "react";

export function StatCard({ icon, value, label }: { icon: ReactNode; value: number | string; label: string }) {
  return (
    <div className="glass flex flex-col items-center gap-1 rounded-xl p-4">
      <span className="text-gold-500">{icon}</span>
      <span className="text-xl font-semibold text-slate-100">{value}</span>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}
