import { NextRequest, NextResponse } from "next/server";

type ExplorerTx = {
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
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const apiKey = process.env.BASESCAN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "BASESCAN_API_KEY is not set on the server" },
      { status: 500 }
    );
  }

  // Etherscan V2 multi-chain endpoint, chainid=8453 for Base
  const params = new URLSearchParams({
    apikey: apiKey,
    chainid: "8453",
    module: "account",
    action: "txlist",
    address,
    startblock: "0",
    endblock: "9999999999",
    page: "1",
    offset: "100",
    sort: "desc",
  });

  const url = `https://api.etherscan.io/v2/api?${params.toString()}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to reach explorer API" },
        { status: 502 }
      );
    }

    const json = await res.json();

    // no tx case
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
          "If this wallet is active on other chains, bridge a bit to Base and focus on apps that reward activity so gas feeds future upside.",
        ],
      });
    }

    // any other error from explorer (bad key, rate limit, etc.)
    if (json.status === "0") {
      const detail = json.result || json.message || "unknown error";
      console.error("Explorer API error:", json);
      return NextResponse.json(
        { error: `Explorer API error: ${detail}` },
        { status: 502 }
      );
    }

    if (!Array.isArray(json.result)) {
      console.error("Explorer API unexpected response:", json);
      return NextResponse.json(
        { error: "Explorer API returned an unexpected format" },
        { status: 502 }
      );
    }

    const txs: ExplorerTx[] = json.result;

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

      if (valueEth < 0.01 && gasFeeEth > 0.0002) smallTx++;
      if (tx.isError === "1") failedTx++;
      if (valueEth === 0) zeroValue++;
      if (valueEth >= 1) highValue++;
    }

    const avgGasPerTx = txCount ? totalGasEth / txCount : 0;
    const smallTxRatio = txCount ? smallTx / txCount : 0;
    const failedTxRatio = txCount ? failedTx / txCount : 0;
    const zeroValueRatio = txCount ? zeroValue / txCount : 0;

    const suggestions: string[] = [];

    if (avgGasPerTx > 0.0005) {
      suggestions.push(
        "Your average gas per tx on Base is relatively high. Batch actions where possible and avoid unnecessary experiments."
      );
    }
    if (smallTxRatio > 0.25) {
      suggestions.push(
        "You send many low-value txs that still cost gas. Focus on fewer, higher-conviction moves or bundle small actions."
      );
    }
    if (failedTxRatio > 0.05) {
      suggestions.push(
        "You have several failed txs. Double-check balances, slippage and approvals so you don't pay gas for failures."
      );
    }
    if (zeroValueRatio > 0.2) {
      suggestions.push(
        "A lot of your txs are approvals/zero-value calls. Try to route gas into protocols that reward activity (points, yield, airdrops)."
      );
    }
    if (highValue > 0 && totalGasEth / (highValue || 1) > 0.002) {
      suggestions.push(
        "On big moves, compare routes/aggregators on Base to reduce slippage and fees so more upside stays with you."
      );
    }
    if (suggestions.length === 0) {
      suggestions.push(
        "Your Base gas usage looks fairly efficient. Keep prioritizing rewarded activity and avoiding pointless degen txs."
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
