"use client";

import { useState } from "react";
import { Search, Zap } from "lucide-react";
import GasAnalyzer from "../components/GasAnalyzer";

export default function Home() {
  const [inputAddress, setInputAddress] = useState("");
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkHint, setNetworkHint] = useState<string | null>(null);

  const effectiveAddress =
    activeAddress || connectedAddress || (inputAddress.trim() || undefined);

  const handleConnect = async () => {
    setError(null);
    setNetworkHint(null);
    try {
      setConnecting(true);
      const eth = (window as any).ethereum;
      if (!eth) {
        setError(
          "No wallet detected. Install MetaMask or a Base-compatible wallet and try again."
        );
        return;
      }

      const [addr] = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (addr) {
        setConnectedAddress(addr);
        setActiveAddress(addr);
        setInputAddress(addr);
      }

      try {
        const chainId = await eth.request({ method: "eth_chainId" });
        if (chainId !== "0x2105") {
          setNetworkHint(
            "You are not currently on Base mainnet. You can still analyze this wallet, but for best results switch your wallet network to Base."
          );
        }
      } catch {
        // ignore chain errors, not critical
      }
    } catch (err: any) {
      setError(err?.message || "Failed to connect wallet.");
    } finally {
      setConnecting(false);
    }
  };

  const handleAnalyze = () => {
    const trimmed = inputAddress.trim();
    if (!trimmed) {
      setError("Enter an address or connect a wallet first.");
      return;
    }
    setError(null);
    setActiveAddress(trimmed);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <header className="mb-8 space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Base Gas Coach
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Connect a Base wallet or paste any address. We pull its on-chain
            history from BaseScan, highlight where gas is leaking, and suggest
            better habits so you can earn more and waste less while using Base.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                placeholder="0x… Base wallet address"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
            </div>
            <button
              onClick={handleAnalyze}
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
            >
              Analyze
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-400">
              {connectedAddress ? (
                <span>
                  Connected wallet:{" "}
                  <span className="font-mono text-slate-200">
                    {connectedAddress}
                  </span>
                </span>
              ) : (
                <span>Optionally connect a wallet for one-click analysis.</span>
              )}
            </div>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-60"
            >
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              {connecting ? "Connecting…" : "Connect wallet"}
            </button>
          </div>

          {networkHint && (
            <p className="text-[11px] text-amber-300/90">
              {networkHint}
            </p>
          )}

          {error && (
            <div className="mt-2 rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-100 flex gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </section>

        <GasAnalyzer address={effectiveAddress} />
      </div>
    </main>
  );
}
