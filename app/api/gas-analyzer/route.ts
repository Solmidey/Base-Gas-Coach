import { NextRequest, NextResponse } from "next/server";

type ExplorerTx = {
  gasUsed: string;
  gasPrice: string;
  value: string;
  isError: string;
  from: string;
  to: string;
  timeStamp: string;
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

  // Always analyze ~3 months for now (free Etherscan tier friendly)
  const months = 3;
  const windowLabel = "3 months";
  const secondsPerMonth = 30 * 24 * 60 * 60;
  const cutoffTimestamp =
    Math.floor(Date.now() / 1000) - months * secondsPerMonth;

  const params = new URLSearchParams({
    apikey: apiKey,
    chainid: "8453", // Base
    module: "account",
    action: "txlist",
    address,
    startblock: "0",
    endblock: "9999999999",
    page: "1",
    offset: "500",
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

    if (json.status === "0" && json.message === "No transactions found") {
      return NextResponse.json({
        address,
        chain: "Base",
        windowLabel,
        totalGasEth: 0,
        txCount: 0,
        avgGasPerTx: 0,
        smallTxRatio: 0,
        failedTxRatio: 0,
        zeroValueRatio: 0,
        suggestions: [
          `We couldn't find any transactions for this address on Base in the last ${windowLabel}.`,
          "Action: bridge a small amount to Base, pick 1–2 protocols you actually like, and do 3–5 meaningful transactions (swaps, deposits, points programs) instead of random spam.",
        ],
      });
    }

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

    // Filter into the last 3 months
    const periodTxs = txs.filter((tx) => {
      const ts = Number(tx.timeStamp || "0");
      return ts >= cutoffTimestamp;
    });

    if (periodTxs.length === 0) {
      return NextResponse.json({
        address,
        chain: "Base",
        windowLabel,
        totalGasEth: 0,
        txCount: 0,
        avgGasPerTx: 0,
        smallTxRatio: 0,
        failedTxRatio: 0,
        zeroValueRatio: 0,
        suggestions: [
          `No Base transactions for this address in the last ${windowLabel}.`,
          "Action: when you move to Base, treat gas like marketing spend—focus on protocols that reward activity (points, yield, airdrops) so almost every tx has upside.",
        ],
      });
    }

    let totalGasEth = 0;
    let txCount = 0;
    let smallTx = 0;
    let failedTx = 0;
    let zeroValue = 0;
    let highValue = 0;

    for (const tx of periodTxs) {
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
        `Your average gas per transaction on Base over the last ${windowLabel} is ${avgGasPerTx.toFixed(
          5
        )} ETH. Action: batch related actions (approve + swap + LP) where you can and avoid 'testing' tiny trades on mainnet—use testnets or simulation tools first.`
      );
    }

    if (smallTxRatio > 0.3) {
      suggestions.push(
        `About ${(smallTxRatio * 100).toFixed(
          1
        )}% of your transactions are low-value but still pay full gas. Action: set a personal minimum size for trades/transfers and group micro-moves into fewer, larger transactions.`
      );
    }

    if (failedTxRatio > 0.05) {
      suggestions.push(
        `Roughly ${(failedTxRatio * 100).toFixed(
          1
        )}% of your transactions are failing. Action: before sending, double-check slippage, balance and approval status; for risky interactions, start with one small 'test' tx instead of spamming retries.`
      );
    }

    if (zeroValueRatio > 0.25) {
      suggestions.push(
        `Around ${(zeroValueRatio * 100).toFixed(
          1
        )}% of your transactions move no direct value (approvals/ops). Action: regularly revoke approvals for dead protocols and prioritize txs that generate yield, unlock points or build positions you actually care about.`
      );
    }

    if (highValue > 0 && totalGasEth / (highValue || 1) > 0.002) {
      suggestions.push(
        "You have some larger value moves where gas and slippage eat into your upside. Action: when size is big, compare 1–2 different routes/aggregators on Base before sending and avoid peak volatility windows."
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(
        `Your Base gas usage over the last ${windowLabel} looks fairly efficient. Action: keep focusing activity on protocols that reward long-term usage and schedule a quick monthly review of your last 10 txs to prune unnecessary habits.`
      );
    }

    return NextResponse.json({
      address,
      chain: "Base",
      windowLabel,
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
