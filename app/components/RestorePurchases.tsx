"use client";

import {
  useState,
} from "react";

import {
  RefreshCw,
} from "lucide-react";

import {
  useAuth,
} from "../../hooks/useAuth";

type RestoreResponse = {
  restored?: boolean;
  message?: string;
  error?: string;
};

export default function RestorePurchases() {
  const { user } = useAuth();

  const [
    restoring,
    setRestoring,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  async function handleRestore() {
    if (
      !user ||
      restoring
    ) {
      return;
    }

    setRestoring(true);
    setMessage("");
    setError("");

    try {
      const idToken =
        await user.getIdToken();

      const response =
        await fetch(
          "/api/subscriptions/restore",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${idToken}`,
            },
          }
        );

      const data =
        (await response.json()) as RestoreResponse;

      if (!response.ok) {
        setError(
          data.error ??
            "Unable to restore purchases."
        );

        return;
      }

      setMessage(
        data.message ??
          "Restore completed."
      );
    } catch (restoreError) {
      console.error(
        "Restore purchases failed:",
        restoreError
      );

      setError(
        "Unable to restore purchases."
      );
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-cyan-400/25 bg-black/45 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
            Purchases
          </p>

          <h3 className="mt-3 text-xl font-semibold">
            Restore purchases
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Restore a previous DOST Premium
            purchase linked to your account.
          </p>
        </div>

        <RefreshCw
          size={24}
          className={
            restoring
              ? "shrink-0 animate-spin text-cyan-300"
              : "shrink-0 text-cyan-300"
          }
        />
      </div>

      <button
        type="button"
        onClick={() =>
          void handleRestore()
        }
        disabled={
          restoring ||
          !user
        }
        className="mt-5 w-full rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-300 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {restoring
          ? "Restoring..."
          : "Restore Purchases"}
      </button>

      {message && (
        <p className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-200">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}