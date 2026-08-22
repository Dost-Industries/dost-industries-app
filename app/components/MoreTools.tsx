"use client";

import {
  Calculator,
  Sigma,
  ThermometerSun,
} from "lucide-react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

const tools = [
  {
    name:
      "Heat Input",
    subtitle:
      "Heat Input Calculator",
    icon: Calculator,
    path: "/heat-input",
  },
  {
    name:
      "Carbon Equivalent",
    subtitle:
      "CEq Calculator",
    icon: Sigma,
    path: "/ceq",
  },
  {
    name:
      "Preheat Temperature",
    subtitle:
      "Preheat Calculator",
    icon:
      ThermometerSun,
    path: "/preheat",
  },
] as const;

export default function MoreTools() {
  const router = useRouter();
  const pathname = usePathname();

  const visibleTools =
    tools.filter(
      (tool) =>
        tool.path !== pathname
    );

  return (
    <div className="mt-10 rounded-[30px] border border-cyan-500/20 bg-[var(--dost-surface-40)] p-5 backdrop-blur-xl sm:p-8">
      <div className="relative mb-8 flex h-10 items-center justify-center">
        <div className="absolute left-14 right-[55%] top-1/2 h-px -translate-y-1/2 bg-cyan-500/30" />
        <div className="absolute right-14 left-[55%] top-1/2 h-px -translate-y-1/2 bg-cyan-500/30" />

        <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l border-t border-cyan-400/40" />
        <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r border-t border-cyan-400/40" />

        <p className="relative z-10 bg-[var(--dost-surface-40)] px-6 text-lg font-medium uppercase tracking-[0.35em] text-[var(--dost-text)] sm:text-xl">
          More Tools
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center sm:gap-6">
        {visibleTools.map(
          ({
            name,
            subtitle,
            icon: Icon,
            path,
          }) => (
            <button
              key={name}
              type="button"
              onClick={() =>
                router.push(path)
              }
              className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-[var(--dost-surface-30)] px-3 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-cyan-400/[0.05] sm:px-5 sm:py-6"
            >
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] border border-cyan-400/30 bg-cyan-400/[0.06] shadow-[0_0_22px_rgba(0,255,255,0.06)] transition-all duration-300 group-hover:border-cyan-300/60 group-hover:shadow-[0_0_28px_rgba(0,255,255,0.12)]">
                <Icon
                  size={28}
                  className="text-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_14px_rgba(0,255,255,0.8)]"
                />
              </div>

              <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--dost-text)] sm:text-sm">
                {name}
              </p>

              <p className="mt-1 text-[0.62rem] uppercase tracking-[0.12em] text-cyan-400/80 sm:text-xs">
                {subtitle}
              </p>
            </button>
          )
        )}
      </div>
    </div>
  );
}
