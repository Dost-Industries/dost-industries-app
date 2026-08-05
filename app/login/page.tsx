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
  const [verificationRequired, setVerificationRequired] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setVerificationRequired(false);

    try {
      const user = await loginWithEmail(email, password);

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
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    try {
      await loginWithEmail(email, password);

      await resendVerificationEmail();

      await logoutUser();

      setError("");

      alert("A new verification email has been sent.");
    } catch {
      alert("Unable to resend verification email.");
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/20 bg-black/50 p-8 backdrop-blur-xl">

        <h1 className="text-3xl font-bold text-white mb-8 tracking-[0.25em] text-center">
          LOGIN
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-14 rounded-xl bg-black border border-cyan-500/20 px-5 text-white outline-none focus:border-cyan-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-14 rounded-xl bg-black border border-cyan-500/20 px-5 text-white outline-none focus:border-cyan-400"
          />

          {error && (
            <p className="text-red-400 text-sm">
              {error}
            </p>
          )}

          {verificationRequired && (
            <button
              type="button"
              onClick={handleResendVerification}
              className="w-full rounded-xl border border-cyan-500/30 py-3 text-cyan-300 transition hover:bg-cyan-500/10"
            >
              RESEND VERIFICATION EMAIL
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-xl bg-cyan-500 text-black font-bold tracking-[0.2em] transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>

        </form>

      </div>
    </main>
  );
}