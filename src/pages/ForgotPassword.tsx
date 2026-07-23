import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, MailCheck } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export function ForgotPassword() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await requestPasswordReset(email);
    setSubmitting(false);
    if (ok) setStep("reset");
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await resetPassword(resetToken, newPassword);
    setSubmitting(false);
    if (ok) navigate("/login");
  }

  if (step === "reset") {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
        <MailCheck className="h-8 w-8 text-gold-500" strokeWidth={1.75} />
        <h1 className="mt-3 text-2xl font-semibold text-slate-100">Check your email</h1>
        <p className="mt-1 text-sm text-slate-400">
          We sent a reset token to <span className="text-slate-200">{email}</span>. Paste it below with your new
          password.
        </p>
        <form onSubmit={handleReset} className="glass mt-6 space-y-4 rounded-2xl p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">Reset token</label>
            <input
              required
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              placeholder="Token from your email"
              className="input-glass"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">New password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="input-glass"
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            Set new password
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <KeyRound className="h-8 w-8 text-gold-500" strokeWidth={1.75} />
      <h1 className="mt-3 text-2xl font-semibold text-slate-100">Reset your password</h1>
      <p className="mt-1 text-sm text-slate-400">Enter your email and we'll send you a reset token.</p>
      <form onSubmit={handleRequest} className="glass mt-6 space-y-4 rounded-2xl p-5">
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
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          Send reset email
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        <Link to="/login" className="font-medium text-gold-400">
          ← Back to login
        </Link>
      </p>
    </div>
  );
}
