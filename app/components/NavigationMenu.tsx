"use client";

import {
  Calculator,
  LogIn,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

type NavigationMenuProps = {
  open: boolean;
  isAuthenticated: boolean;
  onClose: () => void;
};

export default function NavigationMenu({
  open,
  isAuthenticated,
  onClose,
}: NavigationMenuProps) {
  const router = useRouter();

  if (!open) {
    return null;
  }

  function navigateTo(path: string) {
    onClose();
    router.push(path);
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <aside className="absolute left-0 top-0 flex h-full w-[290px] max-w-[85vw] flex-col border-r border-cyan-500/30 bg-[#020617]/95 p-5 shadow-[20px_0_60px_rgba(0,255,255,0.10)]">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white">
              DOST
              <span className="ml-2 text-cyan-400">
                INDUSTRIES
              </span>
            </p>

            <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-zinc-500">
              Navigation
            </p>
          </div>

          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-black/40 text-cyan-300 transition hover:border-cyan-400/60"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => navigateTo("/")}
            className="flex w-full items-center gap-4 rounded-xl border border-cyan-400/35 bg-cyan-400/10 px-4 py-4 text-left transition hover:bg-cyan-400/15"
          >
            <Calculator
              size={20}
              className="shrink-0 text-cyan-300"
            />

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
                Heat Input
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Calculator
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              navigateTo(
                isAuthenticated
                  ? "/account"
                  : "/login"
              )
            }
            className="flex w-full items-center gap-4 rounded-xl border border-cyan-500/20 bg-black/40 px-4 py-4 text-left transition hover:border-cyan-400/50 hover:bg-cyan-400/5"
          >
            {isAuthenticated ? (
              <User
                size={20}
                className="shrink-0 text-cyan-300"
              />
            ) : (
              <LogIn
                size={20}
                className="shrink-0 text-cyan-300"
              />
            )}

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
                {isAuthenticated
                  ? "My Account"
                  : "Login"}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {isAuthenticated
                  ? "Account & subscription"
                  : "Access your account"}
              </p>
            </div>
          </button>
        </nav>

        <div className="mt-auto border-t border-cyan-500/15 pt-5">
          <p className="text-[9px] uppercase leading-relaxed tracking-[0.2em] text-zinc-600">
            Professional Welding & Engineering Tools
          </p>
        </div>
      </aside>
    </div>
  );
}