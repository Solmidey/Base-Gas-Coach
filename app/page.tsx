"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { GasCard, type GasSnapshot } from "../components/GasCard";
import { CoachCard } from "../components/CoachCard";

async function fetchGas(): Promise<GasSnapshot> {
  const res = await fetch("/api/gas", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load gas");
  return res.json();
}

export default function HomePage() {
  const [data, setData] = useState<GasSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentGwei = useMemo(() => {
    if (!data) return null;
    try {
      return Number(BigInt(data.gasPriceWei)) / 1e9;
    } catch {
      return null;
    }
  }, [data]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchGas();
      setData(d);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="space-y-6">
      <Header />

      <section className="glass p-5 md:p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="chip">⚡ Live on Base</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">
              Your calm, flashy gas companion
            </h2>
            <p className="mt-2 text-white/70">
              A fun mini dashboard that helps you time actions and learn sensible defaults for
              bridging, swapping, and LP exploration on Base.
            </p>
          </div>
          <div className="glass p-4 min-w-[220px]">
            <p className="text-xs text-white/60">Gas Mood</p>
            <p className="mt-1 text-2xl font-bold">
              {currentGwei == null
                ? "…"
                : currentGwei < 0.05
                ? "🟢 Chill"
                : currentGwei < 0.15
                ? "🟡 Moderate"
                : "🔴 Spicy"}
            </p>
            <p className="text-xs text-white/60 mt-1">
              Simple thresholds you can tune later.
            </p>
            <button className="btn mt-3 w-full text-sm" onClick={load} disabled={loading}>
              {loading ? "Checking..." : "Check now"}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="glass p-4 border border-rose-400/30">
          <p className="text-sm text-rose-200">⚠ {error}</p>
          <button className="btn-ghost mt-2 text-sm" onClick={load}>
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <GasCard data={data} onRefresh={load} loading={loading} />
        <CoachCard currentGwei={currentGwei} />
      </div>

      <footer className="text-center text-xs text-white/50 pt-2">
        Built for Farcaster Mini Apps • Read-only coaching • Always verify official links.
      </footer>
    </main>
  );
}
