"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { FirebaseError } from "firebase/app";

import {
  ArrowUpRight,
  Clock3,
  Home,
  Trash2,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  logoutUser,
  reauthenticateCurrentUser,
} from "../../firebase/auth";

import {
  deleteCalculation,
  getCalculations,
  type CalculationRecord,
} from "../../firebase/calculations";

import { useAuth } from "../../hooks/useAuth";

import {
  startPayment,
  validatePayment,
} from "../../lib/payments/client";

import {
  clearPendingPayment,
  getPendingPayment,
  savePendingPayment,
} from "../../lib/payments/pendingPayment";

import RestorePurchases from "../components/RestorePurchases";

import SubscriptionManagement from "../components/SubscriptionManagement";

import {
  ENTITLEMENTS,
  hasEntitlement,
} from "../../lib/entitlements";

import {
  hasActiveDostPremiumSubscription,
} from "../../lib/subscription-status";

type PdfAccessState = {
  canExport: boolean;
  accessMode:
    | "premium"
    | "credit"
    | "none";
  premium: boolean;
  availableCredits: number;
};

export default function AccountPage() {
  const router = useRouter();

  const {
    user,
    profile,
    loading,
    isAuthenticated,
    isVerified,
  } = useAuth();

  const [
    showDeleteDialog,
    setShowDeleteDialog,
  ] = useState(false);

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmation,
    setConfirmation,
  ] = useState("");

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const [
    calculations,
    setCalculations,
  ] = useState<CalculationRecord[]>([]);

  const [
    calculationsLoading,
    setCalculationsLoading,
  ] = useState(false);

  const [
    calculationsError,
    setCalculationsError,
  ] = useState("");

  const [
    deletingCalculationId,
    setDeletingCalculationId,
  ] = useState<string | null>(null);

  const [
    testPaymentStarting,
    setTestPaymentStarting,
  ] = useState(false);

  const [
    testPaymentError,
    setTestPaymentError,
  ] = useState("");

  const [
    testPaymentProcessing,
    setTestPaymentProcessing,
  ] = useState(false);

  const [
    testPaymentSuccess,
    setTestPaymentSuccess,
  ] = useState("");

  const [
    pdfAccess,
    setPdfAccess,
  ] = useState<PdfAccessState | null>(null);

  const [
    pdfAccessLoading,
    setPdfAccessLoading,
  ] = useState(false);

  const [
    pdfAccessError,
    setPdfAccessError,
  ] = useState("");

  const [
    pdfAccessRefreshKey,
    setPdfAccessRefreshKey,
  ] = useState(0);

  const [
    premiumCheckoutStarting,
    setPremiumCheckoutStarting,
  ] = useState(false);

  const [
    premiumCheckoutError,
    setPremiumCheckoutError,
  ] = useState("");

  const [
    premiumReturnProcessing,
    setPremiumReturnProcessing,
  ] = useState(false);

  const paymentReturnStartedRef =
    useRef(false);

  const premiumReturnStartedRef =
    useRef(false);

  const hasSaveCalculations =
    hasEntitlement(
      profile?.entitlements,
      ENTITLEMENTS.SAVE_CALCULATIONS
    );

  const hasPremiumAccess =
    hasActiveDostPremiumSubscription(
      profile?.subscription
    );

  useEffect(() => {
    if (loading) {
      return;
    }

    if (
      !user ||
      !isAuthenticated ||
      !isVerified ||
      !user.emailVerified
    ) {
      router.replace("/login");
    }
  }, [
    loading,
    user,
    isAuthenticated,
    isVerified,
    router,
  ]);

  useEffect(() => {
    if (
      loading ||
      !user ||
      !isAuthenticated ||
      !isVerified ||
      !user.emailVerified
    ) {
      return;
    }

    let active = true;

    async function loadPdfAccess() {
      setPdfAccessLoading(true);
      setPdfAccessError("");

      try {
        const idToken =
          await user!.getIdToken();

        const response =
          await fetch(
            "/api/account/pdf-access",
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${idToken}`,
              },
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "PDF_ACCESS_REQUEST_FAILED"
          );
        }

        const data =
          (await response.json()) as PdfAccessState;

        if (active) {
          setPdfAccess(data);
        }
      } catch (error) {
        console.error(
          "Failed to load PDF export access:",
          error
        );

        if (active) {
          setPdfAccess(null);
          setPdfAccessError(
            "PDF export balance could not be loaded."
          );
        }
      } finally {
        if (active) {
          setPdfAccessLoading(false);
        }
      }
    }

    void loadPdfAccess();

    return () => {
      active = false;
    };
  }, [
    loading,
    user,
    isAuthenticated,
    isVerified,
    pdfAccessRefreshKey,
  ]);

  useEffect(() => {
    if (
      loading ||
      !user ||
      !hasSaveCalculations
    ) {
      return;
    }

    let active = true;

    async function loadCalculations() {
      setCalculationsLoading(true);
      setCalculationsError("");

      try {
        const savedCalculations =
          await getCalculations(
            user!.uid
          );

        if (active) {
          setCalculations(
            savedCalculations
          );
        }
      } catch (error) {
        console.error(
          "Failed to load saved calculations:",
          error
        );

        if (active) {
          setCalculationsError(
            "Saved calculations could not be loaded."
          );
        }
      } finally {
        if (active) {
          setCalculationsLoading(false);
        }
      }
    }

    void loadCalculations();

    return () => {
      active = false;
    };
  }, [
    loading,
    user,
    hasSaveCalculations,
  ]);

  useEffect(() => {
    if (
      loading ||
      !user ||
      !isAuthenticated ||
      !isVerified ||
      !user.emailVerified ||
      paymentReturnStartedRef.current
    ) {
      return;
    }

    const pendingPayment =
      getPendingPayment();

    if (!pendingPayment) {
      return;
    }

    const paymentToValidate =
      pendingPayment;

    paymentReturnStartedRef.current = true;

    let active = true;

    async function processReturnedPayment() {
      setTestPaymentProcessing(true);
      setTestPaymentError("");
      setTestPaymentSuccess("");

      try {
        const idToken =
          await user!.getIdToken(true);

        const result =
          await validatePayment({
            idToken,
            provider:
              paymentToValidate.provider,
            paymentMethod:
              paymentToValidate.paymentMethod,
            product:
              paymentToValidate.product,
            providerPurchaseId:
              paymentToValidate.providerPurchaseId,
          });

        if (!active) {
          return;
        }

        clearPendingPayment();

        setPdfAccessRefreshKey(
          (current) => current + 1
        );

        if (result.processed) {
          setTestPaymentSuccess(
            result.pdfExportCreditsGranted === 1
              ? "Payment verified. 1 Professional PDF Export credit has been added."
              : "Payment verified successfully."
          );
        } else {
          setTestPaymentSuccess(
            "This payment was already processed."
          );
        }
      } catch (error) {
        console.error(
          "Returned Mollie payment could not be processed:",
          error
        );

        if (active) {
          clearPendingPayment();

          setTestPaymentError(
            "The returned Mollie payment could not be verified."
          );
        }
      } finally {
        if (active) {
          setTestPaymentProcessing(false);
        }
      }
    }

    void processReturnedPayment();

    return () => {
      active = false;
    };
  }, [
    loading,
    user,
    isAuthenticated,
    isVerified,
  ]);

  useEffect(() => {
    if (
      loading ||
      !user ||
      !isAuthenticated ||
      !isVerified ||
      !user.emailVerified ||
      hasPremiumAccess ||
      premiumReturnStartedRef.current
    ) {
      return;
    }

    const searchParams =
      new URLSearchParams(
        window.location.search
      );

    if (
      searchParams.get(
        "premiumReturn"
      ) !== "1"
    ) {
      return;
    }

    premiumReturnStartedRef.current = true;

    async function processPremiumReturn() {
      setPremiumReturnProcessing(true);
      setPremiumCheckoutError("");

      try {
        const idToken =
          await user!.getIdToken(true);

        const validateResponse =
          await fetch(
            "/api/subscriptions/mollie/validate",
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${idToken}`,
              },

              cache: "no-store",
            }
          );

        const validateData =
          (await validateResponse.json()) as {
            validated?: boolean;
            error?: string;
            code?: string;
            paymentStatus?: string;
          };

        if (!validateResponse.ok) {
          if (
            validateData.code ===
            "PREMIUM_PAYMENT_NOT_PAID"
          ) {
            throw new Error(
              "PREMIUM_PAYMENT_NOT_PAID"
            );
          }

          throw new Error(
            validateData.code ||
              "PREMIUM_VALIDATION_FAILED"
          );
        }

        if (!validateData.validated) {
          throw new Error(
            "PREMIUM_VALIDATION_FAILED"
          );
        }

        const activateResponse =
          await fetch(
            "/api/subscriptions/mollie/activate",
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${idToken}`,
              },

              cache: "no-store",
            }
          );

        const activateData =
          (await activateResponse.json()) as {
            activated?: boolean;
            error?: string;
            code?: string;
          };

        if (!activateResponse.ok) {
          throw new Error(
            activateData.code ||
              "PREMIUM_ACTIVATION_FAILED"
          );
        }

        if (!activateData.activated) {
          throw new Error(
            "PREMIUM_ACTIVATION_FAILED"
          );
        }

        /*
         * AuthContext loads the Firestore
         * profile during app startup.
         *
         * A full navigation guarantees
         * the freshly activated
         * subscription + entitlements are
         * loaded before Account renders
         * the Premium state.
         */
        window.location.replace(
          "/account?premium=active"
        );
      } catch (error) {
        console.error(
          "DOST Premium return could not be processed:",
          error
        );

        const errorCode =
          error instanceof Error
            ? error.message
            : "";

        setPremiumCheckoutError(
          errorCode ===
            "PREMIUM_PAYMENT_NOT_PAID"
            ? "DOST Premium payment was not completed."
            : "DOST Premium could not be activated. Please try again."
        );

        /*
         * Remove only the browser return
         * marker. Server-side pending
         * billing data remains available
         * for recovery/retry.
         */
        window.history.replaceState(
          null,
          "",
          "/account"
        );

        premiumReturnStartedRef.current =
          false;

        setPremiumReturnProcessing(false);
      }
    }

    void processPremiumReturn();
  }, [
    loading,
    user,
    isAuthenticated,
    isVerified,
    hasPremiumAccess,
  ]);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await logoutUser();

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );

      setLoggingOut(false);
    }
  }

  function openDeleteDialog() {
    if (deleting) {
      return;
    }

    setPassword("");
    setConfirmation("");
    setDeleteError("");
    setShowDeleteDialog(true);
  }

  function closeDeleteDialog() {
    if (deleting) {
      return;
    }

    setShowDeleteDialog(false);
    setPassword("");
    setConfirmation("");
    setDeleteError("");
  }

  async function handleDeleteAccount() {
    if (
      deleting ||
      !user ||
      !user.emailVerified ||
      confirmation !== "DELETE" ||
      password.length === 0
    ) {
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      await reauthenticateCurrentUser(
        password
      );

      const idToken =
        await user.getIdToken(true);

      const response =
        await fetch(
          "/api/account/delete",
          {
            method: "DELETE",
            headers: {
              Authorization:
                `Bearer ${idToken}`,
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          "Account deletion failed."
        );
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
            setDeleteError(
              "The password is incorrect."
            );
            break;

          case "auth/too-many-requests":
            setDeleteError(
              "Too many attempts. Wait a moment and try again."
            );
            break;

          case "auth/requires-recent-login":
            setDeleteError(
              "Please log out, log in again and retry the deletion."
            );
            break;

          default:
            setDeleteError(
              "The account could not be deleted. Please try again."
            );
        }
      } else {
        setDeleteError(
          "The account could not be deleted. Please try again."
        );
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteCalculation(
    calculationId: string
  ) {
    if (
      !user ||
      !hasSaveCalculations ||
      deletingCalculationId
    ) {
      return;
    }

    setDeletingCalculationId(
      calculationId
    );

    setCalculationsError("");

    try {
      await deleteCalculation(
        user.uid,
        calculationId
      );

      setCalculations(
        (current) =>
          current.filter(
            (calculation) =>
              calculation.id !==
              calculationId
          )
      );
    } catch (error) {
      console.error(
        "Failed to delete saved calculation:",
        error
      );

      setCalculationsError(
        "Calculation could not be deleted."
      );
    } finally {
      setDeletingCalculationId(
        null
      );
    }
  }

  async function handleStartPremiumCheckout() {
    if (
      premiumCheckoutStarting ||
      premiumReturnProcessing ||
      !user ||
      hasPremiumAccess
    ) {
      return;
    }

    setPremiumCheckoutStarting(true);
    setPremiumCheckoutError("");

    try {
      const idToken =
        await user.getIdToken(true);

      const response =
        await fetch(
          "/api/subscriptions/mollie/create",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${idToken}`,
            },
          }
        );

      const data =
        (await response.json()) as {
          checkoutUrl?: string;
          error?: string;
          code?: string;
        };

      if (!response.ok) {
        if (
          data.code ===
          "PREMIUM_ALREADY_ACTIVE"
        ) {
          router.refresh();

          throw new Error(
            "DOST Premium is already active."
          );
        }

        throw new Error(
          data.error ||
            "Unable to start DOST Premium checkout."
        );
      }

      if (!data.checkoutUrl) {
        throw new Error(
          "MOLLIE_CHECKOUT_URL_MISSING"
        );
      }

      window.location.assign(
        data.checkoutUrl
      );
    } catch (error) {
      console.error(
        "DOST Premium checkout could not be started:",
        error
      );

      setPremiumCheckoutError(
        error instanceof Error &&
          error.message ===
            "DOST Premium is already active."
          ? error.message
          : "DOST Premium checkout could not be started."
      );

      setPremiumCheckoutStarting(false);
    }
  }

  async function handleTestPdfPayment() {
    if (
      testPaymentStarting ||
      !user
    ) {
      return;
    }

    setTestPaymentStarting(true);
    setTestPaymentError("");

    try {
      const idToken =
        await user.getIdToken(true);

      const payment =
        await startPayment({
          idToken,
          provider: "mollie",
          paymentMethod: "ideal",
          product:
            "professional-pdf-export",
        });

      if (!payment.checkoutUrl) {
        throw new Error(
          "PAYMENT_CHECKOUT_URL_MISSING"
        );
      }

      savePendingPayment({
        provider: "mollie",
        paymentMethod: "ideal",
        product:
          "professional-pdf-export",
        providerPurchaseId:
          payment.providerPurchaseId,
      });

      window.location.assign(
        payment.checkoutUrl
      );
    } catch (error) {
      console.error(
        "Mollie test payment could not be started:",
        error
      );

      setTestPaymentError(
        "The Mollie test payment could not be started."
      );

      setTestPaymentStarting(false);
    }
  }

  function formatDate(
    value: unknown
  ): string {
    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof (
        value as {
          toDate?: unknown;
        }
      ).toDate === "function"
    ) {
      const date = (
        value as {
          toDate: () => Date;
        }
      ).toDate();

      return date.toLocaleString();
    }

    return "";
  }

  const deletionConfirmed =
    confirmation === "DELETE" &&
    password.length > 0;

  if (
    loading ||
    !user ||
    !isAuthenticated ||
    !isVerified ||
    !user.emailVerified
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-cyan-300">
        Loading account...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="absolute left-1/2 top-[-280px] h-[850px] w-[850px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-[-220px] right-[-160px] h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <header className="relative mb-8 flex min-h-14 items-center justify-center text-center sm:mb-10 sm:min-h-16">
          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            aria-label="Go to DOST Industries home"
            title="Home"
            className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/30 bg-black/40 text-cyan-300 transition-all hover:border-cyan-300/70 hover:bg-cyan-400/10 hover:shadow-[0_0_22px_rgba(0,255,255,0.12)] sm:h-12 sm:w-12"
          >
            <Home size={19} />
          </button>

          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-[0.24em] sm:text-4xl sm:tracking-[0.35em]">
            <span className="text-white">
              DOST
            </span>{" "}
            <span className="text-cyan-400 drop-shadow-[0_0_18px_rgba(0,255,255,0.65)]">
              INDUSTRIES
            </span>
            </h1>

            <p className="mt-2 text-[0.62rem] uppercase tracking-[0.38em] text-zinc-500 sm:text-xs">
              Account Hub
            </p>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[28px] border border-cyan-500/25 bg-black/55 p-5 shadow-[0_0_60px_rgba(0,255,255,0.10)] backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.08),transparent_58%)]" />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
                  My Account
                </p>

                <h2 className="mt-3 truncate text-2xl font-semibold sm:text-3xl">
                  {profile?.name ||
                    user.email}
                </h2>

                <p className="mt-2 truncate text-sm text-zinc-400 sm:text-base">
                  {user.email}
                </p>
              </div>

              <button
                type="button"
                onClick={openDeleteDialog}
                disabled={
                  deleting ||
                  loggingOut
                }
                className="shrink-0 rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-3 py-2 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-cyan-300 transition hover:border-cyan-400/60 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-[0.65rem] sm:tracking-[0.22em]"
              >
                Delete Account
              </button>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-400/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  Access
                </p>

                <p className="mt-2 text-2xl font-semibold text-cyan-300">
                  {hasPremiumAccess
                    ? "DOST PREMIUM"
                    : "FREE"}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-400/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  Available Tool
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/")
                  }
                  className="group mt-2 inline-flex items-center gap-2 text-left text-2xl font-semibold text-cyan-300 transition hover:text-cyan-200"
                >
                  <span className="border-b border-transparent transition group-hover:border-cyan-300/60">
                    Heat Input
                  </span>

                  <ArrowUpRight
                    size={18}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </button>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-400/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  PDF Exports
                </p>

                <p className="mt-2 text-2xl font-semibold text-cyan-300">
                  {pdfAccessLoading
                    ? "LOADING..."
                    : pdfAccess?.premium
                      ? "UNLIMITED"
                      : `${pdfAccess?.availableCredits ?? 0} AVAILABLE`}
                </p>

                {!pdfAccessLoading &&
  pdfAccess && (
    <p className="mt-2 text-xs text-zinc-500">
      {pdfAccess.premium
        ? `${pdfAccess.availableCredits} purchased credits preserved`
        : "Purchased PDF export credits"}
    </p>
  )}
              </div>
            </div>

            {pdfAccessError && (
              <p className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {pdfAccessError}
              </p>
            )}

            {!hasPremiumAccess && (
              <div className="mt-6 rounded-2xl border border-cyan-400/25 bg-black/45 p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
                  DOST Premium
                </p>

                <h3 className="mt-3 text-xl font-semibold">
                  Unlock your professional
                  workspace
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Remove advertisements,
                  save calculations and export
                  professional PDF reports.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void handleStartPremiumCheckout()
                  }
                  disabled={
                    premiumCheckoutStarting ||
                    premiumReturnProcessing
                  }
                  className="mt-5 w-full rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-cyan-300 transition hover:border-cyan-300/70 hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {premiumReturnProcessing
                    ? "Activating DOST Premium..."
                    : premiumCheckoutStarting
                      ? "Opening Mollie..."
                      : "Upgrade to DOST Premium — €4.99/month"}
                </button>

                {premiumCheckoutError && (
                  <p className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {premiumCheckoutError}
                  </p>
                )}
              </div>
            )}

            {!hasPremiumAccess && (
              <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-300">
                  Mollie Test Mode
                </p>

                <h3 className="mt-3 text-xl font-semibold">
                  Professional PDF Export
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Start a temporary €1.29
                  Mollie test payment. No real
                  money will be charged.
                </p>

                <div className="mt-4 rounded-xl border border-amber-400/15 bg-black/25 px-4 py-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-amber-300/70">
                    Available PDF Exports
                  </p>

                  <p className="mt-1 text-lg font-semibold text-amber-100">
                    {pdfAccessLoading
                      ? "Loading..."
                      : pdfAccess?.premium
                        ? "Unlimited with DOST Premium"
                        : `${pdfAccess?.availableCredits ?? 0}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void handleTestPdfPayment()
                  }
                  disabled={
                    testPaymentStarting ||
                    testPaymentProcessing
                  }
                  className="mt-5 w-full rounded-xl border border-amber-400/40 bg-amber-400/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-200 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {testPaymentStarting
                    ? "Opening Mollie..."
                    : testPaymentProcessing
                      ? "Verifying payment..."
                      : "Test €1.29 PDF payment"}
                </button>

                {testPaymentError && (
                  <p className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {testPaymentError}
                  </p>
                )}

                {testPaymentSuccess && (
                  <p className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    {testPaymentSuccess}
                  </p>
                )}
              </div>
            )}

            {hasPremiumAccess && (
              <div className="mt-6 rounded-2xl border border-cyan-400/25 bg-black/45 p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
                  DOST Premium
                </p>

                <h3 className="mt-3 text-xl font-semibold">
                  Premium access active
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-cyan-500/15 bg-cyan-400/5 px-4 py-3 text-sm text-zinc-300">
                    No advertisements
                  </div>

                  <div className="rounded-xl border border-cyan-500/15 bg-cyan-400/5 px-4 py-3 text-sm text-zinc-300">
                    Save calculations
                  </div>

                  <div className="rounded-xl border border-cyan-500/15 bg-cyan-400/5 px-4 py-3 text-sm text-zinc-300">
                    PDF export
                  </div>
                </div>
              </div>
            )}

            {hasSaveCalculations && (
              <div className="mt-6 rounded-2xl border border-cyan-400/25 bg-black/45 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
                      Saved Calculations
                    </p>

                    <h3 className="mt-3 text-xl font-semibold">
                      Calculation history
                    </h3>
                  </div>

                  <Clock3
                    size={24}
                    className="shrink-0 text-cyan-300"
                  />
                </div>

                {calculationsLoading && (
                  <p className="mt-5 text-sm text-zinc-500">
                    Loading saved
                    calculations...
                  </p>
                )}

                {!calculationsLoading &&
                  calculations.length ===
                    0 &&
                  !calculationsError && (
                    <div className="mt-5 rounded-xl border border-cyan-500/15 bg-cyan-400/5 px-4 py-5 text-sm text-zinc-400">
                      No saved calculations
                      yet.
                    </div>
                  )}

                {!calculationsLoading &&
                  calculations.length >
                    0 && (
                    <div className="mt-5 space-y-3">
                      {calculations.map(
                        (
                          calculation
                        ) => {
                          const inputs =
                            calculation.inputs;

                          const result =
                            calculation.result;

                          const isHeatInput =
                            calculation.moduleId ===
                            "heat-input";

                          return (
                            <div
                              key={
                                calculation.id
                              }
                              className="rounded-xl border border-cyan-500/15 bg-cyan-400/5 p-4"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                                    {isHeatInput
                                      ? "Heat Input"
                                      : calculation.moduleId}
                                  </p>

                                  <p className="mt-1 text-xs text-zinc-500">
                                    {formatDate(
                                      calculation.createdAt
                                    )}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleDeleteCalculation(
                                      calculation.id
                                    )
                                  }
                                  disabled={
                                    deletingCalculationId ===
                                    calculation.id
                                  }
                                  aria-label="Delete saved calculation"
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-500/25 bg-red-500/5 text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Trash2
                                    size={
                                      16
                                    }
                                  />
                                </button>
                              </div>

                              {isHeatInput && (
                                <>
                                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-lg border border-cyan-500/10 bg-black/30 px-3 py-2">
                                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-zinc-500">
                                        Voltage
                                      </p>

                                      <p className="mt-1 text-sm text-white">
                                        {String(
                                          inputs.voltage ??
                                            "-"
                                        )}{" "}
                                        V
                                      </p>
                                    </div>

                                    <div className="rounded-lg border border-cyan-500/10 bg-black/30 px-3 py-2">
                                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-zinc-500">
                                        Amperage
                                      </p>

                                      <p className="mt-1 text-sm text-white">
                                        {String(
                                          inputs.amperage ??
                                            "-"
                                        )}{" "}
                                        A
                                      </p>
                                    </div>

                                    <div className="rounded-lg border border-cyan-500/10 bg-black/30 px-3 py-2">
                                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-zinc-500">
                                        Speed
                                      </p>

                                      <p className="mt-1 text-sm text-white">
                                        {String(
                                          inputs.travelSpeed ??
                                            "-"
                                        )}{" "}
                                        mm/min
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-400/20 bg-black/35 px-4 py-3">
                                    <div>
                                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-zinc-500">
                                        Process
                                      </p>

                                      <p className="mt-1 text-sm text-zinc-300">
                                        {String(
                                          inputs.process ??
                                            "-"
                                        )}
                                      </p>
                                    </div>

                                    <div className="text-right">
                                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-zinc-500">
                                        Result
                                      </p>

                                      <p className="mt-1 text-lg font-semibold text-cyan-300">
                                        {String(
                                          result.heatInput ??
                                            "-"
                                        )}{" "}
                                        {String(
                                          result.unit ??
                                            ""
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}

                {calculationsError && (
                  <p className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {calculationsError}
                  </p>
                )}
              </div>
            )}

            <SubscriptionManagement />

            <RestorePurchases />

            <button
              type="button"
              onClick={handleLogout}
              disabled={
                loggingOut ||
                deleting
              }
              className="mt-8 w-full rounded-xl border border-cyan-500/35 bg-cyan-500/10 py-4 text-sm font-bold uppercase tracking-[0.25em] text-cyan-300 transition hover:border-cyan-400/60 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>
          </div>
        </section>
      </div>

      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div className="w-full max-w-lg rounded-[24px] border border-red-500/35 bg-[#020617] p-6 shadow-[0_0_70px_rgba(239,68,68,0.18)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
              Permanent action
            </p>

            <h2
              id="delete-account-title"
              className="mt-3 text-2xl font-semibold text-white"
            >
              Delete your account?
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Your account, saved
              calculations and associated
              account data will be
              permanently deleted. This
              cannot be undone.
            </p>

            <label className="mt-6 block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                Current password
              </span>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                autoComplete="current-password"
                disabled={deleting}
                className="mt-2 w-full rounded-xl border border-cyan-500/25 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/70 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Enter your password"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                Type DELETE to confirm
              </span>

              <input
                type="text"
                value={confirmation}
                onChange={(event) =>
                  setConfirmation(
                    event.target.value
                  )
                }
                autoComplete="off"
                disabled={deleting}
                className="mt-2 w-full rounded-xl border border-cyan-500/25 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/70 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="DELETE"
              />
            </label>

            {deleteError && (
              <p className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {deleteError}
              </p>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={
                  closeDeleteDialog
                }
                disabled={deleting}
                className="rounded-xl border border-zinc-700 bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteAccount
                }
                disabled={
                  !deletionConfirmed ||
                  deleting
                }
                className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-35"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
