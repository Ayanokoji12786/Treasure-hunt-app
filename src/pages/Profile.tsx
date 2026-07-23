import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, MapPin, Target, Award, LogOut } from "lucide-react";
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
  const cluesSolved = mine.reduce((sum, p) => sum + p.completedClues, 0);
  const earnedBadges = BADGES.filter((b) => completed.length >= b.threshold);

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-navy-950"
        style={{ backgroundImage: "linear-gradient(180deg, var(--color-gold-400), var(--color-gold-600))" }}
      >
        {currentUser.name.charAt(0).toUpperCase()}
      </div>
      <h1 className="mt-3 text-xl font-bold text-slate-100">{currentUser.name}</h1>
      <p className="text-sm text-slate-400">{currentUser.email}</p>
      <span className="mt-2 inline-block rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
        Hunt Creator
      </span>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <StatCard icon={<Trophy className="mx-auto h-6 w-6" strokeWidth={1.75} />} value={completed.length} label="Completed" />
        <StatCard icon={<MapPin className="mx-auto h-6 w-6" strokeWidth={1.75} />} value={inProgress.length} label="In Progress" />
        <StatCard icon={<Target className="mx-auto h-6 w-6" strokeWidth={1.75} />} value={cluesSolved} label="Clues Solved" />
      </div>

      <div className="mt-8 text-left">
        <h2 className="flex items-center gap-2 font-semibold text-slate-100">
          <Award className="h-4.5 w-4.5 text-gold-500" strokeWidth={2} />
          Achievement Badges
        </h2>
        {earnedBadges.length === 0 ? (
          <div className="glass mt-3 rounded-xl p-6 text-center">
            <Trophy className="mx-auto h-9 w-9 text-gold-500/50" strokeWidth={1.5} />
            <p className="mt-2 text-sm font-medium text-slate-200">No badges yet</p>
            <p className="text-xs text-slate-400">Complete a hunt to earn your first badge!</p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {earnedBadges.map((b) => (
              <div key={b.label} className="glass rounded-xl p-4 text-center">
                <p className="text-2xl">{b.icon}</p>
                <p className="mt-1 text-xs font-medium text-slate-200">{b.label}</p>
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
        className="mx-auto mt-8 flex items-center gap-1.5 text-sm font-medium text-rose-400"
      >
        <LogOut className="h-4 w-4" strokeWidth={2} />
        Sign Out
      </button>
    </div>
  );
}
