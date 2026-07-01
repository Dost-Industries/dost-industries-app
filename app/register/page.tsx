"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { registerWithEmail } from "../../firebase/auth";
import { createUserProfile } from "../../firebase/firestore";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const user = await registerWithEmail(email, password);

      await createUserProfile(
        user.uid,
        name,
        user.email ?? email
      );

      setMessage("Account created. Please check your email to verify your account.");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Could not create account. This email may already be in use.");
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/20 bg-black/50 p-8 backdrop-blur-xl shadow-[0_0_60px_rgba(0,255,255,0.08)]">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-[0.25em]">
          REGISTER
        </h1>

        <form onSubmit={handleRegister} className="space-y-5">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 w-full rounded-xl border border-cyan-500/20 bg-black px-5 text-white outline-none transition focus:border-cyan-400"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 w-full rounded-xl border border-cyan-500/20 bg-black px-5 text-white outline-none transition focus:border-cyan-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 w-full rounded-xl border border-cyan-500/20 bg-black px-5 text-white outline-none transition focus:border-cyan-400"
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-14 w-full rounded-xl border border-cyan-500/20 bg-black px-5 text-white outline-none transition focus:border-cyan-400"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-cyan-300">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="h-14 w-full rounded-xl bg-cyan-500 font-bold tracking-[0.2em] text-black transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>
      </div>
    </main>
  );
}