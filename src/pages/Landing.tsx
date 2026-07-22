import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-3xl text-white mx-auto">
        🧭
      </span>
      <h1 className="mt-6 text-3xl font-bold">TrailQuest</h1>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        Real-world treasure hunts powered by AI vision
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          to="/create-hunt"
          className="rounded-2xl border border-sand-200 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <span className="text-2xl">➕</span>
          <h2 className="mt-2 font-semibold">Create a Hunt</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Design your own treasure hunt with custom locations on the map and AI-verified clues.
          </p>
        </Link>
        <Link
          to="/join"
          className="rounded-2xl border border-sand-200 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <span className="text-2xl">🎟️</span>
          <h2 className="mt-2 font-semibold">Join a Hunt</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Enter a 6-digit code shared by the hunt creator and start your adventure.
          </p>
        </Link>
      </div>
      <Link to="/explore" className="mt-8 inline-block text-sm font-medium text-brand-600">
        Or browse public hunts →
      </Link>
    </div>
  );
}
