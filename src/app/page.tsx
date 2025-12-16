"use client";

import { useState } from "react";
import { Search, Wallet2 } from "lucide-react";
import GasAnalyzer from "../components/GasAnalyzer";

export default function Home() {
  const [inputAddress, setInputAddress] = useState("");
  const [analysisAddress, setAnalysisAddress] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const handleAnalyze = () => {
    const target = inputAddress.trim() || connectedWallet;
    if (!target) return;
    setAnalysisAddress(target.trim());
  };

  const handleConnect = async () => {
    if (typeof window === "undefined") return;

    const anyWindow = window as any;
    if (!anyWindow.ethereum) {
      alert(
        "No wallet detected. Please install a wallet like MetaMask or Coinbase Wallet."
      );
      return;
    }

    try {
      setConnecting(true);
      const accounts: string[] = await anyWindow.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        const addr = accounts[0];
        setConnectedWallet(addr);
        if (!inputAddress.trim()) {
          setInputAddress(addr);
        }
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    } finally {
      setConnecting(false);
    }
  };

  const displayConnected =
    connectedWallet && connectedWallet.length > 0
      ? connectedWallet.slice(0, 6) + "..." + connectedWallet.slice(-4)
      : "No wallet connected";

  const effectiveAddress = analysisAddress ?? connectedWallet ?? undefined;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-10">
        {/* HERO HEADER WITH LOGO */}
        <section className="mb-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950/80 p-5 sm:p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex-shrink-0">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-sky-500/70 bg-slate-950 shadow-lg shadow-sky-900/40">
                <img
                  src="/base-gas-coach-logo.png"
                  alt="Base Gas Coach logo"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
                Base Gas Coach
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Connect a Base wallet or paste any address. We read its history
                on BaseScan, show where your gas is going, and give simple,
                wallet-specific tips so you can waste less and earn more from
                your onchain activity.
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

        {/* ADDRESS INPUT + ACTIONS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Wallet address on Base
                </label>
                <div className="flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    value={inputAddress}
                    onChange={(e) => setInputAddress(e.target.value)}
                    placeholder="0x… Base wallet address"
                    className="h-8 flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:w-[190px]">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-sky-500 px-4 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!inputAddress.trim() && !connectedWallet}
                >
                  Analyze
                </button>

                <button
                  type="button"
                  onClick={handleConnect}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={connecting}
                >
                  <Wallet2 className="h-4 w-4" />
                  {connecting ? "Connecting…" : "Connect wallet"}
                </button>
              </div>
            </div>

            <p className="mt-1 text-[11px] text-slate-500">
              Connect a Base wallet or enter an address above to see how your gas
              habits affect your upside, and get clear, actionable coaching to
              improve revenue and cut waste.
            </p>
          </div>
        </section>

        {/* ANALYSIS SECTION */}
        <GasAnalyzer address={effectiveAddress} />
      </div>
    </main>
  );
}
