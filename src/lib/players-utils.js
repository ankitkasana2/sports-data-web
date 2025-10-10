export function ratePer(value, minutes, rateMode) {
  // rateMode: 'per60' or 'perMatch'; assume minutes is on-pitch minutes, GP for perMatch handled upstream
  if (value == null) return null
  if (!minutes || minutes <= 0) return 0
  return rateMode === "per60" ? (value / minutes) * 60 : value
}

export function fmtNumber(value, decimals = 1) {
  if (value == null || Number.isNaN(value)) return "—"
  return Number(value).toFixed(decimals)
}

export function fmtPercent(value, decimals = 1) {
  if (value == null || Number.isNaN(value)) return "—"
  return `${(Number(value) * 100).toFixed(decimals)}%`
}

export function gateMinN({ attempts, minN, value }) {
  if (attempts == null || minN == null) return value
  if (attempts < minN) return null
  return value
}

export function exportToCSV({ rows, columns, filename = "players.csv" }) {
  const headers = columns.map((c) => c.header)
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      columns
        .map((c) => {
          const v = typeof c.accessor === "function" ? c.accessor(r) : r[c.accessor]
          // strip commas/newlines; numbers only or plain text
          if (v == null) return ""
          return String(v)
            .replace(/[\n\r,]+/g, " ")
            .trim()
        })
        .join(","),
    ),
  ]
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.setAttribute("href", url)
  a.setAttribute("download", filename)
  a.click()
  URL.revokeObjectURL(url)
}

export function textIncludes(haystack, needle) {
  if (!needle) return true
  if (!haystack) return false
  return haystack.toLowerCase().includes(needle.toLowerCase())
}
