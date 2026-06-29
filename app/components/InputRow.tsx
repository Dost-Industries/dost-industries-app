import type { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type InputRowProps = {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
};

export default function InputRow({
  icon: Icon,
  label,
  children,
}: InputRowProps) {
  return (
<div className="group grid grid-cols-1 md:grid-cols-[64px_1fr_180px] items-center border-b border-cyan-500/10 py-0 sm:py-2 gap-2 sm:gap-4 relative transition-all duration-300 hover:border-cyan-400/30">
      <div className="flex justify-center">
        <Icon
          size={26}
          className="text-cyan-400/70 transition-all duration-300 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_12px_rgba(0,255,255,0.9)]"
        />
      </div>

      <div>
        <p className="text-[11px] sm:text-sm tracking-[0.28em] uppercase text-zinc-400 mb-2">
          {label}
        </p>
      </div>

      <div className="relative">
        {children}

        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.8)]" />
      </div>

    </div>
  );
}