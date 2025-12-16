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

// Make balance fetching tolerant of different explorer response shapes
async function fetchBalanceEth(
  apiBaseUrl: string,
  apiKey: string,
  address: string,
): Promise<number | null> {
  const params = new URLSearchParams({
    apikey: apiKey,
    chainid: "8453",
    module: "account",
    action: "balance",
    address,
    tag: "latest",
  });

  try {
    const res = await fetch(`${apiBaseUrl}?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        "Balance API HTTP error:",
        res.status,
        res.statusText,
      );
      return null;
    }

    const json: any = await res.json();

    // Try several common shapes
    let raw: unknown = null;

    if (typeof json.result === "string") {
      // v1-style: { status: "1", result: "123456..." }
      raw = json.result;
    } else if (
      Array.isArray(json.result) &&
      json.result[0] &&
      typeof json.result[0].balance === "string"
    ) {
      // some explorers: { result: [{ balance: "123..." }] }
      raw = json.result[0].balance;
    } else if (
      typeof json.result === "object" &&
      json.result !== null
    ) {
      // v2 or custom wrapper: { result: { balance: "123..." } }
      if (typeof json.result.balance === "string") {
        raw = json.result.balance;
      } else if (typeof json.result.Balance === "string") {
        raw = json.result.Balance;
      }
    } else if (typeof json.balance === "string") {
      // very custom: { balance: "123..." }
      raw = json.balance;
    }

    if (!raw) {
      console.error("Balance API unexpected payload, json =", json);
      return null;
    }

    const num = Number(raw);
    if (Number.isNaN(num)) {
      console.error("Balance is not numeric:", raw);
      return null;
    }

    return num / 1e18;
  } catch (err) {
    console.error("Error calling balance API:", err);
    return null;
  }
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

  // Use whatever explorer you wired earlier (BaseScan/Etherscan v2 style)
  const apiBaseUrl = "https://api.etherscan.io/v2/api";

  // Only 2 months supported for now
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
          "Action: bridge a small amount to Base, pick one or two apps you like, and do a few simple swaps or deposits instead of random tests.",
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

    // --- Balance (best effort) ---
    const balanceEth = await fetchBalanceEth(apiBaseUrl, apiKey, address);

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
          "Action: when you move to Base, think of gas as small fees you pay to grow your positions. Try to make every transaction do something useful for you.",
        ],
        protocolTips: mapProtocolIdsToTips(["base_bridge"]),
      });
    }

    // --- Aggregate stats ---
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

    // --- Baseline suggestions (used if Groq missing/fails) ---
    const baseSuggestions: string[] = [];
    const baseProtocolIds: string[] = [];

    if (avgGasPerTx > 0.0005) {
      baseSuggestions.push(
        `Your average gas per transaction on Base over the last ${windowLabel} is ${avgGasPerTx.toFixed(
          5,
        )} ETH. Try to group related actions together so you pay this fee fewer times.`,
      );
      baseProtocolIds.push("uniswap_base");
    }

    if (smallTxRatio > 0.3) {
      baseSuggestions.push(
        `About ${(smallTxRatio * 100).toFixed(
          1,
        )}% of your transactions move very small amounts. This makes gas feel heavier. Try to avoid many tiny moves and do fewer, bigger ones when possible.`,
      );
      baseProtocolIds.push("aerodrome");
    }

    if (failedTxRatio > 0.05) {
      baseSuggestions.push(
        `Around ${(failedTxRatio * 100).toFixed(
          1,
        )}% of your transactions are failing. Each failed tx still burns gas. Before you send a tx, double-check you have enough balance and the settings are correct.`,
      );
      baseProtocolIds.push("uniswap_base");
    }

    if (zeroValueRatio > 0.25) {
      baseSuggestions.push(
        `Roughly ${(zeroValueRatio * 100).toFixed(
          1,
        )}% of your transactions do not move any ETH (they are approvals or setup steps). These are fine sometimes, but try to clean up old approvals and avoid extra steps you no longer need.`,
      );
      baseProtocolIds.push("beefy_base", "aave_base");
    }

    if (highValue > 0 && totalGasEth / (highValue || 1) > 0.002) {
      baseSuggestions.push(
        "You have some bigger moves where gas and slippage can hurt you. For those, take a moment to compare one or two different swap routes before you click confirm.",
      );
      baseProtocolIds.push("uniswap_base");
    }

    if (baseSuggestions.length === 0) {
      baseSuggestions.push(
        `Your Base gas usage over the last ${windowLabel} looks quite clean. Still, it helps to check your last few transactions every month and ask: did this fee really move me forward?`,
      );
      baseProtocolIds.push("aave_base", "beefy_base");
    }

    let suggestions = baseSuggestions;
    let protocolTips = mapProtocolIdsToTips(baseProtocolIds);

    // --- Groq agent remains the same as before ---
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
                    "You are Base Gas Coach, a friendly DeFi guide for people using the Base chain.\n" +
                    "You are given: (1) stats for the last 2 months on Base, (2) a small transaction sample, (3) the current ETH balance on Base, and (4) a catalog of Base-native protocols.\n" +
                    "- Speak in simple, clear English that anyone can follow, even if this is their first time using DeFi.\n" +
                    "- Prefer short sentences and plain words. Avoid heavy jargon.\n" +
                    "- If you must use a technical word (like 'liquidity pool' or 'slippage'), add a short explanation in brackets.\n" +
                    "- Focus on what THIS wallet actually did: gas usage, failed transactions, approvals, small frequent moves, and whether gas is going to useful actions or waste.\n" +
                    "- Every tip must mention at least one concrete metric or pattern from the data.",
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
                    'Return ONLY a JSON object with this shape: {"tips":[{"tip":"one concrete improvement tailored to this wallet","protocol_ids":["aerodrome","aave_base"],"reasons_by_protocol":{"aerodrome":"why this specific wallet should consider Aerodrome given its patterns","aave_base":"why this wallet should consider Aave"}}, ...]}.\n' +
                    "- Write 3 to 6 tips total.\n" +
                    "- Each tip must be 1–3 short sentences, using simple language and no fluff.\n" +
                    "- At least one tip must clearly mention the wallet balance in ETH (balanceEth) and how that should change behaviour.\n" +
                    "- At least one tip must clearly mention one of these: failedTxRatio, zeroValueRatio, smallTxRatio, txCount, totalGasEth, or avgGasPerTx.\n" +
                    "- Every tip must be wallet-specific.",
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
