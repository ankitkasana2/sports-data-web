/**
 * Min-N gates based on the spec (simplified defaults; adjust per metric key as needed)
 */
export const MIN_N_THRESHOLDS = {
  // generic bands
  default: 10,
  two_pt_overall: 10,
  two_pt_sector: 6,
  pens: 5,
  ko_band: 20,
  end_splits_games: 3,
  end_splits_shots: 40,
}

export function passesMinN(metricKey, attempts) {
  if (attempts == null) return false
  // Simple heuristic mapping
  if (metricKey?.includes("two_pt") && metricKey?.includes("sector")) {
    return attempts >= MIN_N_THRESHOLDS.two_pt_sector
  }
  if (metricKey?.includes("two_pt")) {
    return attempts >= MIN_N_THRESHOLDS.two_pt_overall
  }
  if (metricKey?.includes("pen")) {
    return attempts >= MIN_N_THRESHOLDS.pens
  }
  if (metricKey?.includes("ko_ret") || metricKey?.includes("crossed40")) {
    return attempts >= MIN_N_THRESHOLDS.ko_band
  }
  return attempts >= MIN_N_THRESHOLDS.default
}

/**
 * EB shrinkage placeholder: returns raw value for now; hook up to a model later.
 */
export function shrinkEB(value, attempts) {
  if (typeof value !== "number") return value
  // Example linear shrink toward mean=0 with small weight
  const weight = Math.min(1, Math.max(0, attempts / 50))
  const leagueMean = 0
  return leagueMean * (1 - weight) + value * weight
}

export function getPercentileChip(p) {
  if (typeof p !== "number") return ""
  const pct = Math.round(p * 100)
  return `p${pct}`
}

/**
 * CSV export utility
 */
export function exportRowsToCsv(rows, columns, filename = "export.csv") {
  // columns: [{key, label}]
  const headers = columns.map((c) => escapeCsv(c.label)).join(",")
  const lines = rows.map((r) => {
    // if this is venues row, cells are metric objects
    if (r.metrics) {
      const cells = columns.map((c) => {
        const m = r.metrics?.[c.key]
        const val = m && typeof m.value !== "undefined" ? m.value : ""
        return escapeCsv(val)
      })
      return cells.join(",")
    }
    // generic row (panel export)
    const cells = columns.map((c) => escapeCsv(r[c.key] ?? ""))
    return cells.join(",")
  })
  const csv = [headers, ...lines].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeCsv(val) {
  const s = String(val ?? "")
  if (s.includes(",") || s.includes("\n") || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}
