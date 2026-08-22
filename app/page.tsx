"use client";

import {
  ArrowRight,
  Calculator,
  FileText,
  Gauge,
  Menu,
  Save,
  ShieldCheck,
  Sigma,
  Sparkles,
  ThermometerSun,
  User,
  Zap,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "../hooks/useAuth";
import NavigationMenu from "./components/NavigationMenu";

const tools = [
  {
    name: "Heat Input",
    short: "HI",
    description:
      "Calculate welding heat input from voltage, amperage and travel speed.",
    icon: Calculator,
    path: "/heat-input",
    accent: "kJ/mm",
  },
  {
    name:
      "Carbon Equivalent",
    short: "CEq",
    description:
      "Calculate carbon equivalent from chemical composition values.",
    icon: Sigma,
    path: "/ceq",
    accent: "CEq",
  },
  {
    name:
      "Preheat Temperature",
    short: "Tp",
    description:
      "Calculate preheat temperature with the CET formula and defined ranges.",
    icon: ThermometerSun,
    path: "/preheat",
    accent: "°C",
  },
] as const;

const premiumFeatures = [
  {
    icon: Save,
    title:
      "Save calculations",
    description:
      "Keep calculation records linked to your DOST account.",
  },
  {
    icon: FileText,
    title:
      "PDF reporting",
    description:
      "Create professional calculation reports for project dossiers.",
  },
  {
    icon: ShieldCheck,
    title:
      "One Premium suite",
    description:
      "Use all three welding calculators in one connected environment.",
  },
] as const;

export default function HomePage() {
  const router = useRouter();

  const {
    user,
    profile,
    loading,
  } = useAuth();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const isPremium =
    Boolean(
      profile?.entitlements?.length
    );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--dost-bg)] text-[var(--dost-text)]">
        <div className="rounded-2xl border border-cyan-500/20 bg-[var(--dost-surface-60)] px-8 py-6 text-center shadow-[0_0_50px_rgba(0,255,255,0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            DOST Industries
          </p>

          <p className="mt-3 text-sm text-[var(--dost-muted)]">
            Initializing system...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--dost-bg)] text-[var(--dost-text)]">
      <div className="pointer-events-none absolute inset-0 dost-radial-bg" />
      <div className="pointer-events-none absolute inset-0 dost-grid-bg" />

      <div className="pointer-events-none absolute left-1/2 top-[-260px] h-[540px] w-[540px] -translate-x-1/2 rounded-full border border-cyan-400/10 shadow-[0_0_140px_rgba(0,255,255,0.08)] sm:h-[700px] sm:w-[700px]" />
      <div className="pointer-events-none absolute left-1/2 top-[-170px] h-[360px] w-[360px] -translate-x-1/2 rounded-full border border-cyan-400/10 sm:h-[500px] sm:w-[500px]" />
      <div className="pointer-events-none absolute left-1/2 top-[-80px] h-[180px] w-[180px] -translate-x-1/2 rounded-full border border-cyan-300/20 shadow-[0_0_80px_rgba(0,255,255,0.08)] sm:h-[280px] sm:w-[280px]" />

      <header className="relative z-30 border-b border-cyan-500/20 bg-[var(--dost-surface-60)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 sm:px-6 sm:py-3">
          <button
            type="button"
            onClick={() =>
              setMenuOpen(true)
            }
            aria-label="Open navigation menu"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-[var(--dost-surface-40)] transition hover:border-cyan-400/60 sm:h-13 sm:w-13"
          >
            <Menu
              size={21}
              className="text-cyan-300"
            />
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="text-center"
          >
            <p className="text-[0.92rem] font-black uppercase italic leading-none tracking-[0.28em] sm:text-2xl sm:tracking-[0.48em]">
              <span className="text-[var(--dost-text)]">
                DOST
              </span>{" "}
              <span className="text-cyan-400 drop-shadow-[0_0_18px_rgba(0,255,255,0.6)]">
                INDUSTRIES
              </span>
            </p>

            <p className="mt-1 text-[0.42rem] uppercase tracking-[0.34em] text-[var(--dost-muted)] sm:text-[0.65rem]">
              Digital Welding & Engineering Tools
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                user
                  ? "/account"
                  : "/login"
              )
            }
            aria-label={
              user
                ? "Open account"
                : "Login"
            }
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-[var(--dost-surface-40)] transition hover:border-cyan-400/60 sm:h-13 sm:w-13"
          >
            <User
              size={21}
              className="text-cyan-300"
            />
          </button>
        </div>
      </header>

      <NavigationMenu
        open={menuOpen}
        isAuthenticated={
          Boolean(user)
        }
        onClose={() =>
          setMenuOpen(false)
        }
      />

      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pb-14 sm:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/[0.06] px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(0,255,255,0.9)]" />

            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-cyan-300 sm:text-[0.68rem]">
              DOST Premium Suite
            </span>
          </div>

          <div className="relative mt-8">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl sm:h-44 sm:w-44" />

            <h1 className="relative text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
              <span className="block text-[var(--dost-text)]">
                Welding
              </span>

              <span className="block text-cyan-300 drop-shadow-[0_0_28px_rgba(0,255,255,0.2)]">
                Calculation
              </span>

              <span className="block text-[var(--dost-text)]">
                Intelligence
              </span>
            </h1>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-[var(--dost-muted)] sm:text-base sm:leading-7">
            Three focused calculation tools.
            One connected professional workflow.
            DOST Industries calculates, records and reports.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/heat-input"
                )
              }
              className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-300/55 bg-cyan-400/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.17em] text-cyan-200 shadow-[0_0_35px_rgba(0,255,255,0.08)] transition hover:border-cyan-200 hover:bg-cyan-400/15 sm:w-auto"
            >
              Open calculators

              <ArrowRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  user
                    ? "/account"
                    : "/login"
                )
              }
              className="w-full rounded-2xl border border-cyan-500/20 bg-[var(--dost-surface-40)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.17em] text-[var(--dost-text)] transition hover:border-cyan-400/50 sm:w-auto"
            >
              {user
                ? isPremium
                  ? "Premium account"
                  : "View Premium"
                : "Sign in"}
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-7 flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-500/30" />

          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[var(--dost-muted)]">
            Three core tools
          </p>

          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-500/30" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {tools.map(
            ({
              name,
              short,
              description,
              icon: Icon,
              path,
              accent,
            },
            index) => (
              <button
                key={name}
                type="button"
                onClick={() =>
                  router.push(path)
                }
                className="group relative overflow-hidden rounded-[26px] border border-cyan-500/20 bg-[var(--dost-surface-40)] p-5 text-left backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/55 hover:shadow-[0_0_45px_rgba(0,255,255,0.08)] sm:p-6"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(0,255,255,0.08),transparent_38%)] opacity-70" />

                <div className="absolute right-4 top-3 text-5xl font-black tracking-[-0.08em] text-cyan-400/[0.06] sm:text-6xl">
                  0{index + 1}
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.07] shadow-[0_0_25px_rgba(0,255,255,0.06)]">
                      <Icon
                        size={27}
                        className="text-cyan-300"
                      />
                    </div>

                    <span className="rounded-full border border-cyan-400/20 px-3 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                      {accent}
                    </span>
                  </div>

                  <p className="mt-7 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-cyan-400">
                    {short}
                  </p>

                  <h2 className="mt-2 text-xl font-bold uppercase tracking-[0.04em] text-[var(--dost-text)]">
                    {name}
                  </h2>

                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-[var(--dost-muted)]">
                    {description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-cyan-500/15 pt-4">
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                      Launch tool
                    </span>

                    <ArrowRight
                      size={17}
                      className="text-cyan-300 transition group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </button>
            )
          )}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="relative overflow-hidden rounded-[30px] border border-cyan-500/20 bg-[var(--dost-surface-50)] p-5 backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.07),transparent_55%)]" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <Sparkles
                  size={20}
                  className="text-cyan-300"
                />

                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  DOST Premium
                </p>
              </div>

              <h2 className="mt-4 max-w-xl text-3xl font-black uppercase leading-tight tracking-[-0.03em] text-[var(--dost-text)] sm:text-5xl">
                Built for the
                <span className="text-cyan-300">
                  {" "}
                  complete calculation workflow
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--dost-muted)] sm:text-base">
                Move from calculation to saved record and professional PDF report without leaving the DOST environment.
              </p>
            </div>

            <div className="space-y-3">
              {premiumFeatures.map(
                ({
                  icon: Icon,
                  title,
                  description,
                }) => (
                  <div
                    key={title}
                    className="flex gap-4 rounded-2xl border border-cyan-500/15 bg-[var(--dost-surface-30)] p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/[0.06]">
                      <Icon
                        size={20}
                        className="text-cyan-300"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--dost-text)]">
                        {title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[var(--dost-muted)]">
                        {description}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-cyan-500/15 bg-[var(--dost-surface-30)] p-5 text-center">
            <Zap
              size={22}
              className="mx-auto text-cyan-300"
            />

            <p className="mt-3 text-2xl font-black text-[var(--dost-text)]">
              3
            </p>

            <p className="mt-1 text-[0.58rem] uppercase tracking-[0.2em] text-[var(--dost-muted)]">
              Calculation modules
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/15 bg-[var(--dost-surface-30)] p-5 text-center">
            <Gauge
              size={22}
              className="mx-auto text-cyan-300"
            />

            <p className="mt-3 text-2xl font-black text-[var(--dost-text)]">
              1
            </p>

            <p className="mt-1 text-[0.58rem] uppercase tracking-[0.2em] text-[var(--dost-muted)]">
              Connected workflow
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/15 bg-[var(--dost-surface-30)] p-5 text-center">
            <FileText
              size={22}
              className="mx-auto text-cyan-300"
            />

            <p className="mt-3 text-2xl font-black text-[var(--dost-text)]">
              PDF
            </p>

            <p className="mt-1 text-[0.58rem] uppercase tracking-[0.2em] text-[var(--dost-muted)]">
              Professional reporting
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-cyan-500/15 pt-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--dost-text)]">
              DOST
              <span className="ml-2 text-cyan-400">
                INDUSTRIES
              </span>
            </p>

            <p className="mt-1 text-[0.58rem] uppercase tracking-[0.18em] text-[var(--dost-muted)]">
              Digital Welding & Engineering Tools
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                user
                  ? "/account"
                  : "/login"
              )
            }
            className="rounded-xl border border-cyan-500/20 bg-[var(--dost-surface-40)] px-5 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-cyan-300 transition hover:border-cyan-400/50"
          >
            {user
              ? "Account & Premium"
              : "Login to DOST"}
          </button>
        </div>
      </section>
    </main>
  );
}
