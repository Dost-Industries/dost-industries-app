"use client";

import { useState } from "react";
import {
  Activity,
  FileDown,
  Flame,
  Gauge,
  Menu,
  Save,
  Settings2,
  User,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "../hooks/useAuth";
import InputRow from "./components/InputRow";
import ResultCard from "./components/ResultCard";
import AdBanner from "./components/AdBanner";
import MoreTools from "./components/MoreTools";
import NavigationMenu from "./components/NavigationMenu";
import ReportBuilderDialog, {
  type ReportBuilderDetails,
} from "./components/reports/ReportBuilderDialog";

import {
  calculateHeatInput,
  PROCESS_EFFICIENCY,
  type WeldingProcess,
} from "../lib/heat-input";

import {
  hasHeatInputValidationErrors,
  validateHeatInputFields,
} from "../lib/heat-input-validation";

import {
  ENTITLEMENTS,
  hasEntitlement,
} from "../lib/entitlements";

import {
  saveCalculation,
} from "../firebase/calculations";

export default function Home() {
  const router = useRouter();

  const {
    user,
    profile,
    loading,
  } = useAuth();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [voltage, setVoltage] =
    useState("");

  const [amperage, setAmperage] =
    useState("");

  const [speed, setSpeed] =
    useState("");

  const [useFactor, setUseFactor] =
    useState(true);

  const [processName, setProcessName] =
    useState<WeldingProcess>(
      "MIG / MAG"
    );

  const [efficiency, setEfficiency] =
    useState(
      PROCESS_EFFICIENCY["MIG / MAG"]
    );

  const [saving, setSaving] =
    useState(false);

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
    validateHeatInputFields(
      voltage,
      amperage,
      speed
    );

  const hasValidationErrors =
    hasHeatInputValidationErrors(
      validationErrors
    );

  const result = hasValidationErrors
    ? null
    : calculateHeatInput(
        voltage,
        amperage,
        speed,
        efficiency,
        useFactor
      );

  const canSaveCalculations =
    hasEntitlement(
      profile?.entitlements,
      ENTITLEMENTS.SAVE_CALCULATIONS
    );

  const reportCalculationData = [
    {
      label: "Voltage",
      value: voltage
        ? `${voltage} V`
        : "—",
    },
    {
      label: "Amperage",
      value: amperage
        ? `${amperage} A`
        : "—",
    },
    {
      label: "Travel Speed",
      value: speed
        ? `${speed} mm/min`
        : "—",
    },
    {
      label: "Process",
      value: processName,
    },
    {
      label: "K-Factor",
      value: useFactor
        ? efficiency.toFixed(2)
        : "Not applied",
    },
    {
      label: "Heat Input",
      value:
        result !== null
          ? `${result.toFixed(
              2
            )} kJ/mm`
          : "—",
      highlight: true,
    },
  ];

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

      const formData =
        new FormData();

      formData.set(
        "moduleId",
        "heat-input"
      );

      formData.set(
        "voltage",
        voltage
      );

      formData.set(
        "amperage",
        amperage
      );

      formData.set(
        "travelSpeed",
        speed
      );

      formData.set(
        "process",
        processName
      );

      formData.set(
        "useFactor",
        String(useFactor)
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
        (reportId
          ? `DOST-${reportId}.pdf`
          : "DOST-PDF-Report.pdf");

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
        "Failed to generate PDF report:",
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
        "heat-input",
        {
          voltage: Number(voltage),
          amperage: Number(amperage),
          travelSpeed: Number(speed),
          process: processName,
          useFactor,
          efficiency: useFactor
            ? efficiency
            : 1,
        },
        {
          heatInput: result,
          unit: "kJ/mm",
        }
      );

      setSaveMessage(
        "Calculation saved."
      );
    } catch (error) {
      console.error(
        "Failed to save calculation:",
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
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="rounded-2xl border border-cyan-500/20 bg-black/60 px-8 py-6 text-center shadow-[0_0_40px_rgba(0,255,255,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            DOST Industries
          </p>

          <p className="mt-3 text-sm text-zinc-500">
            Loading...
          </p>
        </div>
      </main>
    );
  }

  const inputClassName =
    "h-[38px] sm:h-[54px] w-full rounded-lg sm:rounded-xl border border-cyan-500/20 bg-black/70 px-3 sm:px-5 text-base sm:text-2xl text-white transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/[0.03] focus:border-cyan-300 focus:outline-none focus:shadow-[0_0_18px_rgba(0,255,255,0.15)]";

  const invalidInputClassName =
    "border-red-500/70 focus:border-red-400 focus:shadow-[0_0_18px_rgba(239,68,68,0.15)]";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.07),transparent_45%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <header className="relative z-20 border-b border-cyan-500/20 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-2 py-1 sm:px-6 sm:py-2">
          <button
            type="button"
            onClick={() =>
              setMenuOpen(true)
            }
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-black/40 transition-all hover:border-cyan-400/60 sm:h-14 sm:w-14"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-black/40 sm:h-12 sm:w-12">
              <Menu
                size={22}
                className="text-cyan-300"
              />
            </div>
          </button>

          <div className="text-center">
            <h1 className="text-[0.9rem] font-black uppercase italic leading-none tracking-[0.26em] sm:text-[2.4rem] sm:tracking-[0.7em]">
              <span className="text-white">
                DOST
              </span>{" "}
              <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]">
                INDUSTRIES
              </span>
            </h1>

            <p className="mt-1 text-[0.48rem] uppercase tracking-[0.35em] text-zinc-500 sm:text-sm sm:tracking-[0.45em]">
              Digital Welding & Engineering
              Tools
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
            className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-black/40 transition-all hover:border-cyan-400/60 sm:h-14 sm:w-14"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-black/40 sm:h-12 sm:w-12">
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
        isAuthenticated={Boolean(user)}
        onClose={() =>
          setMenuOpen(false)
        }
      />

      <section className="relative z-10 mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-[28px] border border-cyan-500/30 bg-black/50 p-4 shadow-[0_0_60px_rgba(0,255,255,0.12)] backdrop-blur-xl sm:rounded-[34px] sm:p-8">
            <div className="absolute left-0 top-0 h-20 w-20 rounded-tl-[28px] border-l border-t border-cyan-400/60 sm:h-24 sm:w-24 sm:rounded-tl-[34px]" />

            <div className="absolute right-0 top-0 h-20 w-20 rounded-tr-[28px] border-r border-t border-cyan-400/60 sm:h-24 sm:w-24 sm:rounded-tr-[34px]" />

            <div className="absolute bottom-0 left-0 h-20 w-20 rounded-bl-[28px] border-b border-l border-cyan-400/60 sm:h-24 sm:w-24 sm:rounded-bl-[34px]" />

            <div className="absolute bottom-0 right-0 h-20 w-20 rounded-br-[28px] border-b border-r border-cyan-400/60 sm:h-24 sm:w-24 sm:rounded-br-[34px]" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.08),transparent_60%)]" />

            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-center gap-3 sm:mb-8">
                <div className="h-px w-8 bg-cyan-500/40 sm:w-10" />

                <h2 className="whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white sm:text-[1.35rem] sm:tracking-[0.22em]">
                  HEAT INPUT
                  <span className="ml-2 text-cyan-300">
                    CALCULATOR
                  </span>
                </h2>

                <div className="h-px w-8 bg-cyan-500/40 sm:w-10" />
              </div>

              <div className="space-y-0">
                <InputRow
                  icon={Zap}
                  label="Voltage (V)"
                >
                  <div>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={voltage}
                      onChange={(e) =>
                        setVoltage(
                          e.target.value
                        )
                      }
                      aria-invalid={Boolean(
                        validationErrors.voltage
                      )}
                      className={`${inputClassName} ${
                        validationErrors.voltage
                          ? invalidInputClassName
                          : ""
                      }`}
                    />

                    {validationErrors.voltage && (
                      <p className="mt-1 text-xs text-red-400">
                        {
                          validationErrors.voltage
                        }
                      </p>
                    )}
                  </div>
                </InputRow>

                <InputRow
                  icon={Activity}
                  label="Amperage (A)"
                >
                  <div>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={amperage}
                      onChange={(e) =>
                        setAmperage(
                          e.target.value
                        )
                      }
                      aria-invalid={Boolean(
                        validationErrors.amperage
                      )}
                      className={`${inputClassName} ${
                        validationErrors.amperage
                          ? invalidInputClassName
                          : ""
                      }`}
                    />

                    {validationErrors.amperage && (
                      <p className="mt-1 text-xs text-red-400">
                        {
                          validationErrors.amperage
                        }
                      </p>
                    )}
                  </div>
                </InputRow>

                <InputRow
                  icon={Gauge}
                  label="Travel Speed (mm/min)"
                >
                  <div>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={speed}
                      onChange={(e) =>
                        setSpeed(
                          e.target.value
                        )
                      }
                      aria-invalid={Boolean(
                        validationErrors.speed
                      )}
                      className={`${inputClassName} ${
                        validationErrors.speed
                          ? invalidInputClassName
                          : ""
                      }`}
                    />

                    {validationErrors.speed && (
                      <p className="mt-1 text-xs text-red-400">
                        {
                          validationErrors.speed
                        }
                      </p>
                    )}
                  </div>
                </InputRow>

                <InputRow
                  icon={Flame}
                  label="Process"
                >
                  <select
                    value={processName}
                    onChange={(e) => {
                      const selected =
                        e.target
                          .value as WeldingProcess;

                      setProcessName(
                        selected
                      );

                      setEfficiency(
                        PROCESS_EFFICIENCY[
                          selected
                        ]
                      );
                    }}
                    style={{
                      backgroundColor:
                        "#020617",
                      color: "#ffffff",
                    }}
                    className={`${inputClassName} appearance-none`}
                  >
                    <option value="MIG / MAG">
                      MIG / MAG
                    </option>

                    <option value="TIG">
                      TIG
                    </option>

                    <option value="Elektrode">
                      Elektrode
                    </option>

                    <option value="SAW">
                      SAW
                    </option>
                  </select>
                </InputRow>

                <InputRow
                  icon={Settings2}
                  label="K-Factor"
                >
                  <div className="flex h-full items-center justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setUseFactor(
                          (current) =>
                            !current
                        )
                      }
                      className={`relative h-7 w-14 rounded-full transition-all duration-300 sm:h-10 sm:w-20 ${
                        useFactor
                          ? "bg-cyan-400/90"
                          : "bg-zinc-800"
                      }`}
                      aria-pressed={
                        useFactor
                      }
                    >
                      <div
                        className={`absolute top-0.5 h-6 w-6 rounded-full bg-black transition-all duration-300 sm:top-1 sm:h-8 sm:w-8 ${
                          useFactor
                            ? "left-7 sm:left-11"
                            : "left-0.5 sm:left-1"
                        }`}
                      />
                    </button>
                  </div>
                </InputRow>
              </div>

              <div className="relative mt-2 h-5 sm:h-8">
                <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b border-l border-cyan-400/60 sm:h-10 sm:w-10" />

                <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b border-r border-cyan-400/60 sm:h-10 sm:w-10" />
              </div>

              <ResultCard
                result={result}
              />

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

                <p className="mt-2 text-center text-[0.7rem] uppercase tracking-[0.12em] text-zinc-600">
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
                  <p className="mt-2 text-center text-xs text-zinc-500">
                    Sign in to use saved
                    calculations.
                  </p>
                )}

                {user &&
                  !canSaveCalculations && (
                    <p className="mt-2 text-center text-xs text-zinc-500">
                      Calculation saving is
                      included with DOST
                      Premium.
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
        open={reportBuilderOpen}
        reportTitle="PDF Report"
        reportSubtitle="Heat Input Calculation"
        calculationData={
          reportCalculationData
        }
        formula={
          useFactor
            ? "HI = (V × A × 60 × k) / (1000 × S)"
            : "HI = (V × A × 60) / (1000 × S)"
        }
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
