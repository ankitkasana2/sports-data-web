"use client"

import React from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Download, Columns3, ArrowUpDown } from "lucide-react"

function exportCSV(filename, rows, columns) {
  const activeCols = columns.filter((c) => c.visible)
  const header = activeCols.map((c) => c.label).join(",")
  const lines = rows.map((r) =>
    activeCols
      .map((c) => {
        const v = c.accessor(r)
        const s = typeof v === "number" ? String(v) : `"${String(v ?? "").replace(/"/g, '""')}"`
        return s
      })
      .join(","),
  )
  const csv = [header, ...lines].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function pct(x) {
  if (x === null || x === undefined || Number.isNaN(x)) return ""
  return `${x.toFixed(1)}%`
}
function pp(x, d = 2) {
  if (x === null || x === undefined || Number.isNaN(x)) return ""
  return x.toFixed(d)
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}
function percentileRank(value, list, accessor) {
  if (!list.length) return 0
  const sorted = [...list].sort((a, b) => accessor(a) - accessor(b))
  const idx = sorted.findIndex((x) => accessor(x) >= value)
  const rank = idx === -1 ? 1 : idx / (sorted.length - 1 || 1)
  return Math.round(rank * 100)
}

export default function RefereesTable({ rows, league, view, rateMode, flags, code, onRowClick }) {
  const parentRef = React.useRef(null)
  const [multiSort, setMultiSort] = React.useState(true)
  const [sorters, setSorters] = React.useState([{ id: "ref_name", dir: "asc" }])
  const [colFilter, setColFilter] = React.useState("")
  const [columns, setColumns] = React.useState(() => {
    // Base column defs; visibility will be user-controllable
    return [
      { id: "ref_name", label: "Referee", visible: true, width: 220, accessor: (r) => r.ref_name },
      { id: "gp", label: "GP", visible: true, width: 70, accessor: (r) => r.gp },
      { id: "whistlesPer100", label: "Whistles/100", visible: true, width: 130, accessor: (r) => r.whistlesPer100 },
      { id: "freesPer100", label: "Frees/100", visible: true, width: 110, accessor: (r) => r.freesPer100 },
      { id: "cardsY", label: "Y Cards/100", visible: true, width: 130, accessor: (r) => r.cardsY },
      { id: "cardsR", label: "R Cards/100", visible: false, width: 130, accessor: (r) => r.cardsR },
      {
        id: "advantageAppliedPct",
        label: "Advantage %",
        visible: true,
        width: 120,
        accessor: (r) => r.advantageAppliedPct,
      },
      {
        id: "advantageQualityDelta",
        label: "Adv Quality Δ (pp100)",
        visible: true,
        width: 180,
        accessor: (r) => r.advantageQualityDelta,
      },
      { id: "possPer60", label: "Poss/60", visible: true, width: 100, accessor: (r) => r.possPer60 },
      {
        id: "twoPtAttemptRate",
        label: "2-pt Att Rate",
        visible: code === "Football",
        width: 140,
        accessor: (r) => r.twoPtAttemptRate * 100,
      },
      { id: "twoPtPct", label: "2-pt %", visible: code === "Football", width: 90, accessor: (r) => r.twoPtPct * 100 },
      { id: "freeDistance", label: "Avg Free Dist (m)", visible: true, width: 160, accessor: (r) => r.freeDistance },
      { id: "penaltiesAtt", label: "Pens att/gm", visible: true, width: 130, accessor: (r) => r.penaltiesAtt },
      { id: "penaltiesConvPct", label: "Pens conv %", visible: true, width: 130, accessor: (r) => r.penaltiesConvPct },
      { id: "homeEdgeIndex", label: "Home-edge index", visible: true, width: 150, accessor: (r) => r.homeEdgeIndex },
      { id: "venueDriftAbs", label: "Venue drift |Δ|", visible: true, width: 140, accessor: (r) => r.venueDriftAbs },
      { id: "yoyFreesStdev", label: "YoY Frees stdev", visible: true, width: 150, accessor: (r) => r.yoyFreesStdev },
    ]
  })

  // Apply radio view + rate mode presentation (placeholder transformations)
  const projected = React.useMemo(() => {
    const factor = rateMode === "perMatch" ? 1 : 1 // using per-100 base mock; keep identity for brevity
    return rows.map((r) => {
      const freesDelta = r.freesPer100 - league.freesPer100
      const possDelta = clamp(r.possPer60 - league.possPer60, -2, 2)
      const expPtsFromFrees = (freesDelta * league.freePointsPerFreeContext) / 100
      const twoPtMult = r.twoPtAttemptRate / league.twoPtAttemptRate
      const exp2ptAttDelta = league.twoPtAttemptRate * (twoPtMult - 1)
      const expPts2pt = 2 * exp2ptAttDelta * r.twoPtPct // simplified demo form
      const freeDistShift = r.freeDistance - league.freeDistance
      const ref = {
        ...r,
        _derived: {
          freesDelta,
          possDelta,
          expPtsFromFrees,
          expPts2pt,
          freeDistShift,
        },
      }
      // If view differs, you could flip signs or derive For/Against when team-filtered.
      return ref
    })
  }, [rows, league, rateMode])

  // Sorting
  const sorted = React.useMemo(() => {
    const activeSorts = sorters.filter(Boolean)
    if (!activeSorts.length) return projected
    const arr = [...projected]
    arr.sort((a, b) => {
      for (const s of activeSorts) {
        const av = getValue(a, s.id)
        const bv = getValue(b, s.id)
        if (av === bv) continue
        const cmp = av > bv ? 1 : -1
        return s.dir === "asc" ? cmp : -cmp
      }
      return 0
    })
    return arr
  }, [projected, sorters])

  function getValue(row, colId) {
    const col = columns.find((c) => c.id === colId)
    if (!col) {
      // derived columns support
      if (colId === "_freesDelta") return row._derived?.freesDelta ?? 0
      if (colId === "_possDelta") return row._derived?.possDelta ?? 0
      if (colId === "_expPtsFromFrees") return row._derived?.expPtsFromFrees ?? 0
      if (colId === "_expPts2pt") return row._derived?.expPts2pt ?? 0
      if (colId === "_freeDistShift") return row._derived?.freeDistShift ?? 0
      return 0
    }
    return col.accessor(row)
  }

  // Column picker filter
  const visibleCols = columns.filter((c) => c.visible)
  const totalWidth = visibleCols.reduce((acc, c) => acc + (c.width || 140), 0)

  // Virtualization
  const rowVirtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 12,
  })

  // Column filter control for picker
  const colFilterLower = colFilter.trim().toLowerCase()
  const filteredColsForPicker = columns.filter((c) => c.label.toLowerCase().includes(colFilterLower))

  function toggleSort(colId) {
    setSorters((prev) => {
      const exists = prev.find((s) => s.id === colId)
      if (!exists) {
        return multiSort ? [...prev, { id: colId, dir: "desc" }] : [{ id: colId, dir: "desc" }]
      }
      const nextDir = exists.dir === "desc" ? "asc" : exists.dir === "asc" ? null : "desc"
      const without = prev.filter((s) => s.id !== colId)
      if (!nextDir) return multiSort ? without : []
      return multiSort ? [...without, { id: colId, dir: nextDir }] : [{ id: colId, dir: nextDir }]
    })
  }

  return (
    <Card className="bg-card">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1 bg-transparent">
              Columns <Columns3 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-72">
            <DropdownMenuLabel>Column Picker</DropdownMenuLabel>
            <div className="p-2">
              <Input placeholder="Filter columns…" value={colFilter} onChange={(e) => setColFilter(e.target.value)} />
            </div>
            <div className="max-h-72 overflow-auto px-2 pb-2">
              {filteredColsForPicker.map((c) => (
                <label key={c.id} className="flex items-center justify-between gap-3 py-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={c.visible}
                      onCheckedChange={(v) =>
                        setColumns((cols) => cols.map((x) => (x.id === c.id ? { ...x, visible: !!v } : x)))
                      }
                    />
                    <span>{c.label}</span>
                  </div>
                  <span className="text-muted-foreground">{c.width ?? 140}px</span>
                </label>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setColumns((cols) => cols.map((c) => ({ ...c, visible: true })))}>
              Show all columns
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setColumns((cols) => cols.map((c) => ({ ...c, visible: false })))}>
              Hide all columns
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          className="gap-1 bg-transparent"
          onClick={() => exportCSV("referees_view.csv", sorted, columns)}
        >
          Export <Download className="h-4 w-4" />
        </Button>

        <Button
          variant={multiSort ? "default" : "outline"}
          onClick={() => setMultiSort((v) => !v)}
          className="ml-auto gap-1"
        >
          Multi-sort <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Header */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-full" style={{ width: totalWidth ? `${totalWidth}px` : "100%" }}>
          <div className="flex items-center border-b bg-muted/40">
            {visibleCols.map((c) => {
              const s = sorters.find((x) => x.id === c.id)
              const sLabel = s ? (s.dir === "asc" ? "↑" : "↓") : ""
              return (
                <button
                  key={c.id}
                  onClick={() => toggleSort(c.id)}
                  className="px-3 py-2 text-left text-sm font-medium hover:bg-muted/60 transition-colors"
                  style={{ width: `${c.width || 140}px` }}
                  title="Click to sort; Multi-sort toggle in toolbar"
                >
                  <span>{c.label}</span>
                  {s && <span className="ml-1 text-muted-foreground">{sLabel}</span>}
                </button>
              )
            })}
            {/* Derived chips region (DIFF / Δ / Percentile) shown as columns group */}
            {flags.showDiff && (
              <div className="px-3 py-2 text-left text-sm font-medium" style={{ width: "160px" }}>
                DIFF
              </div>
            )}
            {flags.showDeltaLeague && (
              <div className="px-3 py-2 text-left text-sm font-medium" style={{ width: "160px" }}>
                Δ vs League (pts)
              </div>
            )}
            {flags.showPercentile && (
              <div className="px-3 py-2 text-left text-sm font-medium" style={{ width: "120px" }}>
                Percentile
              </div>
            )}
          </div>

          {/* Body (virtualized) */}
          <div ref={parentRef} className="h-[600px] overflow-auto">
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((vi) => {
                const row = sorted[vi.index]
                const top = 0
                return (
                  <div
                    key={vi.key}
                    className={`absolute left-0 right-0 border-b hover:bg-muted/30 cursor-pointer`}
                    style={{
                      transform: `translateY(${vi.start}px)`,
                      top,
                      height: `${vi.size}px`,
                    }}
                    onClick={() => onRowClick?.(row)}
                    role="row"
                    aria-label={`Row ${vi.index + 1}`}
                  >
                    <div className="flex items-center text-sm">
                      {visibleCols.map((c) => {
                        const val = c.accessor(row)
                        let txt = val
                        if (c.id === "twoPtAttemptRate" || c.id === "twoPtPct") txt = pct(val)
                        if (typeof val === "number" && c.id !== "gp" && !String(c.id).includes("Pct")) {
                          txt = pp(val, 2)
                        }
                        return (
                          <div
                            key={c.id}
                            className="px-3 py-2 truncate"
                            style={{ width: `${c.width || 140}px` }}
                            title={String(txt)}
                          >
                            {txt}
                          </div>
                        )
                      })}

                      {/* Derived columns region */}
                      {flags.showDiff && (
                        <div className="px-3 py-2" style={{ width: "160px" }}>
                          {/* Example: Frees DIFF and Poss DIFF compact */}
                          <div className="flex items-center gap-3 text-xs">
                            <span title="Frees/100 DIFF">F: {pp(row._derived.freesDelta, 2)}</span>
                            <span title="Poss/60 DIFF">P: {pp(row._derived.possDelta, 2)}</span>
                          </div>
                        </div>
                      )}
                      {flags.showDeltaLeague && (
                        <div className="px-3 py-2 text-xs" style={{ width: "160px" }}>
                          {/* Example drivers: frees → pts and 2-pt → pts */}
                          <div title="Frees Δ → pts/team">Free pts: {pp(row._derived.expPtsFromFrees, 2)}</div>
                          {code === "Football" && (
                            <div title="2-pt multiplier → pts/team">2-pt pts: {pp(row._derived.expPts2pt, 2)}</div>
                          )}
                        </div>
                      )}
                      {flags.showPercentile && (
                        <div className="px-3 py-2 text-xs" style={{ width: "120px" }}>
                          {/* Example percentile: whistles/100 */}
                          {percentileRank(row.whistlesPer100, rows, (x) => x.whistlesPer100)}p
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
