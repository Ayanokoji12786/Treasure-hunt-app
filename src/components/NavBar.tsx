import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { Compass, Map, Plus, Trophy, User } from "lucide-react";

const PRIMARY = [
  { to: "/explore", label: "Explore", Icon: Compass },
  { to: "/my-hunts", label: "My Hunts", Icon: Map },
];

const MOBILE_TABS = [
  { to: "/explore", label: "Explore", Icon: Compass },
  { to: "/my-hunts", label: "Hunts", Icon: Map },
  { to: "/create-hunt", label: "", Icon: Plus, accent: true },
  { to: "/leaderboard", label: "Rank", Icon: Trophy },
  { to: "/profile", label: "You", Icon: User },
];

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  const ticking = useRef(false);
  useEffect(() => {
    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold);
        ticking.current = false;
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export function NavBar() {
  const scrolled = useScrolled();

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b transition-[background-color,backdrop-filter,border-color] duration-300 ${
          scrolled
            ? "border-white/8 bg-[var(--luma-raised)]/70 backdrop-blur-xl"
            : "border-transparent bg-[var(--luma-canvas)]/0"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <NavLink to="/explore" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--luma-tertiary)] text-navy-950">
              <Compass className="h-4.5 w-4.5" strokeWidth={2.25} />
            </span>
            <span className="text-sm font-semibold tracking-[0.2em] text-slate-100">LUMA</span>
          </NavLink>

          <nav className="hidden items-center gap-1 sm:flex">
            {PRIMARY.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-sky-400/15 text-sky-400" : "text-slate-300 hover:bg-white/8 hover:text-slate-100"
                  }`
                }
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:flex ${
                  isActive ? "text-gold-400" : "text-slate-400 hover:text-slate-100"
                }`
              }
              title="Leaderboard"
            >
              <Trophy className="h-4 w-4" strokeWidth={2} />
            </NavLink>
            <NavLink to="/create-hunt" className="btn-primary hidden !px-4 !py-2 text-xs sm:inline-flex">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Create Hunt
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                  isActive
                    ? "border-sky-400/50 text-sky-400"
                    : "border-white/10 text-slate-300 hover:border-white/20 hover:text-slate-100"
                }`
              }
              title="Profile"
            >
              <User className="h-4 w-4" strokeWidth={2} />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="glass fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-x-0 border-b-0 px-2 py-2 sm:hidden">
        {MOBILE_TABS.map(({ to, label, Icon, accent }) =>
          accent ? (
            <NavLink
              key={to}
              to={to}
              className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--luma-tertiary)] text-navy-950 shadow-[0_8px_20px_-8px_rgba(201,154,69,0.6)]"
            >
              <Icon className="h-5 w-5" strokeWidth={2.5} />
            </NavLink>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium ${
                  isActive ? "text-sky-400" : "text-slate-400"
                }`
              }
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              {label}
            </NavLink>
          ),
        )}
      </nav>
    </>
  );
}
