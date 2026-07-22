import { Link } from "react-router-dom";
import { Compass, Plus, Ticket } from "lucide-react";

export function Landing() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <span
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-navy-950 shadow-lg"
        style={{ backgroundImage: "linear-gradient(180deg, var(--color-gold-400), var(--color-gold-600))" }}
      >
        <Compass className="h-7 w-7" strokeWidth={2.25} />
      </span>
      <h1 className="mt-6 text-3xl font-bold text-slate-100">Luma Hunt</h1>
      <p className="mt-2 text-slate-400">Real-world treasure hunts powered by AI vision</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/create-hunt" className="glass rounded-2xl p-6 text-left transition-transform hover:-translate-y-0.5">
          <Plus className="h-6 w-6 text-gold-500" strokeWidth={2} />
          <h2 className="mt-2 font-semibold text-slate-100">Create a Hunt</h2>
          <p className="mt-1 text-sm text-slate-400">
            Design your own treasure hunt with custom locations on the map and AI-verified clues.
          </p>
        </Link>
        <Link to="/join" className="glass rounded-2xl p-6 text-left transition-transform hover:-translate-y-0.5">
          <Ticket className="h-6 w-6 text-explorer-400" strokeWidth={2} />
          <h2 className="mt-2 font-semibold text-slate-100">Join a Hunt</h2>
          <p className="mt-1 text-sm text-slate-400">
            Enter a 6-digit code shared by the hunt creator and start your adventure.
          </p>
        </Link>
      </div>
      <Link to="/explore" className="mt-8 inline-block text-sm font-medium text-sky-400">
        Or browse public hunts →
      </Link>
    </div>
  );
}
