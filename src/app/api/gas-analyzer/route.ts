import { NextRequest, NextResponse } from "next/server";

type BaseScanTx = {
  gasUsed: string;
  gasPrice: string;
  value: string;
  isError: string;
  from: string;
  to: string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Missing address" },
      { status: 400 }
    );
  }

  const apiKey = process.env.BASESCAN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "BASESCAN_API_KEY is not set" },
      { status: 500 }
    );
  }

  const url = `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from BaseScan" },
        { status: 502 }
      );
    }

    const json = await res.json();

    if (json.status !== "1" || !Array.isArray(json.result)) {
      return NextResponse.json(
        { error: "No transactions found or unexpected response" },
        { status: 200 }
      );
    }

    const txs: BaseScanTx[] = json.result;

    let totalGasEth = 0;
    let txCount = 0;
    let smallTx = 0;
    let failedTx = 0;
    let zeroValue = 0;
    let highValue = 0;

    for (const tx of txs) {
      const gasFeeEth =
        (Number(tx.gasUsed || "0") * Number(tx.gasPrice || "0")) / 1e18;
      const valueEth = Number(tx.value || "0") / 1e18;

      totalGasEth += gasFeeEth;
      txCount++;

      if (valueEth < 0.01 && gasFeeEth > 0.0002) {
        smallTx++;
      }
      if (tx.isError === "1") {
        failedTx++;
      }
      if (valueEth === 0) {
        zeroValue++;
      }
      if (valueEth >= 1) {
        highValue++;
      }
    }

    const avgGasPerTx = txCount ? totalGasEth / txCount : 0;
    const smallTxRatio = txCount ? smallTx / txCount : 0;
    const failedTxRatio = txCount ? failedTx / txCount : 0;
    const zeroValueRatio = txCount ? zeroValue / txCount : 0;

    const suggestions: string[] = [];

    if (avgGasPerTx > 0.0005) {
      suggestions.push(
        "Your average gas per transaction on Base is relatively high. Try batching actions and avoid unnecessary onchain tests."
      );
    }

    if (smallTxRatio > 0.25) {
      suggestions.push(
        "You make a lot of low-value transactions that still cost gas. Consider grouping transfers or placing fewer, more confident trades."
      );
    }

    if (failedTxRatio > 0.05) {
      suggestions.push(
        "You have several failed transactions. Always double-check slippage, balance and approvals to avoid paying gas for failed txs."
      );
    }

    if (zeroValueRatio > 0.2) {
      suggestions.push(
        "Many of your transactions move no direct value (approvals, contract calls). Focus more volume on protocols that reward activity so gas spent can return as points, yield or airdrops."
      );
    }

    if (highValue > 0 && totalGasEth / (highValue || 1) > 0.002) {
      suggestions.push(
        "On high-value moves, compare different dapps or aggregators on Base to find better routes and lower slippage so you keep more upside."
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(
        "Your Base gas usage looks fairly efficient. Keep focusing on protocols that reward activity and avoid unnecessary experimental txs."
      );
    }

    return NextResponse.json({
      address,
      chain: "Base",
      totalGasEth,
      txCount,
      avgGasPerTx,
      smallTxRatio,
      failedTxRatio,
      zeroValueRatio,
      suggestions,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error analyzing Base history" },
      { status: 500 }
    );
  }
}
