
import { useState } from "react"
import { cn } from "../../../lib/utils"
import { exportRowsToCsv } from "../../../lib/venues-utils"

export default function VenueProfilePanel({ venue, code = "Football", onClose }) {
  const [tab, setTab] = useState("games")

  const tabs = [
    { key: "games", label: "Games list" },
    { key: "end", label: "End splits" },
    { key: "free", label: "Free curves" },
    ...(code === "Football" ? [{ key: "2pt", label: "2-pt sectors" }] : []),
    { key: "restarts", label: "Restarts detail" },
    { key: "transition", label: "Transition" },
    { key: "environment", label: "Environment" },
    { key: "team", label: "Team @Venue" },
    { key: "ref", label: "Ref@Venue" },
    { key: "export", label: "Export" },
  ]

  function exportPanelCsv() {
    const rows = Object.entries(venue.metrics || {}).map(([k, v]) => ({
      metric: k,
      value: v?.value ?? "",
      delta: v?.delta ?? "",
      percentile: v?.percentile ?? "",
      attempts: v?.attempts ?? "",
    }))
    exportRowsToCsv(
      rows,
      [
        { key: "metric", label: "Metric" },
        { key: "value", label: "Value" },
        { key: "delta", label: "Δ" },
        { key: "percentile", label: "Percentile" },
        { key: "attempts", label: "Attempts" },
      ],
      `${venue.venue_name}_panel.csv`,
    )
  }

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full max-w-xl border-l bg-card shadow-xl"
      role="dialog"
      aria-label="Venue profile"
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-foreground">{venue.venue_name}</h2>
          <p className="text-xs text-muted-foreground">Games: {venue.gp}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close venue panel"
          className="rounded-md border px-2 py-1 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Close
        </button>
      </div>

      <nav className="flex flex-wrap gap-2 border-b px-3 py-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={cn(
              "rounded px-2 py-1 text-sm",
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="h-[calc(100vh-140px)] overflow-auto p-4">
        {tab === "games" && <PanelTable title="Games list" rows={mockRows("Game", 8)} />}
        {tab === "end" && <PanelTable title="End splits" rows={mockRows("End split metric", 6)} />}
        {tab === "free" && <PanelTable title="Free curves" rows={mockRows("Free band", 4)} />}
        {tab === "2pt" && code === "Football" && <PanelTable title="2-pt sectors" rows={mockRows("Sector L/C/R", 3)} />}
        {tab === "restarts" && <PanelTable title="Restarts detail" rows={mockRows("Restart band", 6)} />}
        {tab === "transition" && <PanelTable title="Transition" rows={mockRows("TO→metric", 5)} />}
        {tab === "environment" && <PanelTable title="Environment" rows={mockRows("Env metric", 8)} />}
        {tab === "team" && <PanelTable title="Team @Venue" rows={mockRows("Team slice", 3)} />}
        {tab === "ref" && <PanelTable title="Ref@Venue" rows={mockRows("Ref slice", 4)} />}
        {tab === "export" && (
          <div className="rounded-lg border bg-background p-4">
            <p className="mb-2 text-sm text-muted-foreground">Export the current panel view data.</p>
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              onClick={exportPanelCsv}
            >
              Export Panel CSV
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

function PanelTable({ title, rows }) {
  return (
    <div className="mb-4 rounded-lg border bg-background">
      <div className="border-b px-3 py-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full table-fixed">
          <thead>
            <tr>
              <th className="border-b bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground">Item</th>
              <th className="border-b bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground">Value</th>
              <th className="border-b bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground">Δ</th>
              <th className="border-b bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Attempts
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-accent">
                <td className="border-b px-3 py-2 text-sm text-foreground">{r.name}</td>
                <td className="border-b px-3 py-2 text-sm text-foreground">{r.value}</td>
                <td className="border-b px-3 py-2 text-sm text-foreground">{r.delta}</td>
                <td className="border-b px-3 py-2 text-sm text-foreground">{r.attempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function mockRows(prefix, n) {
  return Array.from({ length: n }).map((_, i) => ({
    name: `${prefix} ${i + 1}`,
    value: (Math.random() * 100).toFixed(1),
    delta: (Math.random() * 10 - 5).toFixed(1),
    attempts: Math.floor(Math.random() * 50 + 1),
  }))
}
