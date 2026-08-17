import { useEffect, useMemo, useState } from "react";
import { Map, CheckCircle2, FileEdit } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useHuntStore } from "../store/huntStore";
import { HuntCard } from "../components/HuntCard";

export function MyHunts() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const hunts = useHuntStore((s) => s.hunts);
  const drafts = useHuntStore((s) => s.drafts);
  const loadHunts = useHuntStore((s) => s.loadHunts);
  const loadDrafts = useHuntStore((s) => s.loadDrafts);
  const participations = useHuntStore((s) => s.participations);
  const [tab, setTab] = useState<"in_progress" | "completed">("in_progress");

  useEffect(() => {
    loadHunts();
    loadDrafts();
  }, [loadHunts, loadDrafts]);

  const myDrafts = useMemo(
    () => drafts.filter((h) => h.creatorId === currentUser?.id),
    [drafts, currentUser],
  );

  const mine = useMemo(
    () => participations.filter((p) => p.userId === currentUser?.id),
    [participations, currentUser],
  );

  const inProgress = mine.filter((p) => p.status === "in_progress");
  const completed = mine.filter((p) => p.status === "completed");
  // Only count runs whose hunt actually resolved — otherwise the tab counts disagree
  // with the grid and an unresolvable run renders as blank space with no explanation.
  const shown = (tab === "in_progress" ? inProgress : completed).flatMap((p) => {
    const hunt = hunts.find((h) => h.id === p.huntId);
    return hunt ? [{ participation: p, hunt }] : [];
  });

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
        {shown.map(({ participation, hunt }) => (
          <HuntCard key={participation.id} hunt={hunt} />
        ))}
        {shown.length === 0 && (
          <p className="col-span-full text-sm text-slate-400">Nothing here yet — head to Explore to start a hunt.</p>
        )}
      </div>

      {myDrafts.length > 0 && (
        <div className="mt-10">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-300">
            <FileEdit className="h-4 w-4 text-gold-400" strokeWidth={2} />
            Your drafts (only visible to you)
          </h2>
          <div className="mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myDrafts.map((hunt) => (
              <HuntCard key={hunt.id} hunt={hunt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
