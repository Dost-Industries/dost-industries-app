"use client";

import {
  CreditCard,
} from "lucide-react";

import {
  useAuth,
} from "../../hooks/useAuth";

function formatSubscriptionStatus(
  status: string | undefined
): string {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "CANCELED":
      return "Canceled";

    case "EXPIRED":
      return "Expired";

    case "INACTIVE":
      return "Inactive";

    default:
      return "No active subscription";
  }
}

export default function SubscriptionManagement() {
  const {
    profile,
  } = useAuth();

  const subscription =
    profile?.subscription ?? null;

  const status =
    formatSubscriptionStatus(
      subscription?.status
    );

  const isActive =
    subscription?.status === "ACTIVE";

  return (
    <div className="mt-6 rounded-2xl border border-cyan-400/25 bg-black/45 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
            Subscription
          </p>

          <h3 className="mt-3 text-xl font-semibold">
            DOST Premium
          </h3>
        </div>

        <CreditCard
          size={24}
          className="shrink-0 text-cyan-300"
        />
      </div>

      <div className="mt-5 rounded-xl border border-cyan-500/15 bg-cyan-400/5 p-4">
        <p className="text-[0.65rem] uppercase tracking-[0.22em] text-zinc-500">
          Status
        </p>

        <p
          className={`mt-2 text-lg font-semibold ${
            isActive
              ? "text-emerald-400"
              : "text-zinc-300"
          }`}
        >
          {status}
        </p>
      </div>

      {subscription && (
        <div className="mt-3 rounded-xl border border-cyan-500/15 bg-black/30 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.22em] text-zinc-500">
            Plan
          </p>

          <p className="mt-2 text-sm text-white">
            {subscription.id ===
            "dost-premium"
              ? "DOST Premium"
              : subscription.id}
          </p>
        </div>
      )}

      <p className="mt-4 text-sm leading-relaxed text-zinc-500">
        Subscription changes are verified
        server-side. Access cannot be changed
        from the browser.
      </p>
    </div>
  );
}