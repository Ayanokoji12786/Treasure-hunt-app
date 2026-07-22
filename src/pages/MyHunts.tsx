import { useMemo, useState } from "react";
import { Map, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useHuntStore } from "../store/huntStore";
import { HuntCard } from "../components/HuntCard";

export function MyHunts() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const hunts = useHuntStore((s) => s.hunts);
  const participations = useHuntStore((s) => s.participations);
  const [tab, setTab] = useState<"in_progress" | "completed">("in_progress");

  const mine = useMemo(
    () => participations.filter((p) => p.userId === currentUser?.id),
    [participations, currentUser],
  );

  const inProgress = mine.filter((p) => p.status === "in_progress");
  const completed = mine.filter((p) => p.status === "completed");
  const shown = tab === "in_progress" ? inProgress : completed;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-100">My Hunts</h1>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setTab("in_progress")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
            tab === "in_progress" ? "bg-sky-500/20 text-sky-400" : "glass text-slate-300"
          }`}
        >
          <Map className="h-3.5 w-3.5" strokeWidth={2} />
          In Progress ({inProgress.length})
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
            tab === "completed" ? "bg-explorer-500/20 text-explorer-400" : "glass text-slate-300"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
          Completed ({completed.length})
        </button>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => {
          const hunt = hunts.find((h) => h.id === p.huntId);
          if (!hunt) return null;
          return <HuntCard key={p.id} hunt={hunt} />;
        })}
        {shown.length === 0 && (
          <p className="col-span-full text-sm text-slate-400">Nothing here yet — head to Explore to start a hunt.</p>
        )}
      </div>
    </div>
  );
}
