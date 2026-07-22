import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) navigate("/explore");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold text-slate-100">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-400">Log in to your account</p>
      <form onSubmit={handleSubmit} className="glass mt-6 space-y-4 rounded-2xl p-5">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-glass"
          />
        </div>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          <LogIn className="h-4 w-4" strokeWidth={2} />
          Log in
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-gold-400">
          Create one
        </Link>
      </p>
    </div>
  );
}
