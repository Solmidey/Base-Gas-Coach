"use client";

import { useEffect, useState } from "react";
import { AlertCircle, DollarSign, TrendingDown, Zap } from "lucide-react";

type Analysis = {
  address: string;
  chain: string;
  totalGasEth: number;
  txCount: number;
  avgGasPerTx: number;
  smallTxRatio: number;
  failedTxRatio: number;
  zeroValueRatio: number;
  suggestions: string[];
};

type GasAnalyzerProps = {
  address?: string;
};

export default function GasAnalyzer({ address }: GasAnalyzerProps) {
  const [data, setData] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setData(null);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/gas-analyzer?address=${address}`,
          { signal: controller.signal }
        );

        const json = await res.json();

        if (!res.ok || json.error) {
          setData(null);
          setError(json.error || "Failed to analyze wallet");
          return;
        }

        setData(json as Analysis);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unknown error");
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    run();

    return () => controller.abort();
  }, [address]);

  if (!address) {
    return (
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
        Connect a Base wallet or enter an address above to see how your gas habits
        affect your upside, and get coaching to improve revenue and cut waste.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
        Analyzing your Base transaction history… this might take a few seconds.
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-100">
        <AlertCircle className="mt-0.5 h-4 w-4" />
        <div>
          <div className="font-medium">Something went wrong</div>
          <div className="text-xs opacity-80">{error}</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isEmpty = data.txCount === 0;

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="text-xs uppercase tracking-wide text-slate-400">
          Gas summary on {data.chain}
        </div>
        <div className="mt-1 break-all text-xs text-slate-500">
          {data.address}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Total gas spent</div>
              <div className="text-base font-semibold text-slate-50">
                {data.totalGasEth.toFixed(4)} ETH
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Transactions</div>
              <div className="text-base font-semibold text-slate-50">
                {data.txCount}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900">
              <TrendingDown className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Avg gas / tx</div>
              <div className="text-base font-semibold text-slate-50">
                {data.avgGasPerTx.toFixed(5)} ETH
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-200">
        {isEmpty ? (
          <>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              No Base activity yet
            </div>
            <p className="mb-1">
              We didn&apos;t find transactions for this address on Base. The tips
              below focus on how to start using Base in a way that maximizes upside
              and minimizes wasted gas.
            </p>
          </>
        ) : (
          <>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Behaviour snapshot
            </div>
            <p className="mb-1">
              • Low-value txs ratio: {(data.smallTxRatio * 100).toFixed(1)}%
            </p>
            <p className="mb-1">
              • Failed txs ratio: {(data.failedTxRatio * 100).toFixed(1)}%
            </p>
            <p className="mb-1">
              • Zero-value / approval txs ratio: {(data.zeroValueRatio * 100).toFixed(1)}%
            </p>
            <p className="mt-2 text-slate-400">
              Use this to see where gas is leaking versus where it helps you earn.
            </p>
          </>
        )}
      </div>

      <div className="rounded-xl border border-emerald-700/60 bg-emerald-950/30 p-4 text-xs text-emerald-100">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
          Better practices for more upside, less loss
        </div>
        <ul className="space-y-2">
          {data.suggestions.map((tip, idx) => (
            <li key={idx} className="leading-relaxed">
              • {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
