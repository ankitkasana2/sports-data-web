export default function PredictionOutput({
  teamA,
  teamB,
  scoreline, // { a: number, b: number }
  winProb, // { a: number, b: number } as 0..1
  drivers = [], // [{ label, impact, note }]
}) {
  const toPct = (x) => `${Math.round((x ?? 0) * 100)}%`

  return (
    <section className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="rounded-lg border bg-card p-4">
          <h3 className="text-sm text-muted-foreground">Projected Scoreline</h3>
          <div className="mt-2 text-2xl font-semibold">
            {teamA} {scoreline?.a?.toFixed?.(2) ?? "-"} — {scoreline?.b?.toFixed?.(2) ?? "-"} {teamB}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Expected goals/points based on current filters and sample window.
          </p>
        </article>

        <article className="rounded-lg border bg-card p-4">
          <h3 className="text-sm text-muted-foreground">Win Probability</h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">{teamA}</div>
              <div className="text-xl font-semibold">{toPct(winProb?.a)}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">{teamB}</div>
              <div className="text-xl font-semibold">{toPct(winProb?.b)}</div>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Probabilities derived from model projection.</p>
        </article>

        <article className="rounded-lg border bg-card p-4">
          <h3 className="text-sm text-muted-foreground">Key Drivers</h3>
          <ul className="mt-2 grid gap-2">
            {drivers.map((d, i) => (
              <li key={i} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{d.label}</span>
                  <span
                    className={`text-xs ${d.impact > 0 ? "text-green-600" : d.impact < 0 ? "text-red-600" : "text-muted-foreground"}`}
                  >
                    {d.impact > 0 ? "+" : ""}
                    {d.impact.toFixed(2)}
                  </span>
                </div>
                {d.note && <p className="mt-1 text-sm text-muted-foreground">{d.note}</p>}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}