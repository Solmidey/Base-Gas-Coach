import {
  actionPriority,
  bridges,
  dexes,
  generalTips,
  getCoachMood,
  getCoachStatus,
  lpExamples,
  recommendedActions,
} from "../lib/coach";

export function CoachCard({ currentGwei }: { currentGwei: number | null }) {
  const status = getCoachStatus(currentGwei ?? 999);
  const mood = getCoachMood(status);
  const priority = actionPriority(status);

  const badgeClass =
    status === "green"
      ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
      : status === "yellow"
      ? "bg-amber-500/20 border-amber-400/30 text-amber-200"
      : "bg-rose-500/20 border-rose-400/30 text-rose-200";

  return (
    <section className="glass p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Coach Mode</h2>
          <p className="text-sm text-white/70">
            General best practices to help you move smarter on Base. Not financial advice.
          </p>
        </div>
        <span className={`chip border ${badgeClass}`}>
          <span className="text-base">{mood.emoji}</span>
          <span>{mood.label}</span>
        </span>
      </div>

      <div className="mt-4 glass p-4">
        <p className="text-xs text-white/60">Gas-aware suggestions</p>
        <ul className="mt-2 space-y-1 text-sm">
          {recommendedActions(status).map((t) => (
            <li key={t} className="muted">
              • {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="glass p-4">
          <h3 className="text-sm font-semibold">Action priority</h3>
          <div className="mt-2 space-y-1 text-xs text-white/70">
            <div className="flex justify-between">
              <span>Transfer</span>
              <b>{priority.transfer}</b>
            </div>
            <div className="flex justify-between">
              <span>ERC20</span>
              <b>{priority.erc20}</b>
            </div>
            <div className="flex justify-between">
              <span>Swap</span>
              <b>{priority.swap}</b>
            </div>
            <div className="flex justify-between">
              <span>Mint</span>
              <b>{priority.mint}</b>
            </div>
          </div>
        </div>

        <div className="glass p-4">
          <h3 className="text-sm font-semibold">Common bridges</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {bridges.map((b) => (
              <li key={b.name}>
                <a
                  className="underline decoration-white/20 hover:decoration-white/60"
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {b.name}
                </a>
                <div className="text-white/60">{b.bestFor}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass p-4">
          <h3 className="text-sm font-semibold">DEX & LP learning</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {dexes.map((d) => (
              <li key={d.name}>
                <a
                  className="underline decoration-white/20 hover:decoration-white/60"
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {d.name}
                </a>
                <div className="text-white/60">{d.notes}</div>
              </li>
            ))}
            <div className="pt-2 border-t border-white/10">
              {lpExamples.map((p) => (
                <div key={p.protocol + p.pair} className="text-white/60">
                  <b className="text-white/80">{p.protocol}</b> — {p.pair}
                </div>
              ))}
            </div>
          </ul>
        </div>
      </div>

      <div className="mt-4 glass p-4">
        <h3 className="text-sm font-semibold">Good habits</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {generalTips.map((t) => (
            <li key={t} className="muted">
              • {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
