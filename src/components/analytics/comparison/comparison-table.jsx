"use client"

import { useMemo, useState } from "react"

function toCSV(rows) {
  if (!rows?.length) return ""
  const headers = Object.keys(rows[0])
  const lines = [headers.join(",")]
  rows.forEach((r) => {
    lines.push(headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))
  })
  return lines.join("\n")
}

export default function ComparisonTable({
  entities, // [{ id, name, samples, metrics: { attack:{for,against,n}, defense:{...}, ... } }]
  columns, // e.g. ["attack","defense","shooting","transitions","discipline","context"]
  leagueAverages, // same shape as metrics to compute Δ vs League
  showDiff = true,
  showDeltaLeague = true,
  showPercentiles = true,
  minN = 30,
  onRowDrill, // (entity) => void
  onCellDrill, // ({entity, metricKey, facet}) => void
}) {
  const [visibleCols, setVisibleCols] = useState(columns)
  const [sorts, setSorts] = useState([]) // [{key, facet:'for'|'against'|'diff', dir:'asc'|'desc'}]

  const allMetricKeys = useMemo(() => columns, [columns])

  const toggleCol = (key) => {
    setVisibleCols((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const headers = useMemo(() => {
    return visibleCols.map((key) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
    }))
  }, [visibleCols])

  const withDerived = useMemo(() => {
    return entities.map((e) => {
      const derived = {}
      allMetricKeys.forEach((k) => {
        const m = e.metrics[k] || { for: 0, against: 0, n: 0 }
        const diff = (m.for ?? 0) - (m.against ?? 0)
        const league = leagueAverages?.[k] || { for: 0, against: 0 }
        const delta = {
          for: (m.for ?? 0) - (league.for ?? 0),
          against: (m.against ?? 0) - (league.against ?? 0),
          diff: diff - ((league.for ?? 0) - (league.against ?? 0)),
        }
        derived[k] = { ...m, diff, delta }
      })
      return { ...e, derived }
    })
  }, [entities, allMetricKeys, leagueAverages])

  // Percentiles (0..100) among current entities for each metric facet
  const percentiles = useMemo(() => {
    const out = {}
    allMetricKeys.forEach((k) => {
      ;["for", "against", "diff"].forEach((facet) => {
        const values = withDerived.map((e) => e.derived[k]?.[facet] ?? 0)
        const sorted = [...values].sort((a, b) => a - b)
        const rank = (v) => {
          const idx = sorted.findIndex((x) => x >= v)
          const i = idx === -1 ? sorted.length - 1 : idx
          return Math.round((i / Math.max(sorted.length - 1, 1)) * 100)
        }
        out[`${k}:${facet}`] = withDerived.map((e) => rank(e.derived[k]?.[facet] ?? 0))
      })
    })
    return out
  }, [withDerived, allMetricKeys])

  const sortedRows = useMemo(() => {
    if (!sorts.length) return withDerived
    const next = [...withDerived]
    next.sort((a, b) => {
      for (const s of sorts) {
        const av = a.derived[s.key]?.[s.facet] ?? 0
        const bv = b.derived[s.key]?.[s.facet] ?? 0
        if (av === bv) continue
        return s.dir === "asc" ? av - bv : bv - av
      }
      return 0
    })
    return next
  }, [withDerived, sorts])

  const onHeaderClick = (key, facet, multi) => {
    setSorts((prev) => {
      const existingIdx = prev.findIndex((s) => s.key === key && s.facet === facet)
      const next = multi ? [...prev] : []
      if (existingIdx === -1) {
        next.push({ key, facet, dir: "desc" })
      } else if (prev[existingIdx].dir === "desc") {
        next[existingIdx] = { ...prev[existingIdx], dir: "asc" }
      } else {
        // remove
        next.splice(existingIdx, 1)
      }
      return next
    })
  }

  const exportCurrent = () => {
    const rows = sortedRows.map((e) => {
      const flat = { id: e.id, name: e.name, samples: e.samples }
      visibleCols.forEach((k) => {
        const m = e.derived[k]
        flat[`${k}_for`] = m?.for ?? 0
        flat[`${k}_against`] = m?.against ?? 0
        flat[`${k}_diff`] = m?.diff ?? 0
        if (showDeltaLeague) {
          flat[`delta_${k}_for`] = m?.delta?.for ?? 0
          flat[`delta_${k}_against`] = m?.delta?.against ?? 0
          flat[`delta_${k}_diff`] = m?.delta?.diff ?? 0
        }
      })
      return flat
    })
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "comparison_export.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Helper for cell style (min-N)
  const cellClass = (n) => (n < minN ? "opacity-50" : "")

  return (
    <section className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {allMetricKeys.map((k) => (
            <button
              key={k}
              onClick={() => toggleCol(k)}
              className={`rounded-md border px-2 py-1 text-xs ${visibleCols.includes(k) ? "bg-primary text-primary-foreground" : "bg-background"}`}
              aria-pressed={visibleCols.includes(k)}
              aria-label={`Toggle column ${k}`}
              title={`Toggle ${k}`}
            >
              {visibleCols.includes(k) ? `✓ ${k}` : k}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCurrent}
            className="rounded-md border bg-primary text-primary-foreground px-3 py-1 text-sm"
          >
            Export view
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="sticky left-0 bg-muted px-3 py-2 text-left">Team/Player</th>
              <th className="px-3 py-2 text-left">Samples</th>
              {headers.map((h) => (
                <th key={h.key} className="px-3 py-2 text-left">
                  <div className="flex items-center gap-3">
                    <span>{h.label}</span>
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        onClick={(e) => onHeaderClick(h.key, "for", e.shiftKey)}
                        className="rounded border px-1 py-0.5"
                        title="Sort by For (shift for multi-sort)"
                      >
                        For
                        {sorts.find((s) => s.key === h.key && s.facet === "for")
                          ? ` (${sorts.find((s) => s.key === h.key && s.facet === "for").dir})`
                          : ""}
                      </button>
                      <button
                        onClick={(e) => onHeaderClick(h.key, "against", e.shiftKey)}
                        className="rounded border px-1 py-0.5"
                        title="Sort by Against (shift for multi-sort)"
                      >
                        Against
                        {sorts.find((s) => s.key === h.key && s.facet === "against")
                          ? ` (${sorts.find((s) => s.key === h.key && s.facet === "against").dir})`
                          : ""}
                      </button>
                      {showDiff && (
                        <button
                          onClick={(e) => onHeaderClick(h.key, "diff", e.shiftKey)}
                          className="rounded border px-1 py-0.5"
                          title="Sort by DIFF (shift for multi-sort)"
                        >
                          DIFF
                          {sorts.find((s) => s.key === h.key && s.facet === "diff")
                            ? ` (${sorts.find((s) => s.key === h.key && s.facet === "diff").dir})`
                            : ""}
                        </button>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((e, rowIndex) => (
              <tr key={e.id} className="odd:bg-card/50 hover:bg-accent cursor-pointer" onClick={() => onRowDrill?.(e)}>
                <td className="sticky left-0 bg-background px-3 py-2">
                  <div className="font-medium">{e.name}</div>
                </td>
                <td className="px-3 py-2">{e.samples}</td>
                {headers.map((h) => {
                  const m = e.derived[h.key] || {}
                  const n = e.metrics[h.key]?.n ?? 0
                  const pctFor = showPercentiles ? percentiles[`${h.key}:for`]?.[rowIndex] : null
                  const pctAgainst = showPercentiles ? percentiles[`${h.key}:against`]?.[rowIndex] : null
                  const pctDiff = showPercentiles ? percentiles[`${h.key}:diff`]?.[rowIndex] : null
                  return (
                    <td key={h.key} className="px-3 py-2">
                      <div className={`grid grid-cols-3 gap-2 ${cellClass(n)}`}>
                        <button
                          className="text-left rounded border px-2 py-1"
                          title={`For${pctFor != null ? ` • pct ${pctFor}` : ""}`}
                          onClick={(ev) => {
                            ev.stopPropagation()
                            onCellDrill?.({ entity: e, metricKey: h.key, facet: "for" })
                          }}
                        >
                          <div className="text-xs text-muted-foreground">For</div>
                          <div>{m.for?.toFixed(2) ?? "-"}</div>
                          {showDeltaLeague && (
                            <div className="text-xs text-muted-foreground">Δ {m.delta?.for?.toFixed(2) ?? "-"}</div>
                          )}
                        </button>
                        <button
                          className="text-left rounded border px-2 py-1"
                          title={`Against${pctAgainst != null ? ` • pct ${pctAgainst}` : ""}`}
                          onClick={(ev) => {
                            ev.stopPropagation()
                            onCellDrill?.({ entity: e, metricKey: h.key, facet: "against" })
                          }}
                        >
                          <div className="text-xs text-muted-foreground">Against</div>
                          <div>{m.against?.toFixed(2) ?? "-"}</div>
                          {showDeltaLeague && (
                            <div className="text-xs text-muted-foreground">Δ {m.delta?.against?.toFixed(2) ?? "-"}</div>
                          )}
                        </button>
                        {showDiff && (
                          <button
                            className="text-left rounded border px-2 py-1"
                            title={`DIFF${pctDiff != null ? ` • pct ${pctDiff}` : ""}`}
                            onClick={(ev) => {
                              ev.stopPropagation()
                              onCellDrill?.({ entity: e, metricKey: h.key, facet: "diff" })
                            }}
                          >
                            <div className="text-xs text-muted-foreground">DIFF</div>
                            <div>{m.diff?.toFixed(2) ?? "-"}</div>
                            {showDeltaLeague && (
                              <div className="text-xs text-muted-foreground">Δ {m.delta?.diff?.toFixed(2) ?? "-"}</div>
                            )}
                          </button>
                        )}
                      </div>
                      {n < minN && (
                        <div className="mt-1 text-xs text-muted-foreground" aria-label="Low sample warning">
                          Min-N: greyed due to low sample ({n})
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
