"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Loader2,
  TriangleAlert,
  X,
} from "lucide-react";

import {
  useAuth,
} from "../../hooks/useAuth";

type SubscriptionServerState = {
  linked: boolean;
  product: string | null;
  providerStatus: string | null;
  accessStatus: string | null;
  cancelAtPeriodEnd: boolean;
  accessContinues: boolean;
  accessUntil: string | null;
};

type CancelSubscriptionResult = {
  cancelled?: boolean;
  provider?: string;
  product?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  accessContinues?: boolean;
  accessStatus?: string;
  accessUntil?: string | null;
  error?: string;
  code?: string;
};

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

function formatAccessDate(
  value: string | null
): string | null {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

export default function SubscriptionManagement() {
  const {
    user,
    profile,
    refreshProfileAccess,
  } = useAuth();

  const [
    serverState,
    setServerState,
  ] = useState<SubscriptionServerState | null>(null);

  const [
    serverStateUserId,
    setServerStateUserId,
  ] = useState<string | null>(null);

  const [
    statusLoading,
    setStatusLoading,
  ] = useState(false);

  const [
    statusError,
    setStatusError,
  ] = useState("");

  const [
    showCancelDialog,
    setShowCancelDialog,
  ] = useState(false);

  const [
    cancelling,
    setCancelling,
  ] = useState(false);

  const [
    cancelError,
    setCancelError,
  ] = useState("");

  const currentServerState =
    user &&
    serverStateUserId === user.uid
      ? serverState
      : null;

  const subscription =
    profile?.subscription ?? null;

  const status =
    formatSubscriptionStatus(
      subscription?.status
    );

  const isActive =
    subscription?.status === "ACTIVE";

  const cancellationScheduled =
    currentServerState?.cancelAtPeriodEnd ===
    true;

  const accessUntil =
    formatAccessDate(
      currentServerState?.accessUntil ?? null
    );

  useEffect(() => {
    if (!user) {
      return;
    }

    const currentUser = user;

    let active = true;

    async function loadSubscriptionState() {
      setStatusLoading(true);
      setStatusError("");

      try {
        const idToken =
          await currentUser.getIdToken();

        const response =
          await fetch(
            "/api/subscriptions/mollie/cancel",
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${idToken}`,
              },
              cache: "no-store",
            }
          );

        const data =
          (await response.json()) as
            | SubscriptionServerState
            | {
                error?: string;
              };

        if (!response.ok) {
          throw new Error(
            "error" in data &&
              data.error
              ? data.error
              : "Subscription status could not be loaded."
          );
        }

        if (active) {
          setServerState(
            data as SubscriptionServerState
          );

          setServerStateUserId(
            currentUser.uid
          );
        }
      } catch (error) {
        console.error(
          "Subscription status load failed:",
          error instanceof Error
            ? error.name
            : "UnknownError"
        );

        if (active) {
          setStatusError(
            "Subscription details could not be loaded."
          );
        }
      } finally {
        if (active) {
          setStatusLoading(false);
        }
      }
    }

    void loadSubscriptionState();

    return () => {
      active = false;
    };
  }, [user]);

  function openCancelDialog() {
    if (
      cancelling ||
      cancellationScheduled
    ) {
      return;
    }

    setCancelError("");
    setShowCancelDialog(true);
  }

  function closeCancelDialog() {
    if (cancelling) {
      return;
    }

    setCancelError("");
    setShowCancelDialog(false);
  }

  async function handleCancelSubscription() {
    if (
      !user ||
      cancelling ||
      cancellationScheduled
    ) {
      return;
    }

    setCancelling(true);
    setCancelError("");

    try {
      const idToken =
        await user.getIdToken(true);

      const response =
        await fetch(
          "/api/subscriptions/mollie/cancel",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${idToken}`,
            },
            cache: "no-store",
          }
        );

      const data =
        (await response.json()) as
          CancelSubscriptionResult;

      if (!response.ok) {
        throw new Error(
          data.code ||
            data.error ||
            "PREMIUM_CANCELLATION_FAILED"
        );
      }

      if (!data.cancelled) {
        throw new Error(
          "PREMIUM_CANCELLATION_FAILED"
        );
      }

      setServerState(
        (current) => ({
          linked:
            current?.linked ?? true,
          product:
            current?.product ??
            "dost-premium-monthly",
          providerStatus:
            data.subscriptionStatus ??
            "canceled",
          accessStatus:
            data.accessStatus ??
            (data.accessContinues
              ? "ACTIVE"
              : "CANCELED"),
          cancelAtPeriodEnd:
            Boolean(
              data.accessContinues
            ),
          accessContinues:
            Boolean(
              data.accessContinues
            ),
          accessUntil:
            data.accessUntil ?? null,
        })
      );

      /*
       * The cancellation endpoint has now updated
       * the authoritative billing/subscription
       * state. Refresh AuthContext once so the
       * centralized profile lifecycle can return
       * premiumExpiryAt and arm the single expiry
       * timer for this already-open session.
       */
      await refreshProfileAccess();

      setShowCancelDialog(false);
    } catch (error) {
      console.error(
        "DOST Premium cancellation failed:",
        error instanceof Error
          ? error.name
          : "UnknownError"
      );

      setCancelError(
        "DOST Premium could not be canceled. No changes were made. Please try again."
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
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

          {cancellationScheduled &&
            accessUntil && (
              <div className="mt-3 flex items-start gap-2 border-t border-cyan-500/10 pt-3">
                <CalendarClock
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-300"
                />

                <div>
                  <p className="text-sm font-medium text-amber-200">
                    Cancellation scheduled
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    Premium remains active through {accessUntil}. It will not renew after that date.
                  </p>
                </div>
              </div>
            )}
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

        {statusLoading && (
          <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
            <Loader2
              size={15}
              className="animate-spin"
            />
            Loading subscription details...
          </div>
        )}

        {statusError && (
          <p className="mt-4 text-sm text-amber-300">
            {statusError}
          </p>
        )}

        {isActive &&
          !statusLoading &&
          !cancellationScheduled &&
          currentServerState?.linked && (
            <div className="mt-5 border-t border-cyan-500/10 pt-5">
              <button
                type="button"
                onClick={openCancelDialog}
                className="w-full rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm font-semibold text-red-300 transition hover:border-red-400/50 hover:bg-red-500/10"
              >
                Cancel DOST Premium
              </button>

              <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                Canceling stops future renewals. Premium access remains available for the period already paid for.
              </p>
            </div>
          )}

        {cancellationScheduled && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-emerald-400"
            />

            <p className="text-sm leading-relaxed text-zinc-400">
              Future renewal has been canceled. Your current Premium access remains available until the paid period ends.
            </p>
          </div>
        )}

        <p className="mt-4 text-sm leading-relaxed text-zinc-500">
          Subscription changes are verified server-side. Access cannot be changed from the browser.
        </p>
      </div>

      {showCancelDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-premium-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-zinc-950 p-5 shadow-2xl shadow-black/70 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 text-red-300">
                  <TriangleAlert
                    size={20}
                  />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-red-300">
                    Subscription
                  </p>

                  <h4
                    id="cancel-premium-title"
                    className="mt-2 text-lg font-semibold text-white"
                  >
                    Cancel DOST Premium?
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={closeCancelDialog}
                disabled={cancelling}
                aria-label="Close cancellation dialog"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/35 p-4">
              <p className="text-sm leading-relaxed text-zinc-300">
                Future monthly renewals will stop. You will keep DOST Premium for the remainder of the period you have already paid for.
              </p>
            </div>

            {cancelError && (
              <p className="mt-4 text-sm leading-relaxed text-red-300">
                {cancelError}
              </p>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={closeCancelDialog}
                disabled={cancelling}
                className="rounded-xl border border-cyan-500/20 bg-cyan-400/5 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Keep Premium
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleCancelSubscription()
                }
                disabled={cancelling}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling && (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                )}

                {cancelling
                  ? "Canceling..."
                  : "Confirm cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
