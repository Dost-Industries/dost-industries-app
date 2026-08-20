"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import {
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  FileText,
  ImagePlus,
  Monitor,
  Printer,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useAuth } from "../../../hooks/useAuth";

export type ReportTheme =
  | "digital"
  | "print";

export type ReportBuilderDetails = {
  projectName: string;
  projectNumber: string;
  reportDate: string;
  standard: string;
  preparedBy: string;
  preparedByRole: string;
  reportTheme: ReportTheme;
  logo: File | null;
};

export type ReportDataItem = {
  label: string;
  value: string;
  highlight?: boolean;
};

type PdfAccessMode =
  | "premium"
  | "credit"
  | "none";

type PdfAccessStatus = {
  canExport: boolean;
  accessMode: PdfAccessMode;
  premium: boolean;
  availableCredits: number;
};

type ReportBuilderDialogProps = {
  open: boolean;

  reportTitle: string;
  reportSubtitle?: string;

  calculationData: ReportDataItem[];

  formula?: string;

  entitlementText?: string;

  generating?: boolean;

  onClose: () => void;

  onGenerate: (
    details: ReportBuilderDetails
  ) => void | Promise<void>;
};

const MAX_LOGO_SIZE =
  3 * 1024 * 1024;

const ALLOWED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
];

export default function ReportBuilderDialog({
  open,
  reportTitle,
  reportSubtitle,
  calculationData,
  formula,
  entitlementText,
  generating = false,
  onClose,
  onGenerate,
}: ReportBuilderDialogProps) {
  const router = useRouter();

  const {
    user,
  } = useAuth();

  const [
    projectName,
    setProjectName,
  ] = useState("");

  const [
    projectNumber,
    setProjectNumber,
  ] = useState("");

  const [
    reportDate,
    setReportDate,
  ] = useState("");

  const [
    standard,
    setStandard,
  ] = useState("");

  const [
    preparedBy,
    setPreparedBy,
  ] = useState("");

  const [
    preparedByRole,
    setPreparedByRole,
  ] = useState("");

  const [
    reportTheme,
    setReportTheme,
  ] = useState<ReportTheme>(
    "digital"
  );

  const [logo, setLogo] =
    useState<File | null>(null);

  const [
    logoError,
    setLogoError,
  ] = useState("");

  const [
    pdfAccess,
    setPdfAccess,
  ] = useState<PdfAccessStatus | null>(
    null
  );

  const [
    pdfAccessUserId,
    setPdfAccessUserId,
  ] = useState<string | null>(null);

  const [
    pdfAccessLoading,
    setPdfAccessLoading,
  ] = useState(false);

  const [
    pdfAccessError,
    setPdfAccessError,
  ] = useState("");

  const logoPreviewUrl =
    useMemo(() => {
      if (!logo) {
        return null;
      }

      return URL.createObjectURL(
        logo
      );
    }, [logo]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(
          logoPreviewUrl
        );
      }
    };
  }, [logoPreviewUrl]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape" &&
        !generating
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
    generating,
    onClose,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!user) {
      return;
    }

    const currentUser = user;

    let active = true;

    async function loadPdfAccess() {
      setPdfAccessLoading(true);
      setPdfAccessError("");

      try {
        const idToken =
          await currentUser.getIdToken();

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
          (await response.json()) as {
            canExport?: unknown;
            accessMode?: unknown;
            premium?: unknown;
            availableCredits?: unknown;
          };

        const validAccessMode =
          data.accessMode === "premium" ||
          data.accessMode === "credit" ||
          data.accessMode === "none";

        if (
          typeof data.canExport !==
            "boolean" ||
          !validAccessMode ||
          typeof data.premium !==
            "boolean" ||
          typeof data.availableCredits !==
            "number" ||
          !Number.isFinite(
            data.availableCredits
          ) ||
          data.availableCredits < 0
        ) {
          throw new Error(
            "PDF_ACCESS_RESPONSE_INVALID"
          );
        }

        if (!active) {
          return;
        }

        setPdfAccess({
          canExport:
            data.canExport,

          accessMode:
            data.accessMode as PdfAccessMode,

          premium:
            data.premium,

          availableCredits:
            data.availableCredits,
        });

        setPdfAccessUserId(
          currentUser.uid
        );
      } catch (error) {
        console.error(
          "Failed to load PDF access:",
          error
        );

        if (!active) {
          return;
        }

        setPdfAccess(null);

        setPdfAccessUserId(
          currentUser.uid
        );

        setPdfAccessError(
          "PDF access status could not be loaded. Access will still be verified when generating."
        );
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
    open,
    user,
  ]);

  if (!open) {
    return null;
  }

  function handleLogoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setLogoError("");

    const file =
      event.target.files?.[0] ??
      null;

    if (!file) {
      setLogo(null);
      return;
    }

    if (
      !ALLOWED_LOGO_TYPES.includes(
        file.type
      )
    ) {
      setLogo(null);

      setLogoError(
        "Use a PNG, JPG or JPEG image."
      );

      event.target.value = "";

      return;
    }

    if (
      file.size > MAX_LOGO_SIZE
    ) {
      setLogo(null);

      setLogoError(
        "Logo must be smaller than 3 MB."
      );

      event.target.value = "";

      return;
    }

    setLogo(file);
  }

  async function handleGenerate() {
    await onGenerate({
      projectName:
        projectName.trim(),

      projectNumber:
        projectNumber.trim(),

      reportDate,

      standard:
        standard.trim(),

      preparedBy:
        preparedBy.trim(),

      preparedByRole:
        preparedByRole.trim(),

      reportTheme,

      logo,
    });
  }

  function handleBuyPdfExport() {
    onClose();

    router.push("/account");
  }

  const fieldClassName =
    "w-full rounded-xl border border-cyan-500/20 bg-[#02090f]/90 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-cyan-400/40 focus:border-cyan-300/70 focus:shadow-[0_0_18px_rgba(0,255,255,0.10)]";

  const labelClassName =
    "mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-400";

  const currentPdfAccess =
    user &&
    pdfAccessUserId === user.uid
      ? pdfAccess
      : null;

  const currentPdfAccessLoading =
    Boolean(user) &&
    (
      pdfAccessUserId !== user?.uid ||
      pdfAccessLoading
    );

  const currentPdfAccessError =
    user &&
    pdfAccessUserId === user.uid
      ? pdfAccessError
      : "";

  const showBuyButton =
    !currentPdfAccessLoading &&
    currentPdfAccess?.accessMode ===
      "none";

  const generateDisabled =
    generating ||
    currentPdfAccessLoading ||
    currentPdfAccess?.accessMode ===
      "none";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-3 py-4 backdrop-blur-md sm:px-6 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-builder-title"
    >
      <div className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-cyan-500/30 bg-[#02080d] shadow-[0_0_80px_rgba(0,255,255,0.15)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.08),transparent_45%)]" />

        <div className="pointer-events-none absolute left-0 top-0 z-20 h-16 w-16 rounded-tl-[28px] border-l border-t border-cyan-300/70" />

        <div className="pointer-events-none absolute right-0 top-0 z-20 h-16 w-16 rounded-tr-[28px] border-r border-t border-cyan-300/70" />

        <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-16 w-16 rounded-bl-[28px] border-b border-l border-cyan-300/70" />

        <div className="pointer-events-none absolute bottom-0 right-0 z-20 h-16 w-16 rounded-br-[28px] border-b border-r border-cyan-300/70" />

        <header className="relative z-10 flex shrink-0 items-start justify-between border-b border-cyan-500/15 bg-[#02080d]/95 px-5 py-5 backdrop-blur-xl sm:px-8 sm:py-7">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
              <FileText
                size={21}
                className="text-cyan-300"
              />
            </div>

            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-cyan-400">
                DOST REPORT ENGINE
              </p>

              <h2
                id="report-builder-title"
                className="mt-1 text-lg font-semibold uppercase tracking-[0.1em] text-white sm:text-2xl"
              >
                {reportTitle}
              </h2>

              {reportSubtitle && (
                <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                  {reportSubtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={generating}
            aria-label="Close report builder"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-black/30 text-zinc-400 transition-all hover:border-cyan-300/60 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </header>

        <div
          className="
            relative z-10 min-h-0 flex-1 overflow-y-auto
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-[#010609]
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-cyan-500/30
            hover:[&::-webkit-scrollbar-thumb]:bg-cyan-400/50
            [scrollbar-color:rgba(6,182,212,0.35)_#010609]
            [scrollbar-width:thin]
          "
        >
          <div className="space-y-5 p-5 sm:p-8">
            <section className="rounded-2xl border border-cyan-500/20 bg-black/30 p-4 sm:p-5">
              <div className="mb-5">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  Report Style
                </p>

                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  Choose the PDF version that best fits how the report will be used.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    setReportTheme(
                      "digital"
                    )
                  }
                  aria-pressed={
                    reportTheme ===
                    "digital"
                  }
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    reportTheme ===
                    "digital"
                      ? "border-cyan-300/70 bg-cyan-400/10 shadow-[0_0_24px_rgba(0,255,255,0.10)]"
                      : "border-cyan-500/15 bg-[#02090f]/70 hover:border-cyan-400/35"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        reportTheme ===
                        "digital"
                          ? "border-cyan-300/50 bg-cyan-400/10 text-cyan-200"
                          : "border-zinc-700 bg-black/30 text-zinc-500"
                      }`}
                    >
                      <Monitor
                        size={18}
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
                        Digital
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Dark background · Optimized for screen use
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setReportTheme(
                      "print"
                    )
                  }
                  aria-pressed={
                    reportTheme ===
                    "print"
                  }
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    reportTheme ===
                    "print"
                      ? "border-cyan-300/70 bg-cyan-400/10 shadow-[0_0_24px_rgba(0,255,255,0.10)]"
                      : "border-cyan-500/15 bg-[#02090f]/70 hover:border-cyan-400/35"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        reportTheme ===
                        "print"
                          ? "border-cyan-300/50 bg-cyan-400/10 text-cyan-200"
                          : "border-zinc-700 bg-black/30 text-zinc-500"
                      }`}
                    >
                      <Printer
                        size={18}
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
                        Print
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        White background · Optimized for printing
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-cyan-500/20 bg-black/30 p-4 sm:p-5">
              <div className="mb-5">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  Project Information
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  All report fields are optional.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <span
                    className={
                      labelClassName
                    }
                  >
                    Company / Project
                    Logo
                  </span>

                  <label className="group flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-cyan-500/30 bg-cyan-400/[0.03] p-4 transition-all hover:border-cyan-300/60 hover:bg-cyan-400/[0.06]">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-500/20 bg-black/50">
                      {logoPreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            logoPreviewUrl
                          }
                          alt="Selected logo preview"
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <ImagePlus
                          size={21}
                          className="text-cyan-300"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {logo
                          ? logo.name
                          : "Upload logo"}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        PNG, JPG or JPEG · max. 3 MB
                      </p>
                    </div>

                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={
                        handleLogoChange
                      }
                      className="hidden"
                    />
                  </label>

                  {logoError && (
                    <p className="mt-2 text-xs text-red-400">
                      {logoError}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="report-project-name"
                    className={
                      labelClassName
                    }
                  >
                    Project Name
                  </label>

                  <input
                    id="report-project-name"
                    type="text"
                    value={
                      projectName
                    }
                    onChange={(
                      event
                    ) =>
                      setProjectName(
                        event.target
                          .value
                      )
                    }
                    placeholder="Optional"
                    maxLength={120}
                    className={
                      fieldClassName
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="report-project-number"
                    className={
                      labelClassName
                    }
                  >
                    Project Number
                  </label>

                  <input
                    id="report-project-number"
                    type="text"
                    value={
                      projectNumber
                    }
                    onChange={(
                      event
                    ) =>
                      setProjectNumber(
                        event.target
                          .value
                      )
                    }
                    placeholder="Optional"
                    maxLength={80}
                    className={
                      fieldClassName
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="report-standard"
                    className={
                      labelClassName
                    }
                  >
                    Standard / Norm
                  </label>

                  <div className="relative">
                    <ShieldCheck
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400"
                    />

                    <input
                      id="report-standard"
                      type="text"
                      value={
                        standard
                      }
                      onChange={(
                        event
                      ) =>
                        setStandard(
                          event.target
                            .value
                        )
                      }
                      placeholder="Optional"
                      maxLength={120}
                      className={`${fieldClassName} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="report-date"
                    className={
                      labelClassName
                    }
                  >
                    Report Date
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400"
                    />

                    <input
                      id="report-date"
                      type="date"
                      value={
                        reportDate
                      }
                      onChange={(
                        event
                      ) =>
                        setReportDate(
                          event
                            .target
                            .value
                        )
                      }
                      className={`${fieldClassName} pl-11 [color-scheme:dark]`}
                    />
                  </div>

                  <p className="mt-2 text-[0.7rem] text-zinc-600">
                    Past dates can
                    also be selected.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-cyan-500/20 bg-black/30 p-4 sm:p-5">
              <div className="mb-5">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  Prepared By
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="report-prepared-by"
                    className={
                      labelClassName
                    }
                  >
                    Name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400"
                    />

                    <input
                      id="report-prepared-by"
                      type="text"
                      value={
                        preparedBy
                      }
                      onChange={(
                        event
                      ) =>
                        setPreparedBy(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Optional"
                      maxLength={120}
                      className={`${fieldClassName} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="report-prepared-by-role"
                    className={
                      labelClassName
                    }
                  >
                    Function /
                    Position
                  </label>

                  <div className="relative">
                    <BriefcaseBusiness
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400"
                    />

                    <input
                      id="report-prepared-by-role"
                      type="text"
                      value={
                        preparedByRole
                      }
                      onChange={(
                        event
                      ) =>
                        setPreparedByRole(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Optional"
                      maxLength={120}
                      className={`${fieldClassName} pl-11`}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-cyan-500/20 bg-black/30 p-4 sm:p-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Calculation Data
              </p>

              <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-cyan-500/15 bg-cyan-500/10 sm:grid-cols-3">
                {calculationData.map(
                  (item) => (
                    <ReportValue
                      key={
                        item.label
                      }
                      label={
                        item.label
                      }
                      value={
                        item.value
                      }
                      highlight={
                        item.highlight
                      }
                    />
                  )
                )}
              </div>
            </section>

            {formula && (
              <section className="rounded-2xl border border-cyan-500/15 bg-[#010609] p-4 sm:p-5">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  Calculation
                </p>

                <div className="mt-4 overflow-x-auto">
                  <p className="whitespace-nowrap text-center font-mono text-sm text-zinc-300 sm:text-base">
                    {formula}
                  </p>
                </div>
              </section>
            )}

            {entitlementText && (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-400/[0.04] px-4 py-3 text-center text-xs text-cyan-200">
                {
                  entitlementText
                }
              </div>
            )}
          </div>
        </div>

        <footer className="relative z-20 shrink-0 border-t border-cyan-500/20 bg-[#02080d]/95 px-5 py-4 shadow-[0_-15px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-8 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              {currentPdfAccessLoading ? (
                <>
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    PDF Export Access
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Checking PDF export access...
                  </p>
                </>
              ) : currentPdfAccess?.premium ? (
                <>
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    DOST Premium
                  </p>

                  <p className="mt-1 text-xs text-cyan-200">
                    PDF export included with Premium. No credit will be used.
                  </p>
                </>
              ) : currentPdfAccess?.accessMode ===
                "credit" ? (
                <>
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    PDF Export Credits
                  </p>

                  <p className="mt-1 text-xs text-zinc-300">
                    {
                      currentPdfAccess.availableCredits
                    }{" "}
                    {currentPdfAccess.availableCredits ===
                    1
                      ? "credit available"
                      : "credits available"}
                    {" · "}
                    1 credit will be used
                  </p>
                </>
              ) : currentPdfAccess?.accessMode ===
                "none" ? (
                <>
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-amber-400">
                    PDF Export Required
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    No PDF export credits are available.
                  </p>
                </>
              ) : currentPdfAccessError ? (
                <>
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    PDF Export Access
                  </p>

                  <p className="mt-1 max-w-xl text-xs text-zinc-500">
                    {currentPdfAccessError}
                  </p>
                </>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={generating}
                className="rounded-xl border border-zinc-700 bg-black/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400 transition-all hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancel
              </button>

              {showBuyButton ? (
                <button
                  type="button"
                  onClick={
                    handleBuyPdfExport
                  }
                  className="flex items-center justify-center gap-3 rounded-xl border border-amber-400/50 bg-amber-400/[0.08] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-amber-200 transition-all hover:border-amber-300/80 hover:bg-amber-400/[0.14]"
                >
                  <CreditCard
                    size={17}
                  />

                  Buy PDF Export — €1.29
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    void handleGenerate()
                  }
                  disabled={
                    generateDisabled
                  }
                  className="flex items-center justify-center gap-3 rounded-xl border border-cyan-300/60 bg-cyan-400/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200 shadow-[0_0_25px_rgba(0,255,255,0.08)] transition-all hover:bg-cyan-400/20 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FileText
                    size={17}
                  />

                  {generating
                    ? "Generating..."
                    : currentPdfAccessLoading
                      ? "Checking access..."
                      : "Generate PDF"}
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ReportValue({
  label,
  value,
  highlight = false,
}: ReportDataItem) {
  return (
    <div className="bg-[#02080d] px-3 py-4">
      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-zinc-600">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-medium ${
          highlight
            ? "text-cyan-300"
            : "text-zinc-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
