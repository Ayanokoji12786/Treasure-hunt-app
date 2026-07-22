export function StatCard({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-sand-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <span className="text-2xl">{icon}</span>
      <span className="text-xl font-semibold">{value}</span>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
    </div>
  );
}
