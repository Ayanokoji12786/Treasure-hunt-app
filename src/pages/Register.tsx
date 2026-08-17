import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, MailCheck } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { GoogleButton } from "../components/GoogleButton";

export function Register() {
  const [step, setStep] = useState<"details" | "verify">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resent, setResent] = useState(false);
  const register = useAuthStore((s) => s.register);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const login = useAuthStore((s) => s.login);
  const setDisplayName = useAuthStore((s) => s.setDisplayName);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await register(email, password);
    setSubmitting(false);
    if (ok) setStep("verify");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const verified = await verifyOtp(email, otpCode);
      if (verified) {
        const loggedIn = await login(email, password);
        if (loggedIn) {
          // A failed display-name update shouldn't strand a user who is already logged in.
          if (name.trim()) await setDisplayName(name.trim()).catch(() => {});
          navigate("/explore");
          return;
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResent(false);
    const ok = await resendOtp(email);
    setResent(ok);
  }

  if (step === "verify") {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
        <MailCheck className="h-8 w-8 text-gold-500" strokeWidth={1.75} />
        <h1 className="mt-3 text-2xl font-semibold text-slate-100">Check your email</h1>
        <p className="mt-1 text-sm text-slate-400">
          We sent a verification code to <span className="text-slate-200">{email}</span>.
        </p>
        <form onSubmit={handleVerify} className="glass mt-6 space-y-4 rounded-2xl p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">Verification code</label>
            <input
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              className="input-glass text-center tracking-widest"
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            Verify & continue
          </button>
        </form>
        <button onClick={handleResend} className="mt-4 text-center text-sm font-medium text-sky-400">
          Resend code
        </button>
        {resent && <p className="mt-1 text-center text-xs text-explorer-400">Code resent — check your inbox.</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold text-slate-100">Create your account</h1>
      <p className="mt-1 text-sm text-slate-400">Start creating and playing treasure hunts</p>
      <div className="glass mt-6 space-y-4 rounded-2xl p-5">
        <GoogleButton />
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-white/10" />
          OR
          <div className="h-px flex-1 bg-white/10" />
        </div>
      </div>
      <form onSubmit={handleRegister} className="glass mt-4 space-y-4 rounded-2xl p-5">
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
