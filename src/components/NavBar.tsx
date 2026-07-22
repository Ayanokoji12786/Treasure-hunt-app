import { NavLink } from "react-router-dom";
import { Compass, Map, Plus, Trophy, User } from "lucide-react";

const LINKS = [
  { to: "/explore", label: "Explore", Icon: Compass },
  { to: "/my-hunts", label: "My Hunts", Icon: Map },
  { to: "/create-hunt", label: "Create", Icon: Plus },
  { to: "/leaderboard", label: "Board", Icon: Trophy },
  { to: "/profile", label: "Profile", Icon: User },
];

export function NavBar() {
  return (
    <header className="glass sticky top-0 z-10 border-x-0 border-t-0">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NavLink to="/explore" className="flex items-center gap-2 font-semibold text-slate-100">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-950"
            style={{ backgroundImage: "linear-gradient(180deg, var(--color-gold-400), var(--color-gold-600))" }}
          >
            <Compass className="h-4.5 w-4.5" strokeWidth={2.25} />
          </span>
          Luma Hunt
        </NavLink>
        <nav className="flex items-center gap-1">
          {LINKS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-sky-500/15 text-sky-400" : "text-slate-300 hover:bg-white/10 hover:text-slate-100"
                }`
              }
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
