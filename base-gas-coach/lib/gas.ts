export const GAS_LIMITS = {
  transfer: 21_000,
  erc20: 50_000,
  swap: 150_000,
  mint: 120_000,
} as const;

export type GasAction = keyof typeof GAS_LIMITS;

export function weiToEth(wei: bigint): number {
  return Number(wei) / 1e18;
}

export function estimateCostWei(gasPriceWei: bigint, gasLimit: number): bigint {
  return gasPriceWei * BigInt(gasLimit);
}
