import { NextResponse } from "next/server";
import { baseClient } from "../../../lib/baseClient";

let cached: { data: any; ts: number } | null = null;
const TTL = 25_000;

export async function GET() {
  const now = Date.now();
  if (cached && now - cached.ts < TTL) {
    return NextResponse.json(cached.data);
  }

  const gasPrice = await baseClient.getGasPrice();
  let baseFee: bigint | undefined = undefined;

  try {
    const block = await baseClient.getBlock();
    // @ts-ignore - baseFeePerGas exists on EIP-1559 chains
    baseFee = block.baseFeePerGas ?? undefined;
  } catch {}

  const data = {
    gasPriceWei: gasPrice.toString(),
    baseFeeWei: baseFee?.toString(),
    updatedAt: now,
  };

  cached = { data, ts: now };
  return NextResponse.json(data);
}
