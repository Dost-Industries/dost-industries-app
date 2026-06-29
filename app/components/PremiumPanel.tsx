export default function PremiumPanel() {
    return (
      <div className="mt-8 relative overflow-hidden rounded-[24px] border border-cyan-400/20 bg-black/50 backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(0,255,255,0.08)]">
  
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.08),transparent_70%)]" />
  
        <div className="absolute top-4 left-4 w-7 h-7 border-l border-t border-cyan-400/40 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-7 h-7 border-r border-t border-cyan-400/40 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-7 h-7 border-l border-b border-cyan-400/20 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-7 h-7 border-r border-b border-cyan-400/20 rounded-br-lg" />
  
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
  
          <div>
            <p className="text-cyan-400 text-xs tracking-[0.35em] uppercase mb-3">
              Premium Upgrade
            </p>
  
            <h3 className="text-xl sm:text-2xl font-semibold tracking-[0.18em] uppercase text-white">
              Remove Advertisements
            </h3>
  
            <p className="mt-3 max-w-[500px] text-zinc-400 leading-relaxed">
              Unlock a clean professional workspace and support future DOST Industries development.
            </p>
          </div>
  
          <button className="group relative overflow-hidden rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-8 py-5 uppercase tracking-[0.22em] font-semibold text-cyan-300 transition-all duration-300 hover:bg-cyan-400/20 hover:shadow-[0_0_35px_rgba(0,255,255,0.35)]">
  
            <div className="absolute inset-0 opacity-0 transition-all duration-500 group-hover:opacity-100 bg-[radial-gradient(circle,rgba(0,255,255,0.22),transparent_70%)]" />
  
            <span className="relative z-10">
              €0.09 p/mth
            </span>
  
          </button>
  
        </div>
  
      </div>
    );
  }