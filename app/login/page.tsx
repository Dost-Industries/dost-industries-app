"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  loginWithEmail,
  logoutUser,
  resendVerificationEmail,
} from "../../firebase/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationRequired, setVerificationRequired] =
    useState(false);
  const [showRegisterSuggestion, setShowRegisterSuggestion] =
    useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setVerificationRequired(false);
    setShowRegisterSuggestion(false);

    try {
      const user = await loginWithEmail(email.trim(), password);

      if (!user.emailVerified) {
        await logoutUser();

        setVerificationRequired(true);
        setError(
          "Please verify your email address before logging in."
        );

        return;
      }

      router.push("/");
    } catch {
      setError("Incorrect email address or password.");
      setShowRegisterSuggestion(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setLoading(true);

    try {
      await loginWithEmail(email.trim(), password);
      await resendVerificationEmail();
      await logoutUser();

      setError("");
      setVerificationRequired(false);

      alert("A new verification email has been sent.");
    } catch {
      alert("Unable to resend verification email.");
    } finally {
      setLoading(false);
    }
  }

  function goToRegister() {
    const registerUrl = email.trim()
      ? `/register?email=${encodeURIComponent(email.trim())}`
      : "/register";

    router.push(registerUrl);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-cyan-500/25 bg-black/60 p-8 shadow-[0_0_60px_rgba(0,255,255,0.10)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-cyan-400">
            DOST Industries
          </p>

          <h1 className="text-3xl font-bold tracking-[0.25em] text-white">
            LOGIN
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setShowRegisterSuggestion(false);
              }}
              autoComplete="email"
              required
              className="h-14 w-full rounded-xl border border-cyan-500/20 bg-black px-5 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
                setShowRegisterSuggestion(false);
              }}
              autoComplete="current-password"
              required
              className="h-14 w-full rounded-xl border border-cyan-500/20 bg-black px-5 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {verificationRequired && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full rounded-xl border border-cyan-500/30 py-3 text-sm font-bold uppercase tracking-[0.15em] text-cyan-300 transition hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Resend verification email
            </button>
          )}

          {showRegisterSuggestion && !verificationRequired && (
            <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4">
              <p className="mb-3 text-sm text-zinc-400">
                Does this account not exist yet?
              </p>

              <button
                type="button"
                onClick={goToRegister}
                className="w-full rounded-xl border border-cyan-400/40 bg-cyan-400/10 py-3 text-sm font-bold uppercase tracking-[0.18em] text-cyan-300 transition hover:bg-cyan-400/20"
              >
                Create account
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-14 w-full rounded-xl bg-cyan-500 font-bold tracking-[0.2em] text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <div className="mt-7 border-t border-cyan-500/15 pt-6 text-center">
          <p className="text-sm text-zinc-500">
            No account yet?
          </p>

          <button
            type="button"
            onClick={goToRegister}
            className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-300 transition hover:text-cyan-200"
          >
            Register
          </button>
        </div>
      </div>
    </main>
  );
}