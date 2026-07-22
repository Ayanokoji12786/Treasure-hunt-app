import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const register = useAuthStore((s) => s.register);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await register(name, email, password);
    setSubmitting(false);
    if (ok) navigate("/explore");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold text-slate-100">Create your account</h1>
      <p className="mt-1 text-sm text-slate-400">Start creating and playing treasure hunts</p>
      <form onSubmit={handleSubmit} className="glass mt-6 space-y-4 rounded-2xl p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-200">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="input-glass"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-200">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-glass"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-200">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="input-glass"
          />
        </div>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          <UserPlus className="h-4 w-4" strokeWidth={2} />
          Create account
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-gold-400">
          Log in
        </Link>
      </p>
    </div>
  );
}
