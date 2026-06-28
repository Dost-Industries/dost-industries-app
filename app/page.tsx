"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  Flame,
  Gauge,
  Menu,
  Plus,
  Settings2,
  User,
  Wand2,
  Zap,
} from "lucide-react";

const processes = {
  "MIG / MAG": 0.8,
  TIG: 0.6,
  Elektrode: 0.75,
  SAW: 1.0,
};

type ProcessName = keyof typeof processes;

type InputRowProps = {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
};

function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute top-[-260px] left-1/2 h-[950px] w-[950px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute left-[-220px] top-[220px] h-[480px] w-[480px] rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-[-260px] bottom-[-260px] h-[520px] w-[520px] rounded-full bg-cyan-300/5 blur-3xl" />
    </div>
  );
}

function Navbar() {
  return (
    <header className="relative z-20 border-b border-cyan-500/20 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-2 py-1 sm:px-6 sm:py-2">
        <button className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-black/40 transition-all hover:border-cyan-400/60 sm:h-14 sm:w-14">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-black/40 backdrop-blur-xl sm:h-12 sm:w-12">
            <Menu size={22} className="text-cyan-300" />
            <div className="absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.08)]" />
          </div>
        </button>

        <div className="text-center">
          <h1 className="text-[0.88rem] font-black uppercase italic leading-none tracking-[0.24em] text-white sm:text-[2.4rem] sm:tracking-[0.7em]">
            <span>DOST</span>{" "}
            <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]">
              INDUSTRIES
            </span>
          </h1>

          <p className="mt-1 text-[0.48rem] uppercase tracking-[0.32em] text-zinc-500 sm:text-sm sm:tracking-[0.45em]">
            ADVANCED WELDING SOFTWARE
          </p>
        </div>

        <button className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-black/40 transition-all hover:border-cyan-400/60 sm:h-14 sm:w-14">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-black/40 backdrop-blur-xl sm:h-12 sm:w-12">
            <User size={20} className="text-cyan-300" />
            <div className="absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.08)]" />
          </div>
        </button>
      </div>
    </header>
  );
}

function InputRow({ icon: Icon, label, children }: InputRowProps) {
  return (
    <div className="group grid grid-cols-[38px_1fr] items-center gap-x-3 border-b border-cyan-500/10 py-2 transition-all duration-300 hover:border-cyan-400/30 sm:grid-cols-[56px_1fr_170px] sm:gap-x-4 sm:py-3">
      <div className="flex justify-center">
        <Icon
          size={22}
          className="text-cyan-400/70 transition-all duration-300 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_12px_rgba(0,255,255,0.9)] sm:h-7 sm:w-7"
        />
      </div>

      <div>
        <p className="mb-1 text-[11px] uppercase tracking-[0.22em] text-zinc-400 sm:text-sm sm:tracking-[0.28em]">
          {label}
        </p>
      </div>

      <div className="col-span-2 mt-2 sm:col-span-1 sm:mt-0">{children}</div>
    </div>
  );
}

function NumericInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min="0"
      step="0.01"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-[46px] w-full rounded-xl border border-cyan-500/20 bg-black/70 px-4 text-xl text-white transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/[0.03] focus:border-cyan-300 focus:outline-none focus:shadow-[0_0_18px_rgba(0,255,255,0.15)] sm:h-[54px] sm:px-5 sm:text-2xl"
    />
  );
}

function ResultCard({
  result,
  processName,
  efficiency,
  useFactor,
}: {
  result: number | null;
  processName: ProcessName;
  efficiency: number;
  useFactor: boolean;
}) {
  return (
    <div className="group relative mt-7 overflow-hidden rounded-[24px] border border-cyan-400/30 bg-black/70 backdrop-blur-xl shadow-[0_0_95px_rgba(0,255,255,0.13)] transition-all duration-500 hover:shadow-[0_0_130px_rgba(0,255,255,0.22)] sm:mt-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,255,255,0.12),transparent_70%)]" />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:18px_18px]" />

      <div className="absolute left-4 top-4 h-9 w-9 rounded-tl-xl border-l border-t border-cyan-400/50" />
      <div className="absolute right-4 top-4 h-9 w-9 rounded-tr-xl border-r border-t border-cyan-400/50" />
      <div className="absolute bottom-4 left-4 h-9 w-9 rounded-bl-xl border-b border-l border-cyan-400/30" />
      <div className="absolute bottom-4 right-4 h-9 w-9 rounded-br-xl border-b border-r border-cyan-400/30" />

      <div className="relative z-10 pt-6 text-center sm:pt-8">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-400 sm:text-sm">
          Heat Input
        </p>

        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="h-[1px] w-12 bg-cyan-500/30 sm:w-16" />
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
          <div className="h-[1px] w-12 bg-cyan-500/30 sm:w-16" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="absolute h-[260px] w-[260px] rounded-full bg-cyan-400/10 blur-3xl sm:h-[320px] sm:w-[320px]" />
        <div className="absolute h-[150px] w-[150px] animate-pulse rounded-full bg-cyan-300/20 blur-2xl sm:h-[180px] sm:w-[180px]" />

        <div className="relative flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
          <Wand2
            size={50}
            className="text-cyan-400/80 transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_18px_rgba(0,255,255,0.7)] sm:h-[68px] sm:w-[68px]"
          />

          <p className="text-[3.4rem] font-black tracking-[0.04em] text-cyan-300 transition-all duration-500 group-hover:drop-shadow-[0_0_18px_rgba(0,255,255,0.35)] sm:text-[6rem] sm:tracking-[0.08em] lg:text-[9rem]">
            {result ?? "--"}
          </p>
        </div>

        <p className="mt-1 text-xl font-light tracking-[0.38em] text-cyan-300 sm:mt-3 sm:text-3xl sm:tracking-[0.45em]">
          kJ/mm
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:mt-6 sm:gap-4">
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-400/5 px-3 py-2 sm:px-4">
            <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:text-xs sm:tracking-[0.28em]">
              Process
            </p>
            <p className="text-sm tracking-[0.14em] text-cyan-300 sm:text-base sm:tracking-[0.18em]">
              {processName}
            </p>
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-400/5 px-3 py-2 sm:px-4">
            <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:text-xs sm:tracking-[0.28em]">
              Efficiency
            </p>
            <p className="text-sm tracking-[0.14em] text-cyan-300 sm:text-base sm:tracking-[0.18em]">
              {useFactor ? efficiency : "OFF"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumPanel() {
  return (
    <div className="relative mt-7 overflow-hidden rounded-[24px] border border-cyan-400/20 bg-black/50 p-5 shadow-[0_0_40px_rgba(0,255,255,0.08)] backdrop-blur-xl sm:mt-8 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.08),transparent_70%)]" />

      <div className="absolute left-4 top-4 h-7 w-7 rounded-tl-lg border-l border-t border-cyan-400/40" />
      <div className="absolute right-4 top-4 h-7 w-7 rounded-tr-lg border-r border-t border-cyan-400/40" />
      <div className="absolute bottom-4 left-4 h-7 w-7 rounded-bl-lg border-b border-l border-cyan-400/20" />
      <div className="absolute bottom-4 right-4 h-7 w-7 rounded-br-lg border-b border-r border-cyan-400/20" />

      <div className="relative z-10 flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.32em] text-cyan-400 sm:text-xs sm:tracking-[0.35em]">
            Premium Upgrade
          </p>

          <h3 className="text-lg font-semibold uppercase tracking-[0.14em] text-white sm:text-2xl sm:tracking-[0.18em]">
            Remove Advertisements
          </h3>

          <p className="mt-2 max-w-[520px] text-sm leading-relaxed tracking-[0.06em] text-zinc-400 sm:mt-3 sm:text-base sm:tracking-[0.08em]">
            Unlock a clean professional workspace and support advanced welding
            software development.
          </p>
        </div>

        <button className="group relative w-full overflow-hidden rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-6 py-4 font-semibold uppercase tracking-[0.18em] text-cyan-300 transition-all duration-300 hover:bg-cyan-400/20 hover:shadow-[0_0_35px_rgba(0,255,255,0.35)] sm:w-auto sm:px-8 sm:py-5 sm:tracking-[0.22em]">
          <div className="absolute inset-0 opacity-0 transition-all duration-500 group-hover:opacity-100 bg-[radial-gradient(circle,rgba(0,255,255,0.22),transparent_70%)]" />
          <span className="relative z-10">€0.09 p/mth</span>
        </button>
      </div>
    </div>
  );
}

function MoreTools() {
  const items = Array.from({ length: 6 });

  return (
    <div className="mt-8 rounded-[30px] border border-cyan-500/20 bg-black/40 p-5 backdrop-blur-xl sm:mt-10 sm:p-8">
      <div className="relative mb-7 flex h-10 items-center justify-center sm:mb-8">
        <div className="absolute left-10 right-[58%] top-1/2 h-[1px] -translate-y-1/2 bg-cyan-500/30 sm:left-14 sm:right-[55%]" />
        <div className="absolute right-10 left-[58%] top-1/2 h-[1px] -translate-y-1/2 bg-cyan-500/30 sm:right-14 sm:left-[55%]" />

        <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l border-t border-cyan-400/40" />
        <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r border-t border-cyan-400/40" />

        <p className="relative z-10 bg-black/40 px-5 text-sm uppercase tracking-[0.28em] text-white sm:text-xl sm:tracking-[0.35em]">
          More Tools
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 text-center sm:grid-cols-6 sm:gap-8">
        {items.map((_, index) => (
          <div
            key={index}
            className="group space-y-2 transition-all duration-300 hover:-translate-y-1 sm:space-y-3"
          >
            <Plus
              className="mx-auto text-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_14px_rgba(0,255,255,0.8)]"
              size={34}
            />
            <p className="text-[10px] tracking-[0.12em] text-cyan-300 sm:text-sm">
              COMING SOON
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [voltage, setVoltage] = useState("");
  const [amperage, setAmperage] = useState("");
  const [speed, setSpeed] = useState("");
  const [useFactor, setUseFactor] = useState(true);
  const [processName, setProcessName] = useState<ProcessName>("MIG / MAG");
  const [efficiency, setEfficiency] = useState(processes["MIG / MAG"]);
  const [result, setResult] = useState<number | null>(null);

  const isInvalid =
    !voltage ||
    !amperage ||
    !speed ||
    Number(voltage) <= 0 ||
    Number(amperage) <= 0 ||
    Number(speed) <= 0;

  const calculateHeatInput = () => {
    const V = parseFloat(voltage);
    const A = parseFloat(amperage);
    const S = parseFloat(speed);

    if (isNaN(V) || isNaN(A) || isNaN(S) || V <= 0 || A <= 0 || S <= 0) {
      setResult(null);
      return;
    }

    const factor = useFactor ? efficiency : 1;
    const hi = (V * A * 60 * factor) / (1000 * S);

    if (!isFinite(hi)) {
      setResult(null);
      return;
    }

    setResult(Number(hi.toFixed(2)));
  };

  useEffect(() => {
    calculateHeatInput();
  }, [voltage, amperage, speed, efficiency, useFactor]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <Background />
      <Navbar />

      <section className="relative z-10 mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="relative min-h-[660px] overflow-hidden rounded-[30px] border border-cyan-500/30 bg-black/50 p-4 shadow-[0_0_60px_rgba(0,255,255,0.12)] backdrop-blur-xl sm:min-h-[820px] sm:rounded-[34px] sm:p-8">
            <div className="absolute left-0 top-0 h-20 w-20 rounded-tl-[30px] border-l border-t border-cyan-400/50 sm:h-24 sm:w-24 sm:rounded-tl-[34px]" />
            <div className="absolute right-0 top-0 h-20 w-20 rounded-tr-[30px] border-r border-t border-cyan-400/50 sm:h-24 sm:w-24 sm:rounded-tr-[34px]" />
            <div className="absolute bottom-0 left-0 h-20 w-20 rounded-bl-[30px] border-b border-l border-cyan-400/50 sm:h-24 sm:w-24 sm:rounded-bl-[34px]" />
            <div className="absolute bottom-0 right-0 h-20 w-20 rounded-br-[30px] border-b border-r border-cyan-400/50 sm:h-24 sm:w-24 sm:rounded-br-[34px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.08),transparent_60%)]" />

            <div className="relative z-10">
              <div className="mb-5 flex items-center justify-center gap-3 sm:mb-8">
                <div className="h-[1px] w-7 bg-cyan-500/40 sm:w-10" />

                <h2 className="whitespace-nowrap text-[0.72rem] font-semibold uppercase tracking-[0.13em] text-white sm:text-[1.35rem] sm:tracking-[0.22em]">
                  HEAT INPUT
                  <span className="ml-2 text-cyan-300">CALCULATOR</span>
                </h2>

                <div className="h-[1px] w-7 bg-cyan-500/40 sm:w-10" />
              </div>

              <div className="space-y-0">
                <InputRow icon={Zap} label="Voltage (V)">
                  <NumericInput value={voltage} onChange={setVoltage} />
                </InputRow>

                <InputRow icon={Activity} label="Amperage (A)">
                  <NumericInput value={amperage} onChange={setAmperage} />
                </InputRow>

                <InputRow icon={Gauge} label="Travel Speed (mm/min)">
                  <NumericInput value={speed} onChange={setSpeed} />
                </InputRow>

                <InputRow icon={Flame} label="Process">
                  <select
                    value={processName}
                    onChange={(e) => {
                      const selected = e.target.value as ProcessName;
                      setProcessName(selected);
                      setEfficiency(processes[selected]);
                    }}
                    style={{
                      backgroundColor: "#020617",
                      color: "#ffffff",
                    }}
                    className="h-[46px] w-full appearance-none rounded-xl border border-cyan-500/20 bg-black/70 px-4 text-xl text-white transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/[0.03] focus:border-cyan-300 focus:outline-none focus:shadow-[0_0_18px_rgba(0,255,255,0.15)] sm:h-[54px] sm:px-5 sm:text-2xl"
                  >
                    {Object.keys(processes).map((process) => (
                      <option key={process} value={process}>
                        {process}
                      </option>
                    ))}
                  </select>
                </InputRow>

                <InputRow icon={Settings2} label="K-Factor">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setUseFactor(!useFactor)}
                      className={`relative h-9 w-18 rounded-full transition-all duration-300 sm:h-10 sm:w-20 ${
                        useFactor ? "bg-cyan-400/90" : "bg-zinc-800"
                      }`}
                    >
                      <div
                        className={`absolute top-1 h-7 w-7 rounded-full bg-black transition-all duration-300 sm:h-8 sm:w-8 ${
                          useFactor ? "left-10 sm:left-11" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </InputRow>
              </div>

              <div className="relative mt-2 h-6 sm:h-8">
                <div className="absolute bottom-0 left-0 h-9 w-9 rounded-bl-xl border-b border-l border-cyan-400/50 sm:h-10 sm:w-10" />
                <div className="absolute bottom-0 right-0 h-9 w-9 rounded-br-xl border-b border-r border-cyan-400/50 sm:h-10 sm:w-10" />
              </div>

              <div className="h-4" />

              <button
                onClick={calculateHeatInput}
                disabled={isInvalid}
                className={`group relative w-full overflow-hidden rounded-[22px] py-4 text-lg font-bold tracking-[0.26em] transition-all duration-300 sm:py-5 sm:text-xl sm:tracking-[0.45em] ${
                  isInvalid
                    ? "cursor-not-allowed border border-zinc-800 bg-zinc-900/40 text-zinc-600"
                    : "border border-cyan-300/60 bg-cyan-400/15 text-cyan-200 hover:scale-[1.01] hover:border-cyan-200 hover:bg-cyan-400/25 hover:shadow-[0_0_60px_rgba(0,255,255,0.45)]"
                }`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,255,255,0.18),transparent_70%)]" />
                <div className="absolute inset-0 opacity-0 transition-all duration-500 group-hover:opacity-100 bg-[radial-gradient(circle,rgba(0,255,255,0.35),transparent_70%)]" />
                <div className="absolute top-0 left-[10%] h-[1px] w-[80%] bg-cyan-300/60" />
                <div className="absolute bottom-0 left-[10%] h-[1px] w-[80%] bg-cyan-300/40" />

                <span className="relative z-10 flex items-center justify-center gap-3 sm:gap-5">
                  <div className="hidden items-center gap-2 sm:flex">
                    <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(0,255,255,0.9)]" />
                    <div className="h-[1px] w-10 bg-cyan-300/40" />
                  </div>

                  CALCULATE

                  <ArrowRight
                    size={24}
                    className="text-cyan-200 transition-all duration-300 group-hover:translate-x-1 sm:h-[26px] sm:w-[26px]"
                  />

                  <div className="hidden items-center gap-2 sm:flex">
                    <div className="h-[1px] w-10 bg-cyan-300/40" />
                    <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(0,255,255,0.9)]" />
                  </div>
                </span>
              </button>

              <ResultCard
                result={result}
                processName={processName}
                efficiency={efficiency}
                useFactor={useFactor}
              />

              <PremiumPanel />
              <MoreTools />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
