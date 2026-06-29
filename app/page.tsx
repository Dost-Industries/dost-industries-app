"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Flame,
  Gauge,
  Menu,
  Settings2,
  User,
  Zap,
} from "lucide-react";

import InputRow from "./components/InputRow";
import ResultCard from "./components/ResultCard";
import PremiumPanel from "./components/PremiumPanel";
import MoreTools from "./components/MoreTools";
import {
  calculateHeatInput,
  PROCESS_EFFICIENCY,
  type WeldingProcess,
} from "../lib/heat-input";

export default function Home() {
  const [voltage, setVoltage] = useState("");
  const [amperage, setAmperage] = useState("");
  const [speed, setSpeed] = useState("");

  const [useFactor, setUseFactor] = useState(true);
  const [processName, setProcessName] = useState<WeldingProcess>("MIG / MAG");
  const [efficiency, setEfficiency] = useState(PROCESS_EFFICIENCY["MIG / MAG"]);

  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    setResult(
      calculateHeatInput(voltage, amperage, speed, efficiency, useFactor)
    );
  }, [voltage, amperage, speed, efficiency, useFactor]);

  const inputClassName =
    "h-[38px] sm:h-[54px] w-full rounded-lg sm:rounded-xl border border-cyan-500/20 bg-black/70 px-3 sm:px-5 text-base sm:text-2xl text-white transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/[0.03] focus:border-cyan-300 focus:outline-none focus:shadow-[0_0_18px_rgba(0,255,255,0.15)]";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-[-260px] left-1/2 h-[950px] w-[950px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute left-[-220px] top-[220px] h-[480px] w-[480px] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <header className="relative z-20 border-b border-cyan-500/20 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-2 py-1 sm:px-6 sm:py-2">
          <button className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-black/40 transition-all hover:border-cyan-400/60 sm:h-14 sm:w-14">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-black/40 sm:h-12 sm:w-12">
              <Menu size={22} className="text-cyan-300" />
            </div>
          </button>

          <div className="text-center">
            <h1 className="text-[0.9rem] font-black uppercase italic leading-none tracking-[0.26em] sm:text-[2.4rem] sm:tracking-[0.7em]">
              <span className="text-white">DOST</span>{" "}
              <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]">
                INDUSTRIES
              </span>
            </h1>

            <p className="mt-1 text-[0.48rem] uppercase tracking-[0.35em] text-zinc-500 sm:text-sm sm:tracking-[0.45em]">
              ADVANCED WELDING SOFTWARE
            </p>
          </div>

          <button className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-black/40 transition-all hover:border-cyan-400/60 sm:h-14 sm:w-14">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-black/40 sm:h-12 sm:w-12">
              <User size={20} className="text-cyan-300" />
            </div>
          </button>
        </div>
      </header>

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
                  <span className="ml-2 text-cyan-300">CALCULATOR</span>
                </h2>

                <div className="h-px w-8 bg-cyan-500/40 sm:w-10" />
              </div>

              <div className="space-y-0">
                <InputRow icon={Zap} label="Voltage (V)">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value)}
                    className={inputClassName}
                  />
                </InputRow>

                <InputRow icon={Activity} label="Amperage (A)">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={amperage}
                    onChange={(e) => setAmperage(e.target.value)}
                    className={inputClassName}
                  />
                </InputRow>

                <InputRow icon={Gauge} label="Travel Speed (mm/min)">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    className={inputClassName}
                  />
                </InputRow>

                <InputRow icon={Flame} label="Process">
                  <select
                    value={processName}
                    onChange={(e) => {
                      const selected = e.target.value as WeldingProcess;
                      setProcessName(selected);
                      setEfficiency(PROCESS_EFFICIENCY[selected]);
                    }}
                    style={{ backgroundColor: "#020617", color: "#ffffff" }}
                    className={`${inputClassName} appearance-none`}
                  >
                    <option value="MIG / MAG">MIG / MAG</option>
                    <option value="TIG">TIG</option>
                    <option value="Elektrode">Elektrode</option>
                    <option value="SAW">SAW</option>
                  </select>
                </InputRow>

                <InputRow icon={Settings2} label="K-Factor">
                  <div className="flex h-full items-center justify-end">
                    <button
                      onClick={() => setUseFactor(!useFactor)}
                      className={`relative h-7 w-14 rounded-full transition-all duration-300 sm:h-10 sm:w-20 ${
                        useFactor ? "bg-cyan-400/90" : "bg-zinc-800"
                      }`}
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

              <ResultCard result={result} />

              <PremiumPanel />

              <MoreTools />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}