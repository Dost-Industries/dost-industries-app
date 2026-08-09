"use client";

import { useEffect } from "react";
import Script from "next/script";

import { useAuth } from "../../hooks/useAuth";

import {
  ENTITLEMENTS,
  hasEntitlement,
} from "../../lib/entitlements";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

const ADSENSE_SLOT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

const hasAdSenseConfig =
  Boolean(ADSENSE_CLIENT_ID) &&
  Boolean(ADSENSE_SLOT_ID);

export default function AdBanner() {
  const { profile, loading } = useAuth();

  const isAdFree = hasEntitlement(
    profile?.entitlements,
    ENTITLEMENTS.REMOVE_ADS
  );

  useEffect(() => {
    if (
      !hasAdSenseConfig ||
      isAdFree
    ) {
      return;
    }

    try {
      window.adsbygoogle =
        window.adsbygoogle || [];

      window.adsbygoogle.push({});
    } catch (error) {
      console.error(
        "DOST advertisement initialization failed:",
        error
      );
    }
  }, [isAdFree]);

  if (isAdFree) {
    return null;
  }

  return (
    <section className="mt-6">
      <div className="relative overflow-hidden rounded-[24px] border border-cyan-500/20 bg-black/45 p-4 shadow-[0_0_40px_rgba(0,255,255,0.06)] sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.06),transparent_60%)]" />

        <div className="relative z-10">
          <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-cyan-400">
            Sponsored
          </p>

          {hasAdSenseConfig ? (
            <>
              <Script
                id="dost-adsense-script"
                async
                strategy="afterInteractive"
                crossOrigin="anonymous"
                src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
              />

              <div className="min-h-[90px] overflow-hidden rounded-2xl border border-cyan-500/15 bg-black/50">
                <ins
                  className="adsbygoogle block"
                  data-ad-client={
                    ADSENSE_CLIENT_ID
                  }
                  data-ad-slot={
                    ADSENSE_SLOT_ID
                  }
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>
            </>
          ) : (
            <div className="flex min-h-[90px] items-center justify-center rounded-2xl border border-cyan-500/15 bg-black/50">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-600">
                {loading
                  ? "Loading advertisement"
                  : "Advertisement"}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                DOST Premium
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                Remove ads, save calculations
                and export PDF reports.
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 transition-all duration-300 hover:bg-cyan-400/20"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}