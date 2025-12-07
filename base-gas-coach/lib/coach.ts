import type { GasAction } from "./gas";

export type CoachStatus = "green" | "yellow" | "red";

// Heuristic thresholds for Base (tune later based on real observations)
export const COACH_THRESHOLDS_GWEI = {
  green: 0.05,
  yellow: 0.15,
};

export function getCoachStatus(currentGwei: number): CoachStatus {
  if (currentGwei <= COACH_THRESHOLDS_GWEI.green) return "green";
  if (currentGwei <= COACH_THRESHOLDS_GWEI.yellow) return "yellow";
  return "red";
}

export function getCoachMood(status: CoachStatus) {
  switch (status) {
    case "green":
      return { emoji: "🟢", label: "Chill window" };
    case "yellow":
      return { emoji: "🟡", label: "Reasonable" };
    default:
      return { emoji: "🔴", label: "Spicy fees" };
  }
}

export function actionPriority(status: CoachStatus): Record<GasAction, "ok" | "caution" | "avoid"> {
  if (status === "green") {
    return { transfer: "ok", erc20: "ok", swap: "ok", mint: "ok" };
  }
  if (status === "yellow") {
    return { transfer: "ok", erc20: "ok", swap: "caution", mint: "caution" };
  }
  return { transfer: "ok", erc20: "caution", swap: "avoid", mint: "avoid" };
}

export function recommendedActions(status: CoachStatus): string[] {
  if (status === "green") {
    return [
      "Great time for multi-step actions, swaps, and mints.",
      "Batch your setup: bridge → swap → mint in one session.",
      "Try Base-native LPs with small test positions."
    ];
  }
  if (status === "yellow") {
    return [
      "Transfers and small actions are fine.",
      "Keep swap size modest and slippage intentional.",
      "Explore LPs only if you understand impermanent loss."
    ];
  }
  return [
    "Delay non-urgent swaps/mints.",
    "If you must act, prefer simple transfers.",
    "Avoid adding new LP positions during higher fee windows."
  ];
}

// Curated “good default starting points”.
// This is not exhaustive and not financial advice.
export const bridges = [
  {
    name: "Official Base Bridge",
    url: "https://bridge.base.org",
    bestFor: "Canonical ETH + token bridge",
    notes: "Always verify the domain. Great default for most users.",
    riskLevel: "low",
  },
  {
    name: "Route aggregators (Li.Fi)",
    url: "https://app.li.fi",
    bestFor: "Comparing cross-chain routes",
    notes: "Preview fees + route steps. Test small first.",
    riskLevel: "medium",
  },
] as const;

export const dexes = [
  {
    name: "Uniswap on Base",
    url: "https://app.uniswap.org",
    notes: "Popular default DEX. Check price impact + slippage.",
  },
  {
    name: "Aerodrome",
    url: "https://aerodrome.finance",
    notes: "Base-native liquidity hub. Review pool age + incentives.",
  },
] as const;

export const lpExamples = [
  {
    protocol: "Aerodrome",
    pair: "ETH / USDC",
    why: "Common learning pool with meaningful activity.",
  },
  {
    protocol: "Uniswap v3",
    pair: "ETH / USDC (fee tiers)",
    why: "Good for understanding fee-tier tradeoffs.",
  },
] as const;

export const generalTips = [
  "Use official links and double-check domains before bridging.",
  "Test with small amounts when trying a new bridge or pool.",
  "For LPs: consider impermanent loss and steady volume.",
  "Set slippage consciously; avoid blind defaults."
] as const;
