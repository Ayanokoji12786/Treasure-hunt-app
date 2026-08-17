import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Ticket } from "lucide-react";
import { useHuntStore } from "../store/huntStore";

export function JoinHunt() {
  // Share links and QR codes point at /join?code=XXXXXX, so prefill from the URL.
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState((searchParams.get("code") ?? "").toUpperCase());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const getHuntByCode = useHuntStore((s) => s.getHuntByCode);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setError("Enter a hunt code to continue.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const hunt = await getHuntByCode(code);
      if (!hunt) {
        setError("No hunt found with that code.");
        return;
      }
      navigate(`/hunt/${hunt.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't look up that code. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <Link to="/" className="text-sm text-slate-400">
        ← Back
      </Link>
      <div
        className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl text-navy-950"
        style={{ backgroundImage: "linear-gradient(180deg, var(--color-gold-400), var(--color-gold-600))" }}
      >
        <Ticket className="h-6 w-6" strokeWidth={2.25} />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-slate-100">Join a Hunt</h1>
      <p className="mt-1 text-sm text-slate-400">
        Enter the code shared by the hunt creator to begin your adventure.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. TRAIL7"
          className="input-glass text-center text-sm font-semibold tracking-widest"
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          <Ticket className="h-4 w-4" strokeWidth={2} />
          {submitting ? "Searching…" : "Start Hunt"}
        </button>
      </form>
    </div>
  );
}
