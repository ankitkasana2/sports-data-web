
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"

function avg(arr, key) {
  const xs = arr.map((x) => x[key]).filter((v) => typeof v === "number")
  if (!xs.length) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

export default function OverviewCards({ rows }) {
  const kpis = [
    { label: "Avg ORtg", value: avg(rows, "ortg_for").toFixed(1) },
    { label: "Avg DRtg", value: avg(rows, "drtg_against").toFixed(1) },
    { label: "Avg Pace (poss/60)", value: avg(rows, "pace").toFixed(1) },
    { label: "TO→Shot ≤15s (For)", value: ((avg(rows, "to_shot_15_for") || 0) * 100).toFixed(1) + "%" },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((k) => (
        <Card key={k.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{k.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{k.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
