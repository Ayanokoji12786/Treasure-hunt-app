import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useHuntStore } from "../store/huntStore";
import { StatCard } from "../components/StatCard";

const BADGES = [
  { threshold: 1, label: "First Steps", icon: "🥾" },
  { threshold: 3, label: "Trailblazer", icon: "🔥" },
  { threshold: 5, label: "Master Explorer", icon: "🗺️" },
];

export function Profile() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const participations = useHuntStore((s) => s.participations);
  const navigate = useNavigate();

  const mine = useMemo(
    () => participations.filter((p) => p.userId === currentUser?.id),
    [participations, currentUser],
  );
  const completed = mine.filter((p) => p.status === "completed");
  const inProgress = mine.filter((p) => p.status === "in_progress");
  const cluesSolved = mine.reduce((sum, p) => sum + p.currentClueIndex, 0);
  const earnedBadges = BADGES.filter((b) => completed.length >= b.threshold);

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
        {currentUser.name.charAt(0).toUpperCase()}
      </div>
      <h1 className="mt-3 text-xl font-bold">{currentUser.name}</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{currentUser.email}</p>
      <span className="mt-2 inline-block rounded-full bg-sand-200 px-3 py-1 text-xs font-medium dark:bg-neutral-800">
        Hunt Creator
      </span>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <StatCard icon="🏆" value={completed.length} label="Completed" />
        <StatCard icon="📍" value={inProgress.length} label="In Progress" />
        <StatCard icon="🎯" value={cluesSolved} label="Clues Solved" />
      </div>

      <div className="mt-8 text-left">
        <h2 className="flex items-center gap-2 font-semibold">🎖️ Achievement Badges</h2>
        {earnedBadges.length === 0 ? (
          <div className="mt-3 rounded-xl border border-sand-200 bg-white p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-3xl">🏆</p>
            <p className="mt-2 text-sm font-medium">No badges yet</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Complete a hunt to earn your first badge!
            </p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {earnedBadges.map((b) => (
              <div
                key={b.label}
                className="rounded-xl border border-sand-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900"
              >
                <p className="text-2xl">{b.icon}</p>
                <p className="mt-1 text-xs font-medium">{b.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => {
          logout();
          navigate("/");
        }}
        className="mt-8 text-sm font-medium text-rose-600"
      >
        ⏻ Sign Out
      </button>
    </div>
  );
}
