export default function PremiumPanel() {
    return (
      <div className="mt-6 overflow-hidden rounded-[24px] border border-cyan-400/20 bg-black/55 backdrop-blur-xl shadow-[0_0_40px_rgba(0,255,255,0.08)]">
        <div className="relative p-4 sm:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.08),transparent_70%)]" />
  
          <div className="relative z-10">
            <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-cyan-400">
              Sponsored
            </p>
  
            <div className="flex min-h-[90px] items-center justify-center rounded-2xl border border-cyan-500/15 bg-black/50">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-600">
                Advertisement
              </p>
            </div>
  
            <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                  Remove Ads
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Clean professional workspace
                </p>
              </div>
  
              <button className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 transition-all duration-300 hover:bg-cyan-400/20 hover:shadow-[0_0_25px_rgba(0,255,255,0.3)]">
                €0.09 / m
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }