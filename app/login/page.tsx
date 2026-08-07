"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  loginWithEmail,
  logoutUser,
  resendVerificationEmail,
} from "../../firebase/auth";

import { ERROR_MESSAGES } from "../../lib/errors/errorMessages";
import { mapFirebaseError } from "../../lib/errors/firebaseErrorMapper";

type RateLimitResponse = {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
};

type RateLimitAction = "check" | "failure" | "success";

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

  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  const isRateLimited = rateLimitSeconds > 0;

  useEffect(() => {
    if (rateLimitSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRateLimitSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [rateLimitSeconds]);

  function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
  }

  async function callRateLimiter(
    action: RateLimitAction,
    identifier: string,
    idToken?: string
  ): Promise<RateLimitResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (idToken) {
      headers.Authorization = `Bearer ${idToken}`;
    }

    const response = await fetch("/api/security/login-attempts", {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({
        action,
        identifier,
      }),
    });

    if (!response.ok) {
      throw new Error("RATE_LIMIT_SERVICE_ERROR");
    }

    return (await response.json()) as RateLimitResponse;
  }

  async function checkRateLimit(identifier: string) {
    const result = await callRateLimiter(
      "check",
      identifier
    );

    if (!result.allowed) {
      setRateLimitSeconds(result.retryAfterSeconds);

      setError(
        `Too many login attempts. Try again in ${result.retryAfterSeconds} seconds.`
      );

      return false;
    }

    return true;
  }

  async function registerFailedLogin(identifier: string) {
    try {
      const result = await callRateLimiter(
        "failure",
        identifier
      );

      if (!result.allowed && result.retryAfterSeconds > 0) {
        setRateLimitSeconds(result.retryAfterSeconds);

        setError(
          `Too many login attempts. Try again in ${result.retryAfterSeconds} seconds.`
        );

        return true;
      }
    } catch {
      // Keep the original authentication error visible.
    }

    return false;
  }

  async function clearFailedLogins(
    identifier: string,
    idToken: string
  ) {
    try {
      await callRateLimiter(
        "success",
        identifier,
        idToken
      );
    } catch {
      // Successful authentication must not fail because
      // rate-limit cleanup is temporarily unavailable.
    }
  }

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading || isRateLimited) {
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    setLoading(true);
    setError("");
    setVerificationRequired(false);
    setShowRegisterSuggestion(false);

    try {
      const allowed = await checkRateLimit(
        normalizedEmail
      );

      if (!allowed) {
        return;
      }

      const user = await loginWithEmail(
        normalizedEmail,
        password
      );

      const idToken = await user.getIdToken();

      await clearFailedLogins(
        normalizedEmail,
        idToken
      );

      if (!user.emailVerified) {
        await logoutUser();

        setVerificationRequired(true);
        setError(ERROR_MESSAGES.EMAIL_NOT_VERIFIED);

        return;
      }

      router.push("/");
    } catch (caughtError) {
      const blocked = await registerFailedLogin(
        normalizedEmail
      );

      if (!blocked) {
        setError(mapFirebaseError(caughtError));
      }

      setShowRegisterSuggestion(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (loading || isRateLimited) {
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    setLoading(true);
    setError("");
    setShowRegisterSuggestion(false);

    try {
      const allowed = await checkRateLimit(
        normalizedEmail
      );

      if (!allowed) {
        return;
      }

      const user = await loginWithEmail(
        normalizedEmail,
        password
      );

      const idToken = await user.getIdToken();

      await clearFailedLogins(
        normalizedEmail,
        idToken
      );

      await resendVerificationEmail();
      await logoutUser();

      setVerificationRequired(false);

      alert("A new verification email has been sent.");
    } catch (caughtError) {
      const blocked = await registerFailedLogin(
        normalizedEmail
      );

      if (!blocked) {
        setError(mapFirebaseError(caughtError));
      }
    } finally {
      setLoading(false);
    }
  }

  function goToRegister() {
    const normalizedEmail = normalizeEmail(email);

    const registerUrl = normalizedEmail
      ? `/register?email=${encodeURIComponent(normalizedEmail)}`
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
              disabled={loading}
              className="h-14 w-full rounded-xl border border-cyan-500/20 bg-black px-5 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
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
              disabled={loading}
              className="h-14 w-full rounded-xl border border-cyan-500/20 bg-black px-5 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {isRateLimited && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-sm font-medium text-amber-300">
                Login temporarily blocked. Try again in{" "}
                {rateLimitSeconds} seconds.
              </p>
            </div>
          )}

          {error && !isRateLimited && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4">
              <p className="text-sm text-red-300">
                {error}
              </p>
            </div>
          )}

          {verificationRequired && !isRateLimited && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full rounded-xl border border-cyan-500/30 py-3 text-sm font-bold uppercase tracking-[0.15em] text-cyan-300 transition hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Resend verification email
            </button>
          )}

          {showRegisterSuggestion &&
            !verificationRequired &&
            !isRateLimited && (
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
            disabled={loading || isRateLimited}
            className="h-14 w-full rounded-xl bg-cyan-500 font-bold tracking-[0.2em] text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRateLimited
              ? `TRY AGAIN IN ${rateLimitSeconds}s`
              : loading
                ? "LOGGING IN..."
                : "LOGIN"}
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