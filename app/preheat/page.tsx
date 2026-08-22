"use client";

import {
  Activity,
  Droplets,
  FileDown,
  Flame,
  Gauge,
  Menu,
  Ruler,
  Save,
  Settings2,
  Sigma,
  ThermometerSun,
  User,
  Zap,
} from "lucide-react";
import {
  useMemo,
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
  calculatePreheat,
  type PreheatInputs,
} from "../../lib/preheat";

import {
  CET_RANGE,
  formatRange,
  hasCompletePreheatInputs,
  hasPreheatValidationErrors,
  validateCetRange,
  validatePreheatFields,
} from "../../lib/preheat-validation";

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
  "Tp = 697 x CET + 160 x tanh(d / 35) + 62 x HD^0.35 + (53 x CET - 32) x Q - 328";

export default function PreheatPage() {
  const router = useRouter();

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
  ] = useState<PreheatInputs>({
    carbon: "",
    manganese: "",
    molybdenum: "",
    chromium: "",
    copper: "",
    nickel: "",
    thickness: "",
    hydrogen: "",
    heatInput: "",
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

  const fieldErrors =
    useMemo(
      () =>
        validatePreheatFields(
          inputs
        ),
      [inputs]
    );

  const complete =
    hasCompletePreheatInputs(
      inputs
    );

  const rawCalculation =
    complete &&
    !hasPreheatValidationErrors(
      fieldErrors
    )
      ? calculatePreheat(inputs)
      : null;

  const cetError =
    validateCetRange(
      rawCalculation?.cet ??
        null
    );

  const validationErrors = {
    ...fieldErrors,
    ...(cetError
      ? {
          cet: cetError,
        }
      : {}),
  };

  const hasValidationErrors =
    hasPreheatValidationErrors(
      validationErrors
    );

  const calculation =
    hasValidationErrors
      ? null
      : rawCalculation;

  const result =
    calculation
      ? calculation.preheatTemperature
      : null;

  const canSaveCalculations =
    hasEntitlement(
      profile?.entitlements,
      ENTITLEMENTS.SAVE_CALCULATIONS
    );

  const reportCalculationData = [
    {
      label: "C / Mn",
      value:
        inputs.carbon &&
        inputs.manganese
          ? `${inputs.carbon} / ${inputs.manganese} %`
          : "-",
    },
    {
      label: "Mo / Cr",
      value:
        inputs.molybdenum &&
        inputs.chromium
          ? `${inputs.molybdenum} / ${inputs.chromium} %`
          : "-",
    },
    {
      label: "Cu / Ni",
      value:
        inputs.copper &&
        inputs.nickel
          ? `${inputs.copper} / ${inputs.nickel} %`
          : "-",
    },
    {
      label:
        "Plate Thickness",
      value: inputs.thickness
        ? `${inputs.thickness} mm`
        : "-",
    },
    {
      label:
        "Hydrogen Content",
      value: inputs.hydrogen
        ? `${inputs.hydrogen} ml/100g`
        : "-",
    },
    {
      label: "Heat Input",
      value: inputs.heatInput
        ? `${inputs.heatInput} kJ/mm`
        : "-",
    },
    {
      label: "CET",
      value:
        calculation
          ? `${calculation.cet.toFixed(
              3
            )} %`
          : "-",
    },
    {
      label:
        "Preheat Temperature",
      value:
        result !== null
          ? `${result.toFixed(
              0
            )} °C`
          : "-",
      highlight: true,
    },
  ];

  function setField(
    field: keyof PreheatInputs,
    value: string
  ) {
    setInputs(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setSaveMessage("");
    setSaveError("");
    setReportError("");
  }

  function handleOpenReportBuilder() {
    setReportError("");

    if (!user) {
      router.push("/login");
      return;
    }

    if (
      result === null ||
      !calculation
    ) {
      setReportError(
        "Complete a valid calculation before creating a report."
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

    if (
      result === null ||
      !calculation
    ) {
      setReportError(
        "Complete a valid calculation before creating a report."
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
        "preheat"
      );

      (
        Object.entries(
          inputs
        ) as Array<
          [
            keyof PreheatInputs,
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
          // Keep default message.
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
        "Failed to generate Preheat PDF report:",
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

    if (
      result === null ||
      !calculation
    ) {
      setSaveError(
        "Complete a valid calculation before saving."
      );
      return;
    }

    setSaving(true);

    try {
      await saveCalculation(
        user.uid,
        "preheat",
        {
          carbon:
            Number(
              inputs.carbon
            ),
          manganese:
            Number(
              inputs.manganese
            ),
          molybdenum:
            Number(
              inputs.molybdenum
            ),
          chromium:
            Number(
              inputs.chromium
            ),
          copper:
            Number(
              inputs.copper
            ),
          nickel:
            Number(
              inputs.nickel
            ),
          thickness:
            Number(
              inputs.thickness
            ),
          hydrogen:
            Number(
              inputs.hydrogen
            ),
          heatInput:
            Number(
              inputs.heatInput
            ),
        },
        {
          cet:
            calculation.cet,
          tpCet:
            calculation.tpCet,
          tpThickness:
            calculation.tpThickness,
          tpHydrogen:
            calculation.tpHydrogen,
          tpHeatInput:
            calculation.tpHeatInput,
          preheatTemperature:
            calculation.preheatTemperature,
          formula:
            "CET formula",
        }
      );

      setSaveMessage(
        "Calculation saved."
      );
    } catch (error) {
      console.error(
        "Failed to save Preheat calculation:",
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
        "molybdenum" as const,
      label:
        "Molybdenum Mo (%)",
      icon: Settings2,
    },
    {
      key:
        "chromium" as const,
      label: "Chromium Cr (%)",
      icon: Gauge,
    },
    {
      key:
        "copper" as const,
      label: "Copper Cu (%)",
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
        "thickness" as const,
      label:
        "Plate Thickness (mm)",
      icon: Ruler,
    },
    {
      key:
        "hydrogen" as const,
      label:
        "Hydrogen HD (ml/100g)",
      icon: Droplets,
    },
    {
      key:
        "heatInput" as const,
      label:
        "Heat Input Q (kJ/mm)",
      icon: ThermometerSun,
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
                  PREHEAT TEMPERATURE
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

                        <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[0.62rem] sm:text-xs">
                          <span className="uppercase tracking-[0.12em] text-[var(--dost-muted)]">
                            Range:{" "}
                            {formatRange(
                              key
                            )}
                          </span>

                          {validationErrors[
                            key
                          ] && (
                            <span className="text-red-400">
                              {
                                validationErrors[
                                  key
                                ]
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </InputRow>
                  )
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-[var(--dost-surface-30)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <Sigma
                    size={18}
                    className="shrink-0 text-cyan-300"
                  />

                  <div className="min-w-0">
                    <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                      CET formula
                    </p>

                    <p className="mt-1 text-sm text-[var(--dost-text)]">
                      {rawCalculation
                        ? rawCalculation.cet.toFixed(
                            3
                          )
                        : "-"}{" "}
                      %
                    </p>

                    <p className="mt-1 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--dost-muted)]">
                      Range:{" "}
                      {CET_RANGE.min}-
                      {CET_RANGE.max} %
                    </p>
                  </div>
                </div>

                {validationErrors.cet && (
                  <p className="mt-2 text-xs text-red-400">
                    {
                      validationErrors.cet
                    }
                  </p>
                )}
              </div>

              <div className="relative mt-2 h-5 sm:h-8">
                <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b border-l border-cyan-400/60 sm:h-10 sm:w-10" />
                <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b border-r border-cyan-400/60 sm:h-10 sm:w-10" />
              </div>

              <ResultCard
                result={result}
                label="Preheat Temperature"
                unit="°C"
                decimals={0}
              />

              <p className="mt-3 text-center text-[0.62rem] uppercase tracking-[0.11em] text-[var(--dost-muted)]">
                CET formula · factual calculation only
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
        reportSubtitle="Preheat Temperature Calculation"
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
