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

type ProtocolCatalogItem = {
  id: string;
  name: string;
  url: string;
  description: string;
};

type ProtocolTip = ProtocolCatalogItem & {
  reason: string;
};

const PROTOCOL_CATALOG: ProtocolCatalogItem[] = [
  {
    id: "base_bridge",
    name: "Base Bridge",
    url: "https://bridge.base.org",
    description: "Bridge assets to and from Base.",
  },
  {
    id: "aerodrome",
    name: "Aerodrome",
    url: "https://aerodrome.finance",
    description: "Base-native DEX and ve(3,3) hub for swaps and LP.",
  },
  {
    id: "uniswap_base",
    name: "Uniswap on Base",
    url: "https://app.uniswap.org/swap?chain=base",
    description: "Router for efficient swaps on Base.",
  },
  {
    id: "aave_base",
    name: "Aave v3",
    url: "https://app.aave.com",
    description: "Lending/borrowing markets on Base.",
  },
  {
    id: "beefy_base",
    name: "Beefy",
    url: "https://app.beefy.finance",
    description: "Yield optimizer vaults (including Base markets).",
  },
];

function mapProtocolIdsToTips(
  ids: string[],
  reasonsById?: Record<string, string>,
): ProtocolTip[] {
  const unique: ProtocolTip[] = [];
  const seen = new Set<string>();

  for (const id of ids) {
    const item = PROTOCOL_CATALOG.find((p) => p.id === id);
    if (!item) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push({
      ...item,
      reason: reasonsById?.[id] || item.description,
    });
  }

  return unique;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const periodParam = searchParams.get("period") ?? "2m";

  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const apiKey = process.env.BASESCAN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "BASESCAN_API_KEY is not set on the server" },
      { status: 500 },
    );
  }

  const apiBaseUrl = "https://api.etherscan.io/v2/api";

  // Only 2 months supported for now (front-end marks others as 'coming soon')
  const months = 2;
  const windowLabel = "2 months";
  const secondsPerMonth = 30 * 24 * 60 * 60;
  const cutoffTimestamp =
    Math.floor(Date.now() / 1000) - months * secondsPerMonth;

  const txParams = new URLSearchParams({
    apikey: apiKey,
    chainid: "8453",
    module: "account",
    action: "txlist",
    address,
    startblock: "0",
    endblock: "9999999999",
    page: "1",
    offset: "500",
    sort: "desc",
  });

  try {
    const txRes = await fetch(`${apiBaseUrl}?${txParams.toString()}`, {
      cache: "no-store",
    });

    if (!txRes.ok) {
      return NextResponse.json(
        { error: "Failed to reach explorer API" },
        { status: 502 },
      );
    }

    const txJson = await txRes.json();

    if (txJson.status === "0" && txJson.message === "No transactions found") {
      return NextResponse.json({
        address,
        chain: "Base",
        period: "2m",
        windowLabel,
        totalGasEth: 0,
        txCount: 0,
        avgGasPerTx: 0,
        smallTxRatio: 0,
        failedTxRatio: 0,
        zeroValueRatio: 0,
        balanceEth: null,
        suggestions: [
          `We couldn't find any transactions for this address on Base in the last ${windowLabel}.`,
          "Action: bridge a small amount to Base, pick 1–2 protocols you actually like, and do 3–5 meaningful transactions (swaps, deposits, points programs) instead of random spam.",
        ],
        protocolTips: mapProtocolIdsToTips(["base_bridge", "aerodrome"]),
      });
    }

    if (txJson.status === "0") {
      const detail = txJson.result || txJson.message || "unknown error";
      console.error("Explorer API error:", txJson);
      return NextResponse.json(
        { error: `Explorer API error: ${detail}` },
        { status: 502 },
      );
    }

    if (!Array.isArray(txJson.result)) {
      console.error("Explorer API unexpected response:", txJson);
      return NextResponse.json(
        { error: "Explorer API returned an unexpected format" },
        { status: 502 },
      );
    }

    const txs: ExplorerTx[] = txJson.result;

    const periodTxs = txs.filter((tx) => {
      const ts = Number(tx.timeStamp || "0");
      return ts >= cutoffTimestamp;
    });

    // --- Fetch current wallet balance (best effort, non-fatal) ---
    let balanceEth: number | null = null;
    try {
      const balParams = new URLSearchParams({
        apikey: apiKey,
        chainid: "8453",
        module: "account",
        action: "balance",
        address,
        tag: "latest",
      });
      const balRes = await fetch(`${apiBaseUrl}?${balParams.toString()}`, {
        cache: "no-store",
      });
      if (balRes.ok) {
        const balJson = await balRes.json();
        if (balJson.status === "1") {
          const raw =
            typeof balJson.result === "string"
              ? balJson.result
              : balJson.result?.balance;
          if (raw) {
            const num = Number(raw);
            if (!Number.isNaN(num)) {
              balanceEth = num / 1e18;
            }
          }
        } else {
          console.error("Balance API error:", balJson);
        }
      }
    } catch (balErr) {
      console.error("Error fetching balance:", balErr);
    }

    if (periodTxs.length === 0) {
      return NextResponse.json({
        address,
        chain: "Base",
        period: "2m",
        windowLabel,
        totalGasEth: 0,
        txCount: 0,
        avgGasPerTx: 0,
        smallTxRatio: 0,
        failedTxRatio: 0,
        zeroValueRatio: 0,
        balanceEth,
        suggestions: [
          `No Base transactions for this address in the last ${windowLabel}.`,
          "Action: when you move to Base, treat gas like marketing spend—focus on protocols that reward activity (points, yield, airdrops) so almost every tx has upside.",
        ],
        protocolTips: mapProtocolIdsToTips(["base_bridge"]),
      });
    }

    // --- Aggregate stats for the 2-month window ---
    let totalGasEth = 0;
    let txCount = 0;
    let smallTx = 0;
    let failedTx = 0;
    let zeroValue = 0;
    let highValue = 0;

    const txSample = periodTxs.slice(0, 15).map((tx) => {
      const gasFeeEth =
        (Number(tx.gasUsed || "0") * Number(tx.gasPrice || "0")) / 1e18;
      const valueEth = Number(tx.value || "0") / 1e18;
      return {
        timeStamp: tx.timeStamp,
        from: tx.from,
        to: tx.to,
        gasFeeEth,
        valueEth,
        isError: tx.isError === "1",
      };
    });

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

    // --- Rule-based baseline (used if Groq missing/fails) ---
    const baseSuggestions: string[] = [];
    const baseProtocolIds: string[] = [];

    if (avgGasPerTx > 0.0005) {
      baseSuggestions.push(
        `Your average gas per transaction on Base over the last ${windowLabel} is ${avgGasPerTx.toFixed(
          5,
        )} ETH. Action: batch related actions and avoid 'testing' tiny trades on mainnet—use testnets or simulations first.`,
      );
      baseProtocolIds.push("uniswap_base");
    }

    if (smallTxRatio > 0.3) {
      baseSuggestions.push(
        `About ${(smallTxRatio * 100).toFixed(
          1,
        )}% of your transactions are low-value but still pay full gas. Action: set a personal minimum size for trades/transfers and group micro-moves into fewer, larger transactions.`,
      );
      baseProtocolIds.push("aerodrome");
    }

    if (failedTxRatio > 0.05) {
      baseSuggestions.push(
        `Roughly ${(failedTxRatio * 100).toFixed(
          1,
        )}% of your transactions are failing. Action: double-check slippage, balance and approval status; for risky interactions, start with one small 'test' tx instead of spamming retries.`,
      );
      baseProtocolIds.push("uniswap_base");
    }

    if (zeroValueRatio > 0.25) {
      baseSuggestions.push(
        `Around ${(zeroValueRatio * 100).toFixed(
          1,
        )}% of your transactions move no direct value (approvals/ops). Action: regularly revoke approvals for dead protocols and prioritize txs that generate yield, unlock points or build positions you actually care about.`,
      );
      baseProtocolIds.push("beefy_base", "aave_base");
    }

    if (highValue > 0 && totalGasEth / (highValue || 1) > 0.002) {
      baseSuggestions.push(
        "You have some larger value moves where gas and slippage eat into your upside. Action: when size is big, compare 1–2 different routes/aggregators on Base before sending and avoid peak volatility windows.",
      );
      baseProtocolIds.push("uniswap_base");
    }

    if (baseSuggestions.length === 0) {
      baseSuggestions.push(
        `Your Base gas usage over the last ${windowLabel} looks fairly efficient. Action: keep focusing activity on protocols that reward long-term usage and schedule a quick monthly review of your last 10 txs to prune unnecessary habits.`,
      );
      baseProtocolIds.push("aave_base", "beefy_base");
    }

    let suggestions = baseSuggestions;
    let protocolTips = mapProtocolIdsToTips(baseProtocolIds);

    // --- Groq agent: advanced, wallet-specific DeFi analysis ---
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const payload = {
          walletAddress: address,
          chain: "Base",
          windowLabel,
          stats: {
            totalGasEth,
            txCount,
            avgGasPerTx,
            smallTxRatio,
            failedTxRatio,
            zeroValueRatio,
          },
          balanceEth,
          sample: txSample,
          catalog: PROTOCOL_CATALOG,
        };

        const groqRes = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: "openai/gpt-oss-120b",
              temperature: 0.4,
              top_p: 1,
              max_completion_tokens: 512,
              reasoning_effort: "medium",
              response_format: { type: "json_object" },
              messages: [
                {
                  role: "system",
                  content:
                    "You are Base Gas Coach, an advanced DeFi power user who reads EVM wallet history like a trading journal. You are given: (1) stats for the last 2 months on Base, (2) a small transaction sample, (3) the current ETH balance on Base, and (4) a catalog of Base-native protocols.\n" +
                    "- Focus on gas usage patterns, failed transactions, approvals, and how much of the wallet's gas is going to productive activity (yield, points, LP, restaking) vs waste.\n" +
                    "- Speak as if you are coaching a friend who already understands crypto basics.\n" +
                    "- Avoid generic advice that could apply to any wallet. Every tip MUST reference at least one concrete metric, ratio, or pattern from the data (e.g. failedTxRatio, zeroValueRatio, txCount, totalGasEth, balanceEth).\n" +
                    "- Do NOT talk about prices, future returns, or tell the user to buy/hold/sell specific assets. Stay on operational decisions: batching, which kinds of protocols to route activity through, and how to reduce unnecessary gas burn.",
                },
                {
                  role: "user",
                  content:
                    "Wallet data and Base protocol catalog as JSON:\n" +
                    JSON.stringify(payload),
                },
                {
                  role: "user",
                  content:
                    'Return ONLY a JSON object with this shape: {"tips":[{"tip":"one concrete improvement tailored to this wallet","protocol_ids":["aerodrome","aave_base"],"reasons_by_protocol":{"aerodrome":"why this specific wallet should consider Aerodrome given its patterns","aave_base":"why this wallet should consider Aave"}}, ...]}. \n' +
                    "- 3 to 6 tips total.\n" +
                    "- At least one tip must explicitly mention the wallet balance in ETH and how that should change behaviour (for small balances, avoiding gas-wasting micro-moves; for larger balances, batching and better routing).\n" +
                    "- At least one tip must explicitly mention one of these ratios or counts: failedTxRatio, zeroValueRatio, smallTxRatio, txCount, totalGasEth, or avgGasPerTx.\n" +
                    "- protocol_ids must only use ids from the provided catalog. If no protocol is relevant for a tip, use an empty array and omit reasons_by_protocol for that tip.",
                },
              ],
            }),
          },
        );

        if (groqRes.ok) {
          const groqJson = await groqRes.json();
          const content: string | undefined =
            groqJson.choices?.[0]?.message?.content;

          if (content) {
            try {
              const parsed = JSON.parse(content) as {
                tips?: {
                  tip?: string;
                  protocol_ids?: string[];
                  reasons_by_protocol?: Record<string, string>;
                }[];
              };

              if (Array.isArray(parsed.tips) && parsed.tips.length > 0) {
                const agentSuggestions: string[] = [];
                const allProtocolIds: string[] = [];
                const reasonsById: Record<string, string> = {};

                for (const t of parsed.tips) {
                  if (t?.tip && typeof t.tip === "string") {
                    agentSuggestions.push(t.tip);
                  }
                  if (Array.isArray(t.protocol_ids)) {
                    for (const id of t.protocol_ids) {
                      allProtocolIds.push(id);
                      const reason = t.reasons_by_protocol?.[id];
                      if (reason) {
                        reasonsById[id] = reason;
                      }
                    }
                  }
                }

                if (agentSuggestions.length > 0) {
                  suggestions = agentSuggestions;
                  protocolTips = mapProtocolIdsToTips(
                    allProtocolIds,
                    reasonsById,
                  );
                }
              }
            } catch (e) {
              console.error("Failed to parse Groq JSON:", e);
            }
          }
        } else {
          console.error("Groq API request failed", await groqRes.text());
        }
      } catch (err) {
        console.error("Groq agent error:", err);
      }
    }

    return NextResponse.json({
      address,
      chain: "Base",
      period: "2m",
      windowLabel,
      totalGasEth,
      txCount,
      avgGasPerTx,
      smallTxRatio,
      failedTxRatio,
      zeroValueRatio,
      balanceEth,
      suggestions,
      protocolTips,
    });
  } catch (err) {
    console.error("Base gas analyzer unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error analyzing Base history" },
      { status: 500 },
    );
  }
}
