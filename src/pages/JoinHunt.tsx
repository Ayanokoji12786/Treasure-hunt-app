import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHuntStore } from "../store/huntStore";

export function JoinHunt() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const getHuntByCode = useHuntStore((s) => s.getHuntByCode);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const hunt = getHuntByCode(code);
    if (!hunt) {
      setError("No hunt found with that code.");
      return;
    }
    navigate(`/hunt/${hunt.id}`);
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <Link to="/" className="text-sm text-neutral-500 dark:text-neutral-400">
        ← Back
      </Link>
      <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-2xl dark:bg-amber-900/40">
        🎟️
      </div>
      <h1 className="mt-4 text-2xl font-bold">Join a Hunt</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Enter the code shared by the hunt creator to begin your adventure.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. TRAIL7"
          className="w-full rounded-lg border border-sand-200 bg-white px-4 py-3 text-center text-sm font-semibold tracking-widest dark:border-neutral-700 dark:bg-neutral-900"
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          🎟️ Start Hunt
        </button>
      </form>
    </div>
  );
}
