"use client";

import { useAuth } from "../../hooks/useAuth";

import {
  ENTITLEMENTS,
  hasEntitlement,
} from "../../lib/entitlements";

export default function AdBanner() {
  const { profile, loading } = useAuth();

  const isAdFree = hasEntitlement(
    profile?.entitlements,
    ENTITLEMENTS.REMOVE_ADS
  );

  if (isAdFree) {
    return null;
  }

  return (
    <section className="mt-6 overflow-hidden rounded-[24px] border border-cyan-400/20 bg-black/55 shadow-[0_0_40px_rgba(0,255,255,0.08)] backdrop-blur-xl">
      <div className="p-4 sm:p-6">
        <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-cyan-400">
          Sponsored
        </p>

        <div className="flex min-h-[90px] items-center justify-center rounded-2xl border border-cyan-500/15 bg-black/50">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-600">
            {loading ? "Loading advertisement" : "Advertisement"}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Professional Workspace
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Create an account to remove advertisements.
            </p>
          </div>

          <button className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 transition-all duration-300 hover:bg-cyan-400/20">
            Upgrade
          </button>
        </div>
      </div>
    </section>
  );
}