"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function MetricsTable({
  entityType,
  entities,
  metrics,
  thresholds,
  rateMode,
  triToggle,
  percentile,
  deltaVsLeague,
  oppAdjusted,
  normalizeExposure,
  hideFootballOnly,
  hideHurlingOnly,
}) {
  const rows = metrics

  const table = useMemo(() => {
    // Prepare best/worst per row based on threshold gates
    return rows.map((row) => {
      // compute best/worst by comparing values; simplified example
      const values = entities.map((e) => safeNumber(getValue(row, e.id, rateMode)))
      const max = Math.max(...values)
      const min = Math.min(...values)
      const sig = Math.abs(max - min) >= (thresholds[row.key] || 0)
      return { row, values, max, min, sig }
    })
  }, [rows, entities, rateMode, thresholds])

  if (!entities.length) {
    return (
      <Card className="p-6 bg-secondary">
        <div className="text-sm text-muted-foreground">Select 2–4 {entityType} to begin comparison.</div>
      </Card>
    )
  }

  return (
    <div className="grid gap-3">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Metric</th>
              {entities.map((e) => (
                <th key={e.id} className="text-right p-3">
                  {e.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map(({ row, values, max, min, sig }) => {
              // code-awareness examples: hide rows when flagged
              if (hideFootballOnly && row.footballOnly) return null
              if (hideHurlingOnly && row.hurlingOnly) return null
              return (
                <tr key={row.key} id={`metric-${row.key}`} className="border-t border-border">
                  <td className="p-3 align-top">
                    <div className="font-medium">{row.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.unit} {oppAdjusted ? "· Adj by Elo" : ""} {percentile ? "· Percentile" : ""}
                      {deltaVsLeague ? " · Δ vs League" : ""}
                    </div>
                  </td>
                  {values.map((v, idx) => {
                    const isBest = v === max
                    const isWorst = v === min
                    // Only color if significance threshold passed
                    const highlight =
                      sig && (isBest || isWorst)
                        ? isBest
                          ? "bg-accent text-accent-foreground"
                          : "bg-destructive/10"
                        : ""
                    const greyLowSample = row.lowSample?.[entities[idx].id]
                    const textMuted = greyLowSample ? "text-muted-foreground" : ""
                    return (
                      <td key={entities[idx].id} className={cn("p-3 text-right align-top", highlight, textMuted)}>
                        <div>{formatValue(v, row)}</div>
                        {row.badge?.[entities[idx].id] && (
                          <div className="text-xs text-muted-foreground">({row.badge[entities[idx].id]})</div>
                        )}
                        {greyLowSample && <div className="text-[10px] text-muted-foreground">⚠ low sample</div>}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {table.map(({ row, values, max, min, sig }) => (
          <Card key={row.key} id={`metric-${row.key}`} className="p-3">
            <div className="mb-2">
              <div className="font-medium">{row.label}</div>
              <div className="text-xs text-muted-foreground">{row.unit}</div>
            </div>
            <div className="grid gap-2">
              {entities.map((e, idx) => {
                const v = values[idx]
                const isBest = v === max
                const isWorst = v === min
                const highlight =
                  sig && (isBest || isWorst) ? (isBest ? "bg-accent text-accent-foreground" : "bg-destructive/10") : ""
                const greyLowSample = row.lowSample?.[e.id]
                const textMuted = greyLowSample ? "text-muted-foreground" : ""
                return (
                  <div key={e.id} className={cn("flex items-center justify-between rounded-md p-2", highlight)}>
                    <div className="text-sm">{e.name}</div>
                    <div className={cn("text-sm", textMuted)}>{formatValue(v, row)}</div>
                  </div>
                )
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function getValue(row, entityId, rateMode) {
  // Simplified selector: choose rate variant if available
  const v = row.values[entityId]
  if (!v) return null
  if (rateMode === "per-100" && typeof v.per100 === "number") return v.per100
  if (rateMode === "per-60" && typeof v.per60 === "number") return v.per60
  return typeof v.value === "number" ? v.value : null
}

function safeNumber(n) {
  return Number.isFinite(n) ? n : 0
}

function formatValue(v, row) {
  if (!Number.isFinite(v)) return "-"
  if (row.unit === "%" || row.isPercent) return `${v.toFixed(1)}%`
  if (row.unit === "pp100") return `${v.toFixed(1)}`
  if (row.unit === "poss/60") return `${v.toFixed(1)}`
  if (row.unit === "s") return `${v.toFixed(1)}s`
  return `${v.toFixed(2)}`
}
