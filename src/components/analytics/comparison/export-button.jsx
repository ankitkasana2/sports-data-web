"use client"

import { Button } from "@/components/ui/button"

export default function ExportButton({
  mode,
  entityType,
  entities,
  metrics,
  diffs,
  sampleWindow,
  oppAdjusted,
  deltaVsLeague,
  percentile,
  normalizeExposure,
  triToggle,
  baselineIndex,
}) {
  function handleExport() {
    const header = [
      "section",
      "sample_window",
      "opp_adjusted",
      "delta_vs_league",
      "percentile",
      "normalize_exposure",
      "mode",
      "baseline_index",
      "tri_toggle",
    ]
    const meta = [
      entityType,
      sampleWindow,
      oppAdjusted ? "1" : "0",
      deltaVsLeague ? "1" : "0",
      percentile ? "1" : "0",
      normalizeExposure ? "1" : "0",
      mode,
      baselineIndex,
      triToggle,
    ]

    const rows = []
    if (mode === "side-by-side") {
      const head = ["metric", ...entities.map((e) => e.name)]
      rows.push(head.join(","))
      metrics.forEach((m) => {
        const vals = entities.map((e) => {
          const v = m.values[e.id]?.value
          return Number.isFinite(v) ? v : ""
        })
        rows.push([m.label, ...vals].join(","))
      })
    } else {
      // diff mode
      rows.push(["metric", "Δ vs baseline", "is_significant"].join(","))
      metrics.forEach((m) => {
        const d = diffs[m.key]
        rows.push([m.label, d?.maxGap ?? "", d?.isSignificant ? "1" : "0"].join(","))
      })
    }

    const csv = [header.join(","), meta.join(","), "", ...rows].join("\n")

    downloadBlob(csv, `comparison-${mode}.csv`, "text/csv;charset=utf-8;")
  }

  return (
    <Button onClick={handleExport} variant="default" aria-label="Export current comparison">
      Export
    </Button>
  )
}

function downloadBlob(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
