"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import GasAnalyzer from "../components/GasAnalyzer";

export default function Home() {
  const [address, setAddress] = useState("");

  const onSubmit = (e: any) => {
    e.preventDefault();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">
            Base Wallet Gas Coach
          </h1>
          <p className="text-sm text-slate-400">
            Paste a Base wallet address to analyze its history and get better
            practices to improve earnings and cut unnecessary losses.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value.trim())}
              placeholder="0x… Base address"
              className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!address}
          >
            Analyze wallet
          </button>
        </form>

        <GasAnalyzer address={address} />
      </div>
    </main>
  );
}
