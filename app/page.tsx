"use client";

import { useState, useEffect } from "react";

import {
  Zap,
  Gauge,
  Flame,
  Wand2,
  Activity,
  ArrowRight,
  Shield,
  FileText,
  ClipboardList,
  Scale,
  BarChart3,
  Plus,
  Settings2,
  Menu,
  User,
} from "lucide-react";

export default function Home() {

  const [voltage, setVoltage] = useState("");
  const [amperage, setAmperage] = useState("");
  const [speed, setSpeed] = useState("");

  const [useFactor, setUseFactor] = useState(true);

  const [efficiency, setEfficiency] = useState(0.8);
  const [processName, setProcessName] = useState("MIG / MAG");

  const [result, setResult] = useState<number | null>(null);

  const calculateHeatInput = () => {

    const V = parseFloat(voltage);
    const A = parseFloat(amperage);
    const S = parseFloat(speed);
  
    // INVALID INPUTS
    if (
      isNaN(V) ||
      isNaN(A) ||
      isNaN(S) ||
      V <= 0 ||
      A <= 0 ||
      S <= 0
    ) {
      setResult(null);
      return;
    }
  
    const factor = useFactor ? efficiency : 1;
  
    const hi =
      (V * A * 60 * factor) /
      (1000 * S);
  
    // SAFETY CHECK
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

      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">

        {/* GRID */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* TOP GLOW */}
        <div className="absolute top-[-250px] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-cyan-500/10 blur-3xl" />

        {/* SIDE GLOW */}
        <div className="absolute left-[-200px] top-[200px] w-[500px] h-[500px] rounded-full bg-cyan-400/10 blur-3xl" />

      </div>

      {/* NAVBAR */}
<header className="relative z-20 border-b border-cyan-500/20 bg-black/60 backdrop-blur-xl">

<div className="max-w-5xl mx-auto flex items-center justify-between relative px-3 sm:px-6 py-2">

  {/* LEFT MENU */}
  <button className="group flex items-center justify-center w-14 h-14 rounded-2xl border border-cyan-500/20 bg-black/40 hover:border-cyan-400/60 transition-all">

  <div className="relative flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-xl border border-cyan-500/20 bg-black/40 backdrop-blur-xl">

<Menu size={22} className="text-cyan-300" />

<div className="absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.08)]" />

</div>

  </button>

  {/* BRAND */}
  <div className="text-center">

  <h1 className="text-[0.95rem] sm:text-[2.4rem] font-black tracking-[0.48em] sm:tracking-[0.7em] uppercase italic leading-none">

  <span className="text-white">
    DOST
  </span>

  {" "}

  <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]">
    INDUSTRIES
  </span>

</h1>

<p className="mt-2 text-[0.55rem] sm:text-sm tracking-[0.35em] sm:tracking-[0.45em] uppercase text-zinc-500">
  ADVANCED WELDING SOFTWARE
</p>

  </div>

  {/* ACCOUNT */}
  <button className="group flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-2xl border border-cyan-500/20 bg-black/40 hover:border-cyan-400/60 transition-all">

  <div className="relative flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-xl border border-cyan-500/20 bg-black/40 backdrop-blur-xl">

<User size={20} className="text-cyan-300" />

<div className="absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.08)]" />

</div>

  </button>

</div>

</header>

      {/* PAGE */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      <div className="max-w-5xl mx-auto">


          {/* MAIN PANEL */}
          <div className="relative overflow-hidden rounded-[34px] border border-cyan-500/30 bg-black/50 p-4 sm:p-8 backdrop-blur-xl shadow-[0_0_60px_rgba(0,255,255,0.12)] min-h-[700px] sm:min-h-[820px]">
{/* ANGLED CORNERS */}
<div className="absolute top-0 left-0 w-24 h-24 border-t border-l border-cyan-400/60 rounded-tl-[34px]" />

<div className="absolute top-0 right-0 w-24 h-24 border-t border-r border-cyan-400/60 rounded-tr-[34px]" />

<div className="absolute bottom-0 left-0 w-24 h-24 border-b border-l border-cyan-400/60 rounded-bl-[34px]" />

<div className="absolute bottom-0 right-0 w-24 h-24 border-b border-r border-cyan-400/60 rounded-br-[34px]" />
            {/* PANEL GLOW */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.08),transparent_60%)]" />

            <div className="relative z-10">

              {/* TITLE */}
              <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">

  <div className="w-8 sm:w-10 h-[1px] bg-cyan-500/40" />

  <h2 className="text-[0.9rem] sm:text-[1.35rem] font-semibold tracking-[0.22em] uppercase text-white">

    HEAT INPUT
    <span className="text-cyan-300 ml-3">
      CALCULATOR
    </span>

  </h2>

  <div className="w-8 sm:w-10 h-[1px] bg-cyan-500/40" />


</div>

              {/* INPUT ROWS */}
<div className="space-y-2">

{/* VOLTAGE */}
<div className="group grid grid-cols-1 md:grid-cols-[64px_1fr_180px] items-center border-b border-cyan-500/10 py-4 sm:py-5 relative gap-4 transition-all duration-300 hover:border-cyan-400/30">

  <div className="flex justify-center">
    <Zap
      size={28}
      className="text-cyan-400/70 transition-all duration-300 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_12px_rgba(0,255,255,0.9)]"
    />
  </div>

  <div>

    <p className="text-sm tracking-[0.28em] text-zinc-400 uppercase mb-2">
      Voltage (V)
    </p>

    

  </div>

  <input
    type="number"
    inputMode="decimal"
    min="0"
    step="0.01"
    value={voltage}
    onChange={(e) => setVoltage(e.target.value)}
    className="h-[64px] bg-black/70 border border-cyan-500/20 rounded-xl px-5 text-2xl text-white transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/[0.03] focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_18px_rgba(0,255,255,0.15)]"
  />
<div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.8)]" />
</div>

{/* AMPERAGE */}
<div className="group grid grid-cols-1 md:grid-cols-[64px_1fr_180px] items-center border-b border-cyan-500/10 py-4 sm:py-5 relative gap-4 transition-all duration-300 hover:border-cyan-400/30">

  <div className="flex justify-center">
    <Activity
      size={28}
      className="text-cyan-400/70 transition-all duration-300 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_12px_rgba(0,255,255,0.9)]"
    />
  </div>

  <div>

    <p className="text-sm tracking-[0.28em] text-zinc-400 uppercase mb-2">
      Amperage (A)
    </p>

    

  </div>

  <input
    type="number"
    inputMode="decimal"
    min="0"
    step="0.01"
    value={amperage}
    onChange={(e) => setAmperage(e.target.value)}
    className="h-[64px] bg-black/70 border border-cyan-500/20 rounded-xl px-5 text-2xl text-white transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/[0.03] focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_18px_rgba(0,255,255,0.15)]"
  />
<div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.8)]" />
</div>

{/* SPEED */}
<div className="group grid grid-cols-1 md:grid-cols-[64px_1fr_180px] items-center border-b border-cyan-500/10 py-4 sm:py-5 relative gap-4 transition-all duration-300 hover:border-cyan-400/30">

  <div className="flex justify-center">
    <Gauge
      size={28}
      className="text-cyan-400/70 transition-all duration-300 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_12px_rgba(0,255,255,0.9)]"
    />
  </div>

  <div>

    <p className="text-sm tracking-[0.28em] text-zinc-400 uppercase mb-2">
      Travel Speed (mm/min)
    </p>

    

  </div>

  <input
    type="number"
    inputMode="decimal"
    min="0"
    step="0.01"
    value={speed}
    onChange={(e) => setSpeed(e.target.value)}
    className="h-[64px] bg-black/70 border border-cyan-500/20 rounded-xl px-5 text-2xl text-white transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/[0.03] focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_18px_rgba(0,255,255,0.15)]"
  />
<div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.8)]" />
</div>

{/* PROCESS */}
<div className="group grid grid-cols-1 md:grid-cols-[64px_1fr_180px] items-center border-b border-cyan-500/10 py-4 sm:py-5 relative gap-4 transition-all duration-300 hover:border-cyan-400/30">

  <div className="flex justify-center">
  <Flame
  size={28}
  className="text-cyan-400/70 transition-all duration-300 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_12px_rgba(0,255,255,0.9)]"
/>
  </div>

  <div>

    <p className="text-sm tracking-[0.28em] text-zinc-400 uppercase mb-2">
      Process
    </p>

    

  </div>

  <select
  value={efficiency}
  onChange={(e) => {
    setEfficiency(parseFloat(e.target.value));

    const selected =
      e.target.options[e.target.selectedIndex].text;

    setProcessName(selected);
  }}
  className="h-[64px] bg-black/70 border border-cyan-500/20 rounded-xl px-5 text-2xl text-white transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/[0.03] focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_18px_rgba(0,255,255,0.15)]"
>
  <option value="0.8">MIG / MAG</option>
  <option value="0.6">TIG</option>
  <option value="0.8">Elektrode</option>
  <option value="1.0">SAW</option>
</select>
  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.8)]" />
</div>

{/* K FACTOR */}
<div className="group grid grid-cols-1 md:grid-cols-[64px_1fr_180px] items-center border-b border-cyan-500/10 py-4 sm:py-5 relative gap-4 transition-all duration-300 hover:border-cyan-400/30">

  <div className="flex justify-center">
  <Settings2
  size={28}
  className="text-cyan-400/70 transition-all duration-300 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_12px_rgba(0,255,255,0.9)]"
/>
  </div>

  <div>

    <p className="text-sm tracking-[0.28em] text-zinc-400 uppercase mb-2">
      K-Factor
    </p>

    

  </div>

  <div className="flex justify-end">

    <button
      onClick={() => setUseFactor(!useFactor)}
      className={`relative w-20 h-10 rounded-full transition-all duration-300 ${
        useFactor
          ? "bg-cyan-400/90"
          : "bg-zinc-800"
      }`}
    >

      <div
        className={`absolute top-1 w-8 h-8 rounded-full bg-black transition-all duration-300 ${
          useFactor ? "left-11" : "left-1"
        }`}
      />

    </button>

  </div>

  </div>

</div>
{/* BOTTOM PANEL CORNERS */}
<div className="relative h-8 mt-2">

  {/* LEFT CORNER */}
  <div className="absolute left-0 bottom-0 w-10 h-10 border-l border-b border-cyan-400/60 rounded-bl-xl" />

  {/* RIGHT CORNER */}
  <div className="absolute right-0 bottom-0 w-10 h-10 border-r border-b border-cyan-400/60 rounded-br-xl" />

</div>
<div className="h-10" />

              {/* CALCULATE BUTTON */}
              <button
  onClick={calculateHeatInput}
  disabled={
    !voltage ||
    !amperage ||
    !speed ||
    Number(voltage) <= 0 ||
    Number(amperage) <= 0 ||
    Number(speed) <= 0
  }
  className={`group relative w-full overflow-hidden rounded-[22px] py-4 sm:py-5 text-lg sm:text-xl font-bold tracking-[0.45em] transition-all duration-300
    ${
      !voltage ||
      !amperage ||
      !speed ||
      Number(voltage) <= 0 ||
      Number(amperage) <= 0 ||
      Number(speed) <= 0
        ? "border border-zinc-800 bg-zinc-900/40 text-zinc-600 cursor-not-allowed"
        : "border border-cyan-300/60 bg-cyan-400/15 text-cyan-200 hover:scale-[1.01] hover:bg-cyan-400/25 hover:border-cyan-200 hover:shadow-[0_0_60px_rgba(0,255,255,0.45)]"
    }`}
>

  {/* OUTER GLOW */}
  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,255,255,0.18),transparent_70%)]" />

  {/* HOVER GLOW */}
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-[radial-gradient(circle,rgba(0,255,255,0.35),transparent_70%)]" />

  {/* TOP LIGHT LINE */}
  <div className="absolute top-0 left-[10%] h-[1px] w-[80%] bg-cyan-300/60" />

  {/* BOTTOM LIGHT LINE */}
  <div className="absolute bottom-0 left-[10%] h-[1px] w-[80%] bg-cyan-300/40" />

  {/* BUTTON CONTENT */}
  <span className="relative z-10 flex items-center justify-center gap-5">

    {/* LEFT DECORATION */}
    <div className="flex items-center gap-2">

      <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(0,255,255,0.9)]" />

      <div className="w-10 h-[1px] bg-cyan-300/40" />

    </div>

    CALCULATE

    <ArrowRight
      size={26}
      className="text-cyan-200 group-hover:translate-x-1 transition-all duration-300"
    />

    {/* RIGHT DECORATION */}
    <div className="flex items-center gap-2">

      <div className="w-10 h-[1px] bg-cyan-300/40" />

      <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(0,255,255,0.9)]" />

    </div>

  </span>

</button>

              {/* RESULT CARD */}
              {/* TOP LEFT */}
<div className="absolute top-4 left-4 w-10 h-10 border-t border-l border-cyan-400/70 rounded-tl-xl" />

{/* TOP RIGHT */}
<div className="absolute top-4 right-4 w-10 h-10 border-t border-r border-cyan-400/70 rounded-tr-xl" />

{/* BOTTOM LEFT */}
<div className="absolute bottom-4 left-4 w-10 h-10 border-b border-l border-cyan-400/70 rounded-bl-xl" />

{/* BOTTOM RIGHT */}
<div className="absolute bottom-4 right-4 w-10 h-10 border-b border-r border-cyan-400/70 rounded-br-xl" />
<div className="group relative mt-10 overflow-hidden rounded-[24px] border border-cyan-400/30 bg-black/70 backdrop-blur-xl shadow-[0_0_120px_rgba(0,255,255,0.14)] transition-all duration-500 hover:shadow-[0_0_140px_rgba(0,255,255,0.22)]">

                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,255,255,0.12),transparent_70%)]" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:18px_18px]" />
                {/* TOP TITLE */}
                <div className="relative z-10 pt-8 text-center">

                  <p className="text-cyan-400 tracking-[0.35em] uppercase text-sm">
                    Heat Input
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-4">

<div className="w-16 h-[1px] bg-cyan-500/30" />

<div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]" />

<div className="w-16 h-[1px] bg-cyan-500/30" />

</div>
                </div>

                {/* MAIN RESULT */}
                <div className="relative z-10 flex flex-col items-center justify-center py-12">

                  <div className="absolute w-[320px] h-[320px] rounded-full bg-cyan-400/10 blur-3xl" />

                  <div className="absolute w-[180px] h-[180px] rounded-full bg-cyan-300/20 blur-2xl animate-pulse" />

                  <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6">

                  <Wand2
  size={68}
  className="text-cyan-400/80 transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_18px_rgba(0,255,255,0.7)]"
/>

<p className="text-[3.5rem] sm:text-[6rem] lg:text-[9rem] font-black tracking-[0.08em] text-cyan-300 transition-all duration-500 group-hover:drop-shadow-[0_0_18px_rgba(0,255,255,0.35)]">
    {result ?? "--"}
  </p>

</div>

                  <p className="mt-3 text-cyan-300 text-2xl sm:text-3xl tracking-[0.45em] font-light">
                    kJ/mm
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-4">

<div className="px-4 py-2 rounded-xl border border-cyan-500/20 bg-cyan-400/5">
  <p className="text-xs tracking-[0.28em] uppercase text-zinc-500 mb-1">
    Process
  </p>

  <p className="text-cyan-300 tracking-[0.18em]">
    {processName}
  </p>
</div>

<div className="px-4 py-2 rounded-xl border border-cyan-500/20 bg-cyan-400/5">
  <p className="text-xs tracking-[0.28em] uppercase text-zinc-500 mb-1">
    Efficiency
  </p>

  <p className="text-cyan-300 tracking-[0.18em]">
    {useFactor ? efficiency : "OFF"}
  </p>
</div>

</div>
                </div>

                

              </div>
{/* PREMIUM PANEL */}
<div className="mt-8 relative overflow-hidden rounded-[24px] border border-cyan-400/20 bg-black/50 backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(0,255,255,0.08)]">

  {/* BACKGROUND GLOW */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.08),transparent_70%)]" />

  {/* CORNERS */}
  <div className="absolute top-4 left-4 w-7 h-7 border-l border-t border-cyan-400/40 rounded-tl-lg" />
  <div className="absolute top-4 right-4 w-7 h-7 border-r border-t border-cyan-400/40 rounded-tr-lg" />
  <div className="absolute bottom-4 left-4 w-7 h-7 border-l border-b border-cyan-400/20 rounded-bl-lg" />
  <div className="absolute bottom-4 right-4 w-7 h-7 border-r border-b border-cyan-400/20 rounded-br-lg" />

  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">

    {/* LEFT */}
    <div>

      <p className="text-cyan-400 text-xs tracking-[0.35em] uppercase mb-3">
        Premium Upgrade
      </p>

      <h3 className="text-2xl font-semibold tracking-[0.18em] text-white uppercase">
        Remove Advertisements
      </h3>

      <p className="mt-3 text-zinc-400 tracking-[0.08em] leading-relaxed max-w-[500px]">
        Unlock a clean professional workspace and support advanced welding software development.
      </p>

    </div>

    {/* RIGHT */}
    <button className="group relative overflow-hidden rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-8 py-5 text-cyan-300 tracking-[0.22em] uppercase font-semibold transition-all duration-300 hover:bg-cyan-400/20 hover:shadow-[0_0_35px_rgba(0,255,255,0.35)]">

      {/* HOVER GLOW */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-[radial-gradient(circle,rgba(0,255,255,0.22),transparent_70%)]" />

      <span className="relative z-10">
        €0.09 p/mth
      </span>

    </button>

  </div>

</div>
              {/* MORE TOOLS */}
             
              <div className="mt-10 border border-cyan-500/20 rounded-[30px] bg-black/40 backdrop-blur-xl p-5 sm:p-8">

              <div className="relative h-10 flex items-center justify-center mb-8">

  {/* LEFT LINE */}
  <div className="absolute left-14 right-[55%] top-1/2 h-[1px] -translate-y-1/2 bg-cyan-500/30" />

  {/* RIGHT LINE */}
  <div className="absolute right-14 left-[55%] top-1/2 h-[1px] -translate-y-1/2 bg-cyan-500/30" />

  {/* LEFT CORNER */}
  <div className="absolute left-0 top-0 w-8 h-8 border-l border-t border-cyan-400/40 rounded-tl-xl" />

  {/* RIGHT CORNER */}
  <div className="absolute right-0 top-0 w-8 h-8 border-r border-t border-cyan-400/40 rounded-tr-xl" />

  {/* TITLE */}
  <p className="relative z-10 px-6 text-xl tracking-[0.35em] text-white uppercase bg-black/40">
    More Tools
  </p>


</div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-8 text-center">
                <div className="group space-y-3 transition-all duration-300 hover:-translate-y-1">
                <Plus className="mx-auto text-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_14px_rgba(0,255,255,0.8)]" size={42} />
                    <p className="text-cyan-300 text-sm">
                      COMING SOON
                    </p>
                  </div>
                  <div className="group space-y-3 transition-all duration-300 hover:-translate-y-1">
                  <Plus className="mx-auto text-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_14px_rgba(0,255,255,0.8)]" size={42} />
                    <p className="text-cyan-300 text-sm">
                      COMING SOON
                    </p>
                  </div>
                  <div className="group space-y-3 transition-all duration-300 hover:-translate-y-1">
                  <Plus className="mx-auto text-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_14px_rgba(0,255,255,0.8)]" size={42} />
                    <p className="text-cyan-300 text-sm">
                      COMING SOON
                    </p>
                  </div>
                  <div className="group space-y-3 transition-all duration-300 hover:-translate-y-1">
                  <Plus className="mx-auto text-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_14px_rgba(0,255,255,0.8)]" size={42} />
                    <p className="text-cyan-300 text-sm">
                      COMING SOON
                    </p>
                  </div>
                  <div className="group space-y-3 transition-all duration-300 hover:-translate-y-1">
                  <Plus className="mx-auto text-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_14px_rgba(0,255,255,0.8)]" size={42} />
                    <p className="text-cyan-300 text-sm">
                      COMING SOON
                    </p>
                  </div>
                  <div className="group space-y-3 transition-all duration-300 hover:-translate-y-1">
                  <Plus className="mx-auto text-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_14px_rgba(0,255,255,0.8)]" size={42} />
                    <p className="text-cyan-300 text-sm">
                      COMING SOON
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}