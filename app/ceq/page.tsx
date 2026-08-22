"use client";

import {
  Activity,
  FileDown,
  Flame,
  Gauge,
  Menu,
  Save,
  Settings2,
  Sigma,
  User,
  Zap,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "../../hooks/useAuth";
import InputRow from "../components/InputRow";
import ResultCard from "../components/ResultCard";
import AdBanner from "../components/AdBanner";
import MoreTools from "../components/MoreTools";
import NavigationMenu from "../components/NavigationMenu";
import ReportBuilderDialog, {
  type ReportBuilderDetails,
} from "../components/reports/ReportBuilderDialog";

import {
  calculateCarbonEquivalent,
  type CarbonEquivalentInputs,
} from "../../lib/carbon-equivalent";

import {
  hasCarbonEquivalentValidationErrors,
  validateCarbonEquivalentFields,
} from "../../lib/carbon-equivalent-validation";

import {
  ENTITLEMENTS,
  hasEntitlement,
} from "../../lib/entitlements";

import {
  prepareReportPhotos,
} from "../../lib/reports/prepareReportPhotos";

import {
  saveCalculation,
} from "../../firebase/calculations";

const FORMULA =
  "CEq = C + Mn / 6 + (Cr + Mo + V) / 5 + (Ni + Cu) / 15";

export default function CarbonEquivalentPage() {
  const router =
    useRouter();

  const {
    user,
    profile,
    loading,
  } = useAuth();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    inputs,
    setInputs,
  ] = useState<
    CarbonEquivalentInputs
  >({
    carbon: "",
    manganese: "",
    chromium: "",
    molybdenum: "",
    vanadium: "",
    nickel: "",
    copper: "",
  });

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    saveMessage,
    setSaveMessage,
  ] = useState("");

  const [
    saveError,
    setSaveError,
  ] = useState("");

  const [
    reportBuilderOpen,
    setReportBuilderOpen,
  ] = useState(false);

  const [
    generatingReport,
    setGeneratingReport,
  ] = useState(false);

  const [
    reportError,
    setReportError,
  ] = useState("");

  const validationErrors =
    validateCarbonEquivalentFields(
      inputs
    );

  const hasValidationErrors =
    hasCarbonEquivalentValidationErrors(
      validationErrors
    );

  const result =
    hasValidationErrors
      ? null
      : calculateCarbonEquivalent(
          inputs
        );

  const canSaveCalculations =
    hasEntitlement(
      profile?.entitlements,
      ENTITLEMENTS.SAVE_CALCULATIONS
    );

  const reportCalculationData = [
    {
      label: "Carbon (C)",
      value: inputs.carbon
        ? `${inputs.carbon} %`
        : "—",
    },
    {
      label: "Manganese (Mn)",
      value: inputs.manganese
        ? `${inputs.manganese} %`
        : "—",
    },
    {
      label: "Chromium (Cr)",
      value: inputs.chromium
        ? `${inputs.chromium} %`
        : "—",
    },
    {
      label: "Molybdenum (Mo)",
      value: inputs.molybdenum
        ? `${inputs.molybdenum} %`
        : "—",
    },
    {
      label: "Vanadium (V)",
      value: inputs.vanadium
        ? `${inputs.vanadium} %`
        : "—",
    },
    {
      label: "Nickel (Ni)",
      value: inputs.nickel
        ? `${inputs.nickel} %`
        : "—",
    },
    {
      label: "Copper (Cu)",
      value: inputs.copper
        ? `${inputs.copper} %`
        : "—",
    },
    {
      label:
        "Carbon Equivalent",
      value:
        result !== null
          ? result.toFixed(3)
          : "—",
      highlight: true,
    },
  ];

  function setField(
    field:
      keyof CarbonEquivalentInputs,
    value: string
  ) {
    setInputs(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  function handleOpenReportBuilder() {
    setReportError("");

    if (!user) {
      router.push("/login");
      return;
    }

    if (result === null) {
      setReportError(
        "Complete the calculation before creating a report."
      );

      return;
    }

    setReportBuilderOpen(true);
  }

  async function handleGenerateReport(
    details: ReportBuilderDetails
  ) {
    setReportError("");

    if (!user) {
      router.push("/login");
      return;
    }

    if (result === null) {
      setReportError(
        "Complete the calculation before creating a report."
      );

      return;
    }

    setGeneratingReport(true);

    try {
      const idToken =
        await user.getIdToken();

      const preparedPhotos =
        await prepareReportPhotos(
          details.photos,
          details.logo?.size ?? 0
        );

      const formData =
        new FormData();

      formData.set(
        "moduleId",
        "carbon-equivalent"
      );

      (
        Object.entries(
          inputs
        ) as Array<
          [
            keyof CarbonEquivalentInputs,
            string,
          ]
        >
      ).forEach(
        ([key, value]) => {
          formData.set(
            key,
            value
          );
        }
      );

      if (details.projectName) {
        formData.set(
          "projectName",
          details.projectName
        );
      }

      if (details.projectNumber) {
        formData.set(
          "projectNumber",
          details.projectNumber
        );
      }

      if (details.reportDate) {
        formData.set(
          "reportDate",
          details.reportDate
        );
      }

      if (details.standard) {
        formData.set(
          "standard",
          details.standard
        );
      }

      formData.set(
        "reportTheme",
        details.reportTheme
      );

      if (details.preparedBy) {
        formData.set(
          "preparedBy",
          details.preparedBy
        );
      }

      if (
        details.preparedByRole
      ) {
        formData.set(
          "preparedByRole",
          details.preparedByRole
        );
      }

      if (details.logo) {
        formData.set(
          "logo",
          details.logo
        );
      }

      preparedPhotos.forEach(
        (photo) => {
          formData.append(
            "photos",
            photo,
            photo.name
          );
        }
      );

      const response =
        await fetch(
          "/api/reports/generate",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${idToken}`,
            },

            body: formData,
          }
        );

      if (!response.ok) {
        let message =
          "The PDF report could not be generated.";

        try {
          const errorData =
            (await response.json()) as {
              error?: string;
              code?: string;
            };

          if (errorData.error) {
            message =
              errorData.error;
          }

          if (
            errorData.code ===
            "PDF_EXPORT_REQUIRED"
          ) {
            message =
              "A PDF export credit or DOST Premium subscription is required.";
          }

          if (
            errorData.code ===
            "PDF_CREDIT_UNAVAILABLE"
          ) {
            message =
              "The PDF export credit is no longer available. Please try again.";
          }
        } catch {
          // Keep the default message.
        }

        setReportError(message);
        return;
      }

      const pdfBlob =
        await response.blob();

      const contentDisposition =
        response.headers.get(
          "content-disposition"
        );

      const fileNameMatch =
        contentDisposition?.match(
          /filename="([^"]+)"/i
        );

      const reportId =
        response.headers.get(
          "x-dost-report-id"
        );

      const fileName =
        fileNameMatch?.[1] ??
        (
          reportId
            ? `DOST-${reportId}.pdf`
            : "DOST-PDF-Report.pdf"
        );

      const objectUrl =
        URL.createObjectURL(
          pdfBlob
        );

      const downloadLink =
        document.createElement(
          "a"
        );

      downloadLink.href =
        objectUrl;

      downloadLink.download =
        fileName;

      document.body.appendChild(
        downloadLink
      );

      downloadLink.click();

      downloadLink.remove();

      window.setTimeout(
        () => {
          URL.revokeObjectURL(
            objectUrl
          );
        },
        1000
      );

      setReportBuilderOpen(false);
    } catch (error) {
      console.error(
        "Failed to generate CEq PDF report:",
        error
      );

      setReportError(
        "The PDF report could not be generated."
      );
    } finally {
      setGeneratingReport(false);
    }
  }

  async function handleSaveCalculation() {
    setSaveMessage("");
    setSaveError("");

    if (!user) {
      router.push("/login");
      return;
    }

    if (!canSaveCalculations) {
      router.push("/account");
      return;
    }

    if (result === null) {
      setSaveError(
        "Complete the calculation before saving."
      );

      return;
    }

    setSaving(true);

    try {
      await saveCalculation(
        user.uid,
        "carbon-equivalent",
        {
          carbon:
            Number(
              inputs.carbon
            ),
          manganese:
            Number(
              inputs.manganese
            ),
          chromium:
            Number(
              inputs.chromium
            ),
          molybdenum:
            Number(
              inputs.molybdenum
            ),
          vanadium:
            Number(
              inputs.vanadium
            ),
          nickel:
            Number(
              inputs.nickel
            ),
          copper:
            Number(
              inputs.copper
            ),
        },
        {
          carbonEquivalent:
            result,
          formula:
            "IIW CEq",
        }
      );

      setSaveMessage(
        "Calculation saved."
      );
    } catch (error) {
      console.error(
        "Failed to save CEq calculation:",
        error
      );

      setSaveError(
        "Calculation could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--dost-bg)] text-[var(--dost-text)]">
        <div className="rounded-2xl border border-cyan-500/20 bg-[var(--dost-surface-60)] px-8 py-6 text-center shadow-[0_0_40px_rgba(0,255,255,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            DOST Industries
          </p>

          <p className="mt-3 text-sm text-[var(--dost-muted)]">
            Loading...
          </p>
        </div>
      </main>
    );
  }

  const inputClassName =
    "h-[38px] sm:h-[54px] w-full rounded-lg sm:rounded-xl border border-cyan-500/20 bg-[var(--dost-input-bg)] px-3 sm:px-5 text-base sm:text-2xl text-[var(--dost-text)] transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/[0.03] focus:border-cyan-300 focus:outline-none focus:shadow-[0_0_18px_rgba(0,255,255,0.15)]";

  const invalidInputClassName =
    "border-red-500/70 focus:border-red-400 focus:shadow-[0_0_18px_rgba(239,68,68,0.15)]";

  const fields = [
    {
      key:
        "carbon" as const,
      label: "Carbon C (%)",
      icon: Sigma,
    },
    {
      key:
        "manganese" as const,
      label:
        "Manganese Mn (%)",
      icon: Activity,
    },
    {
      key:
        "chromium" as const,
      label: "Chromium Cr (%)",
      icon: Settings2,
    },
    {
      key:
        "molybdenum" as const,
      label:
        "Molybdenum Mo (%)",
      icon: Gauge,
    },
    {
      key:
        "vanadium" as const,
      label: "Vanadium V (%)",
      icon: Zap,
    },
    {
      key:
        "nickel" as const,
      label: "Nickel Ni (%)",
      icon: Flame,
    },
    {
      key:
        "copper" as const,
      label: "Copper Cu (%)",
      icon: Sigma,
    },
  ] as const;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--dost-bg)] text-[var(--dost-text)]">
      <div className="pointer-events-none absolute inset-0 dost-radial-bg" />
      <div className="pointer-events-none absolute inset-0 dost-grid-bg" />

      <header className="relative z-20 border-b border-cyan-500/20 bg-[var(--dost-surface-60)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-2 py-1 sm:px-6 sm:py-2">
          <button
            type="button"
            onClick={() =>
              setMenuOpen(true)
            }
            aria-label="Open navigation menu"
            aria-expanded={
              menuOpen
            }
            className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-[var(--dost-surface-40)] transition-all hover:border-cyan-400/60 sm:h-14 sm:w-14"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-[var(--dost-surface-40)] sm:h-12 sm:w-12">
              <Menu
                size={22}
                className="text-cyan-300"
              />
            </div>
          </button>

          <div className="text-center">
            <h1 className="text-[0.9rem] font-black uppercase italic leading-none tracking-[0.26em] sm:text-[2.4rem] sm:tracking-[0.7em]">
              <span className="text-[var(--dost-text)]">
                DOST
              </span>{" "}
              <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]">
                INDUSTRIES
              </span>
            </h1>

            <p className="mt-1 text-[0.48rem] uppercase tracking-[0.35em] text-[var(--dost-muted)] sm:text-sm sm:tracking-[0.45em]">
              Digital Welding & Engineering Tools
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                user
                  ? "/account"
                  : "/login"
              )
            }
            className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-[var(--dost-surface-40)] transition-all hover:border-cyan-400/60 sm:h-14 sm:w-14"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-[var(--dost-surface-40)] sm:h-12 sm:w-12">
              <User
                size={22}
                className="text-cyan-300"
              />
            </div>
          </button>
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

      <section className="relative z-10 mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-[28px] border border-cyan-500/30 bg-[var(--dost-surface-50)] p-4 shadow-[0_0_60px_rgba(0,255,255,0.12)] backdrop-blur-xl sm:rounded-[34px] sm:p-8">
            <div className="absolute left-0 top-0 h-20 w-20 rounded-tl-[28px] border-l border-t border-cyan-400/60 sm:h-24 sm:w-24 sm:rounded-tl-[34px]" />
            <div className="absolute right-0 top-0 h-20 w-20 rounded-tr-[28px] border-r border-t border-cyan-400/60 sm:h-24 sm:w-24 sm:rounded-tr-[34px]" />
            <div className="absolute bottom-0 left-0 h-20 w-20 rounded-bl-[28px] border-b border-l border-cyan-400/60 sm:h-24 sm:w-24 sm:rounded-bl-[34px]" />
            <div className="absolute bottom-0 right-0 h-20 w-20 rounded-br-[28px] border-b border-r border-cyan-400/60 sm:h-24 sm:w-24 sm:rounded-br-[34px]" />

            <div className="absolute inset-0 dost-panel-radial-bg" />

            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-center gap-3 sm:mb-8">
                <div className="h-px w-8 bg-cyan-500/40 sm:w-10" />

                <h2 className="whitespace-nowrap text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[var(--dost-text)] sm:text-[1.2rem] sm:tracking-[0.18em]">
                  CARBON EQUIVALENT
                  <span className="ml-2 text-cyan-300">
                    CALCULATOR
                  </span>
                </h2>

                <div className="h-px w-8 bg-cyan-500/40 sm:w-10" />
              </div>

              <div className="space-y-0">
                {fields.map(
                  ({
                    key,
                    label,
                    icon,
                  }) => (
                    <InputRow
                      key={key}
                      icon={icon}
                      label={label}
                    >
                      <div>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max="100"
                          step="0.001"
                          value={
                            inputs[key]
                          }
                          onChange={(
                            event
                          ) =>
                            setField(
                              key,
                              event.target.value
                            )
                          }
                          aria-invalid={
                            Boolean(
                              validationErrors[
                                key
                              ]
                            )
                          }
                          className={`${inputClassName} ${
                            validationErrors[
                              key
                            ]
                              ? invalidInputClassName
                              : ""
                          }`}
                        />

                        {validationErrors[
                          key
                        ] && (
                          <p className="mt-1 text-xs text-red-400">
                            {
                              validationErrors[
                                key
                              ]
                            }
                          </p>
                        )}
                      </div>
                    </InputRow>
                  )
                )}
              </div>

              <div className="relative mt-2 h-5 sm:h-8">
                <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b border-l border-cyan-400/60 sm:h-10 sm:w-10" />
                <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b border-r border-cyan-400/60 sm:h-10 sm:w-10" />
              </div>

              <ResultCard
                result={result}
                label="Carbon Equivalent"
                unit=""
                decimals={3}
              />

              <p className="mt-3 text-center text-[0.62rem] uppercase tracking-[0.11em] text-[var(--dost-muted)]">
                IIW formula · factual calculation only
              </p>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={
                    handleOpenReportBuilder
                  }
                  disabled={
                    result === null
                  }
                  className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-cyan-300/50 bg-cyan-400/[0.08] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200 shadow-[0_0_25px_rgba(0,255,255,0.06)] transition-all duration-300 hover:border-cyan-200/80 hover:bg-cyan-400/[0.15] hover:shadow-[0_0_35px_rgba(0,255,255,0.12)] disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(0,255,255,0.05),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <FileDown
                    size={18}
                    className="relative"
                  />

                  <span className="relative">
                    {!user
                      ? "Sign in to export PDF"
                      : "Export PDF"}
                  </span>
                </button>

                <p className="mt-2 text-center text-[0.7rem] uppercase tracking-[0.12em] text-[var(--dost-muted-strong)]">
                  Calculation report
                </p>

                {reportError && (
                  <p className="mt-2 text-center text-xs text-red-400">
                    {reportError}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() =>
                    void handleSaveCalculation()
                  }
                  disabled={
                    saving ||
                    result === null
                  }
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 transition-all duration-300 hover:border-cyan-300/60 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                >
                  <Save size={18} />

                  {saving
                    ? "Saving..."
                    : !user
                      ? "Sign in to save"
                      : canSaveCalculations
                        ? "Save calculation"
                        : "Unlock calculation saving"}
                </button>

                {!user && (
                  <p className="mt-2 text-center text-xs text-[var(--dost-muted)]">
                    Sign in to use saved calculations.
                  </p>
                )}

                {user &&
                  !canSaveCalculations && (
                    <p className="mt-2 text-center text-xs text-[var(--dost-muted)]">
                      Calculation saving is included with DOST Premium.
                    </p>
                  )}

                {saveMessage && (
                  <p className="mt-2 text-center text-xs text-emerald-400">
                    {saveMessage}
                  </p>
                )}

                {saveError && (
                  <p className="mt-2 text-center text-xs text-red-400">
                    {saveError}
                  </p>
                )}
              </div>

              <AdBanner />

              <MoreTools />
            </div>
          </div>
        </div>
      </section>

      <ReportBuilderDialog
        open={
          reportBuilderOpen
        }
        reportTitle="PDF Report"
        reportSubtitle="Carbon Equivalent Calculation"
        calculationData={
          reportCalculationData
        }
        formula={FORMULA}
        generating={
          generatingReport
        }
        onClose={() =>
          setReportBuilderOpen(false)
        }
        onGenerate={
          handleGenerateReport
        }
      />
    </main>
  );
}
