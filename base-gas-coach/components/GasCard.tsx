import { GAS_LIMITS, estimateCostWei, weiToEth } from "../lib/gas";

export type GasSnapshot = {
  gasPriceWei: string;
  baseFeeWei?: string;
  updatedAt: number;
};

function formatEth(n: number) {
  if (!isFinite(n)) return "—";
  if (n === 0) return "0";
  if (n < 0.000001) return "<0.000001";
  return n.toFixed(6);
}

export function GasCard({
  data,
  onRefresh,
  loading,
}: {
  data: GasSnapshot | null;
  onRefresh: () => void;
  loading: boolean;
}) {
  const gasPriceWei = data ? BigInt(data.gasPriceWei) : 0n;

  const costs = {
    transfer: estimateCostWei(gasPriceWei, GAS_LIMITS.transfer),
    erc20: estimateCostWei(gasPriceWei, GAS_LIMITS.erc20),
    swap: estimateCostWei(gasPriceWei, GAS_LIMITS.swap),
    mint: estimateCostWei(gasPriceWei, GAS_LIMITS.mint),
  };

  return (
    <section className="glass p-5 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Live Gas Snapshot</h2>
        <button
          className="btn-ghost text-sm"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh gas"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="glass p-4">
          <p className="text-xs text-white/60">Gas Price</p>
          <p className="text-2xl font-bold">
            {data ? (Number(gasPriceWei) / 1e9).toFixed(3) : "—"}{" "}
            <span className="text-sm text-white/60">gwei</span>
          </p>
        </div>
        <div className="glass p-4">
          <p className="text-xs text-white/60">Base Fee (latest block)</p>
          <p className="text-2xl font-bold">
            {data?.baseFeeWei
              ? (Number(BigInt(data.baseFeeWei)) / 1e9).toFixed(3)
              : "—"}{" "}
            <span className="text-sm text-white/60">gwei</span>
          </p>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-white/80">
          Quick fee estimates (rough)
        </h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="glass p-4 flex items-center justify-between">
            <span className="text-sm">Simple transfer</span>
            <span className="font-semibold">
              {formatEth(weiToEth(costs.transfer))} ETH
            </span>
          </div>
          <div className="glass p-4 flex items-center justify-between">
            <span className="text-sm">ERC20 transfer</span>
            <span className="font-semibold">
              {formatEth(weiToEth(costs.erc20))} ETH
            </span>
          </div>
          <div className="glass p-4 flex items-center justify-between">
            <span className="text-sm">Swap (DEX)</span>
            <span className="font-semibold">
              {formatEth(weiToEth(costs.swap))} ETH
            </span>
          </div>
          <div className="glass p-4 flex items-center justify-between">
            <span className="text-sm">NFT mint</span>
            <span className="font-semibold">
              {formatEth(weiToEth(costs.mint))} ETH
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-white/50">
          These are ballpark estimates using typical gas limits and current
          gas price. Real fees vary by contract and pathway.
        </p>
      </div>
    </section>
  );
}
