type ResultCardProps = {
    result: number | null;
  };
  
  export default function ResultCard({ result }: ResultCardProps) {
    return (
      <div className="relative mt-4 overflow-hidden rounded-[22px] border border-cyan-400/30 bg-black/75 backdrop-blur-xl shadow-[0_0_70px_rgba(0,255,255,0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.10),transparent_65%)]" />
  
        <div className="absolute left-4 top-4 h-7 w-7 rounded-tl-xl border-l border-t border-cyan-400/45" />
        <div className="absolute right-4 top-4 h-7 w-7 rounded-tr-xl border-r border-t border-cyan-400/45" />
        <div className="absolute bottom-4 left-4 h-7 w-7 rounded-bl-xl border-b border-l border-cyan-400/25" />
        <div className="absolute bottom-4 right-4 h-7 w-7 rounded-br-xl border-b border-r border-cyan-400/25" />
  
        <div className="relative z-10 px-5 py-5 text-center sm:py-7">
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-cyan-500/30" />
  
            <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-400">
              Heat Input
            </p>
  
            <div className="h-px w-12 bg-cyan-500/30" />
          </div>
  
          <div className="flex items-end justify-center gap-3">
            <p className="text-[4.6rem] font-black leading-none tracking-[0.03em] text-cyan-300 drop-shadow-[0_0_18px_rgba(0,255,255,0.25)] sm:text-[7rem]">
              {result ?? "--"}
            </p>
  
            <p className="mb-3 text-lg font-light tracking-[0.25em] text-cyan-300 sm:mb-5 sm:text-2xl">
              kJ/mm
            </p>
          </div>
  
          <div className="mx-auto mt-5 flex items-center justify-center gap-3">

  <div className="h-px w-16 bg-cyan-500/20" />

  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]" />

  <div className="h-px w-16 bg-cyan-500/20" />

</div>
        </div>
      </div>
    );
  }