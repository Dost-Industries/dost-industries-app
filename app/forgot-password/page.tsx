"use client";

import { useState } from "react";
import Link from "next/link";

import { resetPassword } from "../../firebase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleReset() {
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(email);

      setMessage(
        "If this email address exists, a password reset email has been sent."
      );
    } catch {
      setError(
        "Unable to send password reset email. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/20 bg-black/50 p-8 backdrop-blur-xl shadow-[0_0_60px_rgba(0,255,255,0.08)]">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-[0.25em]">
          RESET PASSWORD
        </h1>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-14 w-full rounded-xl border border-cyan-500/20 bg-black px-5 text-white outline-none transition focus:border-cyan-400"
        />

        {error && (
          <p className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-4 text-sm text-cyan-300">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="mt-6 h-14 w-full rounded-xl bg-cyan-500 font-bold tracking-[0.2em] text-black transition hover:bg-cyan-400 disabled:opacity-60"
        >
          {loading ? "SENDING..." : "SEND RESET EMAIL"}
        </button>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-cyan-300 transition hover:text-cyan-200"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}