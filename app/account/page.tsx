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
  Menu,
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
import NavigationMenu from "../components/NavigationMenu";

import {
  ENTITLEMENTS,
  hasEntitlement,
} from "../../lib/entitlements";

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
    menuOpen,
    setMenuOpen,
  ] = useState(false);

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

  const paymentReturnStartedRef =
    useRef(false);

  const hasSaveCalculations =
    hasEntitlement(
      profile?.entitlements,
      ENTITLEMENTS.SAVE_CALCULATIONS
    );

  const hasPremiumAccess =
    hasEntitlement(
      profile?.entitlements,
      ENTITLEMENTS.HEAT_INPUT_PREMIUM
    ) ||
    hasEntitlement(
      profile?.entitlements,
      ENTITLEMENTS.REMOVE_ADS
    ) ||
    hasSaveCalculations ||
    hasEntitlement(
      profile?.entitlements,
      ENTITLEMENTS.PDF_EXPORT
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

  function getCalculationRoute(
    moduleId: string
  ): string | null {
    switch (moduleId) {
      case "heat-input":
        return "/heat-input";

      case "carbon-equivalent":
        return "/ceq";

      case "preheat":
        return "/preheat";

      default:
        return null;
    }
  }

  function getCalculationLabel(
    moduleId: string
  ): string {
    switch (moduleId) {
      case "heat-input":
        return "Heat Input";

      case "carbon-equivalent":
        return "Carbon Equivalent";

      case "preheat":
        return "Preheat Temperature";

      default:
        return moduleId;
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
      <main className="flex min-h-screen items-center justify-center bg-[var(--dost-bg)] text-cyan-300">
        Loading account...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--dost-bg)] px-4 py-8 text-[var(--dost-text)] sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0 dost-radial-bg" />
      <div className="pointer-events-none absolute inset-0 dost-grid-bg" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <header className="relative mb-8 flex min-h-12 items-center justify-center text-center sm:mb-10">
          <button
            type="button"
            onClick={() =>
              setMenuOpen(true)
            }
            aria-label="Open navigation menu"
            aria-expanded={
              menuOpen
            }
            className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/25 bg-[var(--dost-surface-40)] text-cyan-300 transition hover:border-cyan-400/60 hover:bg-cyan-400/[0.06] sm:h-11 sm:w-11"
          >
            <Menu size={19} />
          </button>

          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-[0.24em] sm:text-4xl sm:tracking-[0.35em]">
              <span className="text-[var(--dost-text)]">
                DOST
              </span>{" "}
              <span className="text-cyan-400 drop-shadow-[0_0_18px_rgba(0,255,255,0.65)]">
                INDUSTRIES
              </span>
            </h1>

            <p className="mt-2 text-[0.62rem] uppercase tracking-[0.38em] text-[var(--dost-muted)] sm:text-xs">
              Account Hub
            </p>
          </div>
        </header>

        <NavigationMenu
          open={menuOpen}
          isAuthenticated={
            Boolean(user)
          }
          onClose={() =>
            setMenuOpen(false)
          }
        />

        <section className="relative overflow-hidden rounded-[28px] border border-cyan-500/25 bg-[var(--dost-surface-60)] p-5 shadow-[0_0_60px_rgba(0,255,255,0.10)] backdrop-blur-xl sm:p-8">
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

                <p className="mt-2 truncate text-sm text-[var(--dost-muted)] sm:text-base">
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
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--dost-muted)]">
                  Access
                </p>

                <p className="mt-2 text-2xl font-semibold text-cyan-300">
                  {hasPremiumAccess
                    ? "DOST PREMIUM"
                    : "FREE"}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-400/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--dost-muted)]">
                  Available Tool
                </p>

                <p className="mt-2 text-2xl font-semibold text-cyan-300">
                  Heat Input
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-400/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--dost-muted)]">
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
                  pdfAccess &&
                  !pdfAccess.premium && (
                    <p className="mt-2 text-xs text-[var(--dost-muted)]">
                      Purchased PDF export
                      credits
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
              <div className="mt-6 rounded-2xl border border-cyan-400/25 bg-[var(--dost-surface-40)] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
                  DOST Premium
                </p>

                <h3 className="mt-3 text-xl font-semibold">
                  Unlock your professional
                  workspace
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-[var(--dost-muted)]">
                  Remove advertisements,
                  save calculations and export
                  professional PDF reports.
                </p>

                <button
                  type="button"
                  className="mt-5 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-300 transition hover:bg-cyan-400/15"
                >
                  Upgrade Soon
                </button>
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

                <p className="mt-2 text-sm leading-relaxed text-[var(--dost-muted)]">
                  Start a temporary €1.29
                  Mollie test payment. No real
                  money will be charged.
                </p>

                <div className="mt-4 rounded-xl border border-amber-400/15 bg-[var(--dost-surface-30)] px-4 py-3">
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
              <div className="mt-6 rounded-2xl border border-cyan-400/25 bg-[var(--dost-surface-40)] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
                  DOST Premium
                </p>

                <h3 className="mt-3 text-xl font-semibold">
                  Premium access active
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-cyan-500/15 bg-cyan-400/5 px-4 py-3 text-sm text-[var(--dost-text)]">
                    No advertisements
                  </div>

                  <div className="rounded-xl border border-cyan-500/15 bg-cyan-400/5 px-4 py-3 text-sm text-[var(--dost-text)]">
                    Save calculations
                  </div>

                  <div className="rounded-xl border border-cyan-500/15 bg-cyan-400/5 px-4 py-3 text-sm text-[var(--dost-text)]">
                    PDF export
                  </div>
                </div>
              </div>
            )}

            {hasSaveCalculations && (
              <div className="mt-6 rounded-2xl border border-cyan-400/25 bg-[var(--dost-surface-40)] p-5 sm:p-6">
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
                  <p className="mt-5 text-sm text-[var(--dost-muted)]">
                    Loading saved
                    calculations...
                  </p>
                )}

                {!calculationsLoading &&
                  calculations.length ===
                    0 &&
                  !calculationsError && (
                    <div className="mt-5 rounded-xl border border-cyan-500/15 bg-cyan-400/5 px-4 py-5 text-sm text-[var(--dost-muted)]">
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

                          const calculationRoute =
                            getCalculationRoute(
                              calculation.moduleId
                            );

                          const calculationLabel =
                            getCalculationLabel(
                              calculation.moduleId
                            );

                          return (
                            <div
                              key={
                                calculation.id
                              }
                              className="rounded-xl border border-cyan-500/15 bg-cyan-400/5 p-4"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  {calculationRoute ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          calculationRoute
                                        )
                                      }
                                      className="group inline-flex items-center gap-2 text-left text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 transition hover:text-cyan-200"
                                    >
                                      <span className="border-b border-transparent transition group-hover:border-cyan-300/60">
                                        {calculationLabel}
                                      </span>

                                      <ArrowUpRight
                                        size={14}
                                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                      />
                                    </button>
                                  ) : (
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                                      {calculationLabel}
                                    </p>
                                  )}

                                  <p className="mt-1 text-xs text-[var(--dost-muted)]">
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
                                    <div className="rounded-lg border border-cyan-500/10 bg-[var(--dost-surface-30)] px-3 py-2">
                                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-[var(--dost-muted)]">
                                        Voltage
                                      </p>

                                      <p className="mt-1 text-sm text-[var(--dost-text)]">
                                        {String(
                                          inputs.voltage ??
                                            "-"
                                        )}{" "}
                                        V
                                      </p>
                                    </div>

                                    <div className="rounded-lg border border-cyan-500/10 bg-[var(--dost-surface-30)] px-3 py-2">
                                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-[var(--dost-muted)]">
                                        Amperage
                                      </p>

                                      <p className="mt-1 text-sm text-[var(--dost-text)]">
                                        {String(
                                          inputs.amperage ??
                                            "-"
                                        )}{" "}
                                        A
                                      </p>
                                    </div>

                                    <div className="rounded-lg border border-cyan-500/10 bg-[var(--dost-surface-30)] px-3 py-2">
                                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-[var(--dost-muted)]">
                                        Speed
                                      </p>

                                      <p className="mt-1 text-sm text-[var(--dost-text)]">
                                        {String(
                                          inputs.travelSpeed ??
                                            "-"
                                        )}{" "}
                                        mm/min
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-400/20 bg-[var(--dost-surface-40)] px-4 py-3">
                                    <div>
                                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-[var(--dost-muted)]">
                                        Process
                                      </p>

                                      <p className="mt-1 text-sm text-[var(--dost-text)]">
                                        {String(
                                          inputs.process ??
                                            "-"
                                        )}
                                      </p>
                                    </div>

                                    <div className="text-right">
                                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-[var(--dost-muted)]">
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
          <div className="w-full max-w-lg rounded-[24px] border border-red-500/35 bg-[var(--dost-bg)] p-6 text-[var(--dost-text)] shadow-[0_0_70px_rgba(239,68,68,0.18)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
              Permanent action
            </p>

            <h2
              id="delete-account-title"
              className="mt-3 text-2xl font-semibold text-white"
            >
              Delete your account?
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-[var(--dost-muted)]">
              Your account, saved
              calculations and associated
              account data will be
              permanently deleted. This
              cannot be undone.
            </p>

            <label className="mt-6 block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--dost-muted)]">
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
                className="mt-2 w-full rounded-xl border border-cyan-500/25 bg-[var(--dost-input-bg)] px-4 py-3 text-[var(--dost-text)] outline-none transition placeholder:text-[var(--dost-muted)] focus:border-cyan-400/70 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Enter your password"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--dost-muted)]">
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
                className="mt-2 w-full rounded-xl border border-cyan-500/25 bg-[var(--dost-input-bg)] px-4 py-3 text-[var(--dost-text)] outline-none transition placeholder:text-[var(--dost-muted)] focus:border-cyan-400/70 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="rounded-xl border border-cyan-500/20 bg-[var(--dost-surface-30)] px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[var(--dost-text)] transition hover:bg-cyan-400/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
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