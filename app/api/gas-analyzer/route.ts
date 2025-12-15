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
      { error: "BASESCAN_API_KEY is not set on the server" },
      { status: 500 }
    );
  }

  const url = `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to reach BaseScan" },
        { status: 502 }
      );
    }

    const json = await res.json();

    // Case 1: BaseScan explicitly says no tx found on Base
    if (json.status === "0" && json.message === "No transactions found") {
      return NextResponse.json({
        address,
        chain: "Base",
        totalGasEth: 0,
        txCount: 0,
        avgGasPerTx: 0,
        smallTxRatio: 0,
        failedTxRatio: 0,
        zeroValueRatio: 0,
        suggestions: [
          "We couldn't find any transactions for this address on Base yet.",
          "If this wallet is active on other chains, consider bridging a small amount to Base and using apps that reward activity (points, yield, airdrops) so gas spent can come back as upside.",
        ],
      });
    }

    // Case 2: some other BaseScan problem (bad key, rate limit, etc.)
    if (json.status !== "1" || !Array.isArray(json.result)) {
      console.error("BaseScan unexpected response:", json);
      return NextResponse.json(
        {
          error: `BaseScan error: ${json.message || "unexpected response"}`,
        },
        { status: 502 }
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
        "Your average gas per transaction on Base is relatively high. Try batching actions when possible and avoid unnecessary onchain experiments."
      );
    }

    if (smallTxRatio > 0.25) {
      suggestions.push(
        "You make a lot of low-value transactions that still cost gas. Focus on fewer, higher-conviction trades or bundle small actions together."
      );
    }

    if (failedTxRatio > 0.05) {
      suggestions.push(
        "You have several failed transactions. Double-check balances, slippage and approvals to avoid paying gas for failed txs."
      );
    }

    if (zeroValueRatio > 0.2) {
      suggestions.push(
        "Many of your txs are approvals or zero-value calls. Wherever possible, route gas spend into protocols that reward activity (points, yield, airdrops) so it feeds future revenue."
      );
    }

    if (highValue > 0 && totalGasEth / (highValue || 1) > 0.002) {
      suggestions.push(
        "On higher-value moves, compare routes and aggregators on Base to reduce slippage and fees so more upside stays with you."
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(
        "Your Base gas usage looks fairly efficient. Keep prioritizing protocols that reward activity and avoid unnecessary degen txs that don't feed future upside."
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
    console.error("Base gas analyzer unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error analyzing Base history" },
      { status: 500 }
    );
  }
}
