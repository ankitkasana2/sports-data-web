"use client"

import { Button } from "../../ui/button"

export default function ExportControls({ A, B, possessions, outputs, drivers, ledger, mc, filters, scenario, market }) {
  function onExport() {
    const rows = []
    rows.push(["Team A", A.name])
    rows.push(["Team B", B.name])
    rows.push(["Season", filters.season])
    rows.push([])
    rows.push(["Possessions total", possessions.total])
    rows.push(["Ref pace", possessions.refPace])
    rows.push(["Added time", possessions.addedTime])
    rows.push(["Latency", possessions.latency])
    rows.push([])
    rows.push(["Pts A", outputs.ptsA])
    rows.push(["Pts B", outputs.ptsB])
    rows.push(["Total", outputs.total])
    rows.push(["Margin", outputs.margin])
    rows.push(["WinProb A", outputs.winProbA])
    rows.push(["WinProb B", outputs.winProbB])
    rows.push(["Fair price A", outputs.fairPriceA])
    rows.push(["Fair price B", outputs.fairPriceB])
    rows.push(["Fair handicap A", outputs.fairHandicapA])
    rows.push([])
    rows.push(["Drivers"])
    rows.push(["Driver", "Team A", "Team B"])
    drivers.rows.forEach((r) => rows.push([r.name, r.a, r.b]))
    rows.push(["Total ORtg change", drivers.total.a, drivers.total.b])
    rows.push([])
    rows.push(["Component ledger A"])
    rows.push(["Component", "Attempts", "Conv", "Value", "pp100"])
    ledger.a.forEach((x) => rows.push([x.name, x.attempts, x.conv, x.value, x.pp100]))
    rows.push([])
    rows.push(["Component ledger B"])
    rows.push(["Component", "Attempts", "Conv", "Value", "pp100"])
    ledger.b.forEach((x) => rows.push([x.name, x.attempts, x.conv, x.value, x.pp100]))
    if (mc) {
      rows.push([])
      rows.push(["Uncertainty"])
      rows.push(["Metric", "median", "p25", "p75", "p5", "p95"])
      const add = (label, v) => rows.push([label, v.median, v.p25, v.p75, v.p5, v.p95])
      add("pointsA", mc.pointsA)
      add("pointsB", mc.pointsB)
      add("total", mc.total)
      add("margin", mc.margin)
    }
    rows.push([])
    rows.push(["Scenario"])
    Object.entries(scenario).forEach(([k, v]) => rows.push([k, JSON.stringify(v)]))
    rows.push([])
    rows.push(["Market"])
    Object.entries(market).forEach(([k, v]) => rows.push([k, v]))

    const csv = rows
      .map((r) =>
        r
          .map((cell) => {
            if (cell == null) return ""
            const s = String(cell)
            if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
            return s
          })
          .join(","),
      )
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "prediction_export.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center justify-end">
      <Button onClick={onExport}>Export CSV</Button>
    </div>
  )
}
