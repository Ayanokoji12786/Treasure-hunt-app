import { NavLink } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { to: "/explore", label: "Explore", icon: "🧭" },
  { to: "/my-hunts", label: "My Hunts", icon: "🗺️" },
  { to: "/create-hunt", label: "Create", icon: "➕" },
  { to: "/leaderboard", label: "Board", icon: "🏆" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

export function NavBar() {
  return (
    <header className="border-b border-sand-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NavLink to="/explore" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            🧭
          </span>
          TrailQuest
        </NavLink>
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-neutral-600 hover:bg-sand-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
