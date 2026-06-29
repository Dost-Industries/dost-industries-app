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
    <div className="group relative mt-4 overflow-hidden rounded-[22px] border border-cyan-400/30 bg-black/75 backdrop-blur-xl shadow-[0_0_70px_rgba(0,255,255,0.12)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.12),transparent_65%)]" />

      <div className="relative z-10 px-4 py-5">
        <div className="mb-3 flex items-center justify-center gap-3">
          <div className="h-px w-10 bg-cyan-500/30" />
          <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-400">
            Heat Input
          </p>
          <div className="h-px w-10 bg-cyan-500/30" />
        </div>

        <div className="flex items-center justify-center gap-4">
          <Wand2
            size={42}
            className="text-cyan-400/80 drop-shadow-[0_0_14px_rgba(0,255,255,0.45)]"
          />

          <p className="text-[4rem] font-black leading-none tracking-[0.04em] text-cyan-300 sm:text-[6rem]">
            {result ?? "--"}
          </p>
        </div>

        <p className="mt-1 text-center text-lg font-light tracking-[0.42em] text-cyan-300">
          kJ/mm
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-400/5 px-3 py-2 text-center">
            <p className="mb-1 text-[8px] uppercase tracking-[0.22em] text-zinc-500">
              Process
            </p>
            <p className="text-[11px] tracking-[0.14em] text-cyan-300">
              {processName}
            </p>
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-400/5 px-3 py-2 text-center">
            <p className="mb-1 text-[8px] uppercase tracking-[0.22em] text-zinc-500">
              Efficiency
            </p>
            <p className="text-[11px] tracking-[0.14em] text-cyan-300">
              {useFactor ? efficiency : "OFF"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}