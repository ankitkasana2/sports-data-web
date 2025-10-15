"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DiffTable({ entities, metrics, diffs, baselineIndex, setBaselineIndex }) {
  const [sortAbs, setSortAbs] = useState(true)

  const rows = useMemo(() => {
    const r = metrics.map((m) => {
      const delta = diffs[m.key]
      return {
        key: m.key,
        label: m.label,
        unit: m.unit,
        delta,
        abs: Math.abs(delta?.maxGap || 0),
        isSignificant: !!delta?.isSignificant,
      }
    })
    return r.sort((a, b) => {
      if (sortAbs) return b.abs - a.abs
      return (b.delta?.maxGap || 0) - (a.delta?.maxGap || 0)
    })
  }, [metrics, diffs, sortAbs])

  if (entities.length < 2) {
    return (
      <Card className="p-6 bg-secondary">
        <div className="text-sm text-muted-foreground">Select at least 2 entities to see diffs.</div>
      </Card>
    )
  }

  return (
    <div className="grid gap-3">
      <Card className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Baseline:</span>
          {entities.map((e, idx) => (
            <Button
              key={e.id}
              size="sm"
              variant={idx === baselineIndex ? "default" : "secondary"}
              onClick={() => setBaselineIndex(idx)}
              aria-pressed={idx === baselineIndex}
            >
              {e.name}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant={sortAbs ? "default" : "secondary"} onClick={() => setSortAbs(!sortAbs)}>
            Sort by |Δ|
          </Button>
        </div>
      </Card>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Metric</th>
              <th className="text-right p-3">Δ vs Baseline</th>
              <th className="text-right p-3">Significant?</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-border">
                <td className="p-3">{r.label}</td>
                <td className="p-3 text-right">{formatDelta(r.delta?.maxGap, r.unit)}</td>
                <td className="p-3 text-right">
                  {r.isSignificant ? "Yes" : <span className="text-muted-foreground">No</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function formatDelta(v, unit) {
  if (!Number.isFinite(v)) return "-"
  if (unit === "%") return `${v >= 0 ? "+" : ""}${v.toFixed(1)}pp`
  if (unit === "pp100") return `${v >= 0 ? "+" : ""}${v.toFixed(1)}`
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}`
}
