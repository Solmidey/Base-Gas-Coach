"use client";

import Logo from "./Logo";

export default function HeroHeader() {
  return (
    <section className="mb-10 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950/80 p-5 sm:p-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="flex-shrink-0">
          <Logo
            size={56}
            className="border border-sky-500/70 shadow-lg shadow-sky-900/40"
          />
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
            Base Gas Coach
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Connect a Base wallet or paste any address. We read its history on
            BaseScan, show where your gas is going, and give simple, wallet-specific
            tips so you can waste less and earn more from your onchain activity.
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-200">
            <span className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1">
              Spot wasted gas quickly
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1">
              Wallet-specific coaching
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1">
              Built for Base DeFi users
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
