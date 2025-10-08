function impliedProbFromOdds(odds) {
  // decimal odds -> implied probability
  const o = Number(odds || 0)
  if (!o || o <= 1) return 0
  return 1 / o
}

export default function MarketCompare({
  teamA,
  teamB,
  predicted, // { a:0..1, b:0..1 }
  odds, // { a:number, b:number } decimal odds
}) {
  const market = {
    a: impliedProbFromOdds(odds?.a),
    b: impliedProbFromOdds(odds?.b),
  }
  const edge = {
    a: (predicted?.a ?? 0) - market.a,
    b: (predicted?.b ?? 0) - market.b,
  }

  const fmtPct = (x) => `${Math.round((x ?? 0) * 100)}%`

  return (
    <section className="rounded-lg border bg-card p-4">
      <h3 className="text-sm text-muted-foreground">Market Compare</h3>
      <div className="mt-3 overflow-auto">
        <table className="min-w-[480px] text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left">Team</th>
              <th className="px-3 py-2 text-left">Predicted Prob</th>
              <th className="px-3 py-2 text-left">Book Odds</th>
              <th className="px-3 py-2 text-left">Implied Prob</th>
              <th className="px-3 py-2 text-left">Edge</th>
            </tr>
          </thead>
          <tbody>
            <tr className="odd:bg-card/50">
              <td className="px-3 py-2">{teamA}</td>
              <td className="px-3 py-2">{fmtPct(predicted?.a)}</td>
              <td className="px-3 py-2">{odds?.a ?? "-"}</td>
              <td className="px-3 py-2">{fmtPct(market.a)}</td>
              <td
                className={`px-3 py-2 ${edge.a > 0 ? "text-green-600" : edge.a < 0 ? "text-red-600" : "text-muted-foreground"}`}
              >
                {edge.a > 0 ? "+" : ""}
                {(edge.a * 100).toFixed(1)}%
              </td>
            </tr>
            <tr className="odd:bg-card/50">
              <td className="px-3 py-2">{teamB}</td>
              <td className="px-3 py-2">{fmtPct(predicted?.b)}</td>
              <td className="px-3 py-2">{odds?.b ?? "-"}</td>
              <td className="px-3 py-2">{fmtPct(market.b)}</td>
              <td
                className={`px-3 py-2 ${edge.b > 0 ? "text-green-600" : edge.b < 0 ? "text-red-600" : "text-muted-foreground"}`}
              >
                {edge.b > 0 ? "+" : ""}
                {(edge.b * 100).toFixed(1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Edge = Predicted probability − Implied probability from market odds.
      </p>
    </section>
  )
}