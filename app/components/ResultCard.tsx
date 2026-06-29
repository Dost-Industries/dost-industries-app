import { Wand2 } from "lucide-react";

type ResultCardProps = {
  result: number | null;
  processName: string;
  efficiency: number;
  useFactor: boolean;
};

export default function ResultCard({
  result,
  processName,
  efficiency,
  useFactor,
}: ResultCardProps) {
  return (
    <div className="group relative mt-4 overflow-hidden rounded-[24px] border border-cyan-400/30 bg-black/75 backdrop-blur-xl shadow-[0_0_90px_rgba(0,255,255,0.12)] transition-all duration-500 hover:shadow-[0_0_120px_rgba(0,255,255,0.22)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.13),transparent_68%)]" />
      <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:18px_18px]" />

      <div className="absolute top-4 left-4 h-8 w-8 rounded-tl-xl border-l border-t border-cyan-400/50" />
      <div className="absolute top-4 right-4 h-8 w-8 rounded-tr-xl border-r border-t border-cyan-400/50" />
      <div className="absolute bottom-4 left-4 h-8 w-8 rounded-bl-xl border-b border-l border-cyan-400/30" />
      <div className="absolute bottom-4 right-4 h-8 w-8 rounded-br-xl border-b border-r border-cyan-400/30" />

      <div className="relative z-10 pt-4 text-center">
        <p className="text-[10px] tracking-[0.35em] text-cyan-400 uppercase">
          Heat Input
        </p>

        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="h-[1px] w-12 bg-cyan-500/30" />
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
          <div className="h-[1px] w-12 bg-cyan-500/30" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-5 sm:py-10">
        <div className="absolute h-[260px] w-[260px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute h-[150px] w-[150px] animate-pulse rounded-full bg-cyan-300/20 blur-2xl" />

        <div className="relative flex items-center justify-center gap-4 sm:gap-6">
          <Wand2
            size={48}
            className="text-cyan-400/80 transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_18px_rgba(0,255,255,0.7)] sm:h-[68px] sm:w-[68px]"
          />

          <p className="text-[4.2rem] font-black tracking-[0.05em] text-cyan-300 transition-all duration-500 group-hover:drop-shadow-[0_0_18px_rgba(0,255,255,0.35)] sm:text-[6rem] lg:text-[9rem]">
            {result ?? "--"}
          </p>
        </div>

        <p className="mt-1 text-xl font-light tracking-[0.45em] text-cyan-300 sm:mt-3 sm:text-3xl">
          kJ/mm
        </p>

        <div className="mt-5 grid w-full max-w-[420px] grid-cols-2 gap-3">
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-400/5 px-3 py-2 text-center">
            <p className="mb-1 text-[9px] tracking-[0.24em] text-zinc-500 uppercase">
              Process
            </p>

            <p className="text-xs tracking-[0.16em] text-cyan-300 sm:text-sm">
              {processName}
            </p>
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-400/5 px-3 py-2 text-center">
            <p className="mb-1 text-[9px] tracking-[0.24em] text-zinc-500 uppercase">
              Efficiency
            </p>

            <p className="text-xs tracking-[0.16em] text-cyan-300 sm:text-sm">
              {useFactor ? efficiency : "OFF"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}