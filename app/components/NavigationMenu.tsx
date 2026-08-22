"use client";

import {
  Calculator,
  Home,
  LogIn,
  Moon,
  Settings2,
  Sigma,
  Sun,
  ThermometerSun,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  useTheme,
} from "../../contexts/ThemeContext";

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

  const {
    theme,
    toggleTheme,
  } = useTheme();

  if (!open) {
    return null;
  }

  function navigateTo(path: string) {
    onClose();
    router.push(path);
  }

  const lightMode =
    theme === "light";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className="absolute inset-0 bg-[var(--dost-overlay)] backdrop-blur-sm"
      />

      <aside className="absolute left-0 top-0 flex h-full w-[290px] max-w-[85vw] flex-col border-r border-cyan-500/30 bg-[var(--dost-surface-95)] p-5 shadow-[20px_0_60px_rgba(0,255,255,0.10)]">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--dost-text)]">
              DOST
              <span className="ml-2 text-cyan-400">
                INDUSTRIES
              </span>
            </p>

            <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-[var(--dost-muted)]">
              Navigation
            </p>
          </div>

          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-[var(--dost-surface-40)] text-cyan-300 transition hover:border-cyan-400/60"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() =>
              navigateTo("/")
            }
            className="flex w-full items-center gap-4 rounded-xl border border-cyan-400/35 bg-cyan-400/10 px-4 py-4 text-left transition hover:bg-cyan-400/15"
          >
            <Home
              size={20}
              className="shrink-0 text-cyan-300"
            />

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--dost-text)]">
                Home
              </p>

              <p className="mt-1 text-xs text-[var(--dost-muted)]">
                DOST Premium Suite
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              navigateTo(
                "/heat-input"
              )
            }
            className="flex w-full items-center gap-4 rounded-xl border border-cyan-500/20 bg-[var(--dost-surface-40)] px-4 py-4 text-left transition hover:border-cyan-400/50 hover:bg-cyan-400/5"
          >
            <Calculator
              size={20}
              className="shrink-0 text-cyan-300"
            />

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--dost-text)]">
                Heat Input
              </p>

              <p className="mt-1 text-xs text-[var(--dost-muted)]">
                Heat Input Calculator
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              navigateTo(
                "/ceq"
              )
            }
            className="flex w-full items-center gap-4 rounded-xl border border-cyan-500/20 bg-[var(--dost-surface-40)] px-4 py-4 text-left transition hover:border-cyan-400/50 hover:bg-cyan-400/5"
          >
            <Sigma
              size={20}
              className="shrink-0 text-cyan-300"
            />

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--dost-text)]">
                Carbon Equivalent
              </p>

              <p className="mt-1 text-xs text-[var(--dost-muted)]">
                CEq Calculator
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              navigateTo(
                "/preheat"
              )
            }
            className="flex w-full items-center gap-4 rounded-xl border border-cyan-500/20 bg-[var(--dost-surface-40)] px-4 py-4 text-left transition hover:border-cyan-400/50 hover:bg-cyan-400/5"
          >
            <ThermometerSun
              size={20}
              className="shrink-0 text-cyan-300"
            />

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--dost-text)]">
                Preheat Temperature
              </p>

              <p className="mt-1 text-xs text-[var(--dost-muted)]">
                Preheat Calculator
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
            className="flex w-full items-center gap-4 rounded-xl border border-cyan-500/20 bg-[var(--dost-surface-40)] px-4 py-4 text-left transition hover:border-cyan-400/50 hover:bg-cyan-400/5"
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
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--dost-text)]">
                {isAuthenticated
                  ? "My Account"
                  : "Login"}
              </p>

              <p className="mt-1 text-xs text-[var(--dost-muted)]">
                {isAuthenticated
                  ? "Account & subscription"
                  : "Access your account"}
              </p>
            </div>
          </button>
        </nav>

        <div className="mt-6 border-t border-cyan-500/15 pt-5">
          <div className="mb-3 flex items-center gap-3">
            <Settings2
              size={18}
              className="text-cyan-300"
            />

            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--dost-text)]">
                Settings
              </p>

              <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-[var(--dost-muted)]">
                Appearance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${
              lightMode
                ? "dark"
                : "light"
            } mode`}
            aria-pressed={lightMode}
            className="flex w-full items-center justify-between rounded-xl border border-cyan-500/20 bg-[var(--dost-surface-40)] px-4 py-3.5 text-left transition hover:border-cyan-400/50"
          >
            <div className="flex items-center gap-3">
              {lightMode ? (
                <Sun
                  size={18}
                  className="text-cyan-400"
                />
              ) : (
                <Moon
                  size={18}
                  className="text-cyan-300"
                />
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--dost-text)]">
                  Theme
                </p>

                <p className="mt-1 text-[10px] text-[var(--dost-muted)]">
                  {lightMode
                    ? "Light mode"
                    : "Dark mode"}
                </p>
              </div>
            </div>

            <div
              className={`relative h-7 w-12 rounded-full border transition-all duration-300 ${
                lightMode
                  ? "border-cyan-300/60 bg-cyan-400/80"
                  : "border-cyan-500/20 bg-[var(--dost-switch-off)]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                  lightMode
                    ? "left-[22px]"
                    : "left-0.5"
                }`}
              />
            </div>
          </button>
        </div>

        <div className="mt-auto border-t border-cyan-500/15 pt-5">
          <p className="text-[9px] uppercase leading-relaxed tracking-[0.2em] text-[var(--dost-muted-strong)]">
            Professional Welding & Engineering Tools
          </p>
        </div>
      </aside>
    </div>
  );
}
