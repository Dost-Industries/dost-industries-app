import { Plus } from "lucide-react";

export default function MoreTools() {
  const tools = Array(6).fill("COMING SOON");

  return (
    <div className="mt-10 rounded-[30px] border border-cyan-500/20 bg-black/40 p-5 backdrop-blur-xl sm:p-8">
      <div className="relative mb-8 flex h-10 items-center justify-center">
        <div className="absolute left-14 right-[55%] top-1/2 h-px -translate-y-1/2 bg-cyan-500/30" />
        <div className="absolute right-14 left-[55%] top-1/2 h-px -translate-y-1/2 bg-cyan-500/30" />

        <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l border-t border-cyan-400/40" />
        <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r border-t border-cyan-400/40" />

        <p className="relative z-10 bg-black/40 px-6 text-lg font-medium uppercase tracking-[0.35em] text-white sm:text-xl">
          More Tools
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 text-center md:grid-cols-6">
        {tools.map((tool, index) => (
          <div
            key={index}
            className="group space-y-3 transition-all duration-300 hover:-translate-y-1"
          >
            <Plus
              size={40}
              className="mx-auto text-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_14px_rgba(0,255,255,0.8)]"
            />

            <p className="text-xs tracking-[0.15em] text-cyan-300 sm:text-sm">
              {tool}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}