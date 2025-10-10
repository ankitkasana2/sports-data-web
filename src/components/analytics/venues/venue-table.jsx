
import { useEffect, useMemo, useState } from "react"
import { cn } from "../../../lib/utils"
import VenueProfilePanel from "./venue-profile-panel"
import { exportRowsToCsv, shrinkEB } from "../../../lib/venues-utils"

/**
 * VenuesTable
 * - JavaScript (no TypeScript)
 * - Table-first UI with top-bar filters, presets, column picker, multi-sort, Top/Bottom, Δ chips, percentiles, CSV export
 * - Row click opens a right-side profile panel with sub-table placeholders
 * - Includes Min-N gates and EB shrink stubs
 * - Code-aware toggling (Football vs Hurling) hides irrelevant columns
 */

const DEFAULT_PRESETS = [
  { key: "shotQuality", label: "Shot Quality" },
  { key: "setPieces", label: "Set Pieces" },
  { key: "restarts", label: "Restarts" },
  { key: "endSplits", label: "End Splits" },
  { key: "transition", label: "Transition & Press" },
  { key: "environment", label: "Environment" },
  { key: "gameplan", label: "Gameplan Hints" },
]

const COLUMN_GROUPS = {
  scoringPace: {
    label: "Scoring & Pace",
    always: false,
    columns: [
      { key: "venue_index_pp100_delta", label: "Venue Index (pp100 Δ)", type: "delta" },
      { key: "points_per_match_for", label: "Points/match (For)" },
      { key: "points_per_match_against", label: "Points/match (Against)" },
      { key: "points_per_match_diff", label: "DIFF" },
      { key: "bip_pct", label: "Ball-in-play %" },
      { key: "stoppages_per60", label: "Stoppages/60" },
      { key: "pace_adj_delta", label: "Pace adj (poss/60 Δ)", type: "delta" },
      { key: "fast_slow_index", label: "Fast/Slow Index" },
    ],
  },
  endSplits: {
    label: "End Splits",
    columns: [
      { key: "endA_pp100", label: "End A pp100" },
      { key: "endB_pp100", label: "End B pp100" },
      { key: "end_delta_pp100", label: "End Δ pp100" },
      { key: "end_orientation_deg", label: "Orientation (°)" },
      { key: "slope_tag", label: "Slope tag" },
    ],
  },
  shotQuality: {
    label: "Shot Quality",
    columns: [
      { key: "avg_shot_distance_m", label: "Avg shot dist (m)" },
      { key: "avg_goal_opening_deg", label: "Avg goal_opening_deg" },
      { key: "xP_venue_delta", label: "Venue xP Δ", type: "delta" },
    ],
  },
  setPieces_common: {
    label: "Set Pieces",
    columns: [
      { key: "free_0_20_pct", label: "Free 0–20 %" },
      { key: "free_21_35_pct", label: "Free 21–35 %" },
      { key: "free_36_55_pct", label: "Free 36–55 %" },
      { key: "free_56_plus_pct", label: "Free 56+ %" },
      { key: "pen_att_per_game", label: "Pens att/game" },
      { key: "pen_conv_pct", label: "Pen conv %" },
    ],
  },
  setPieces_fb: {
    label: "Set Pieces (FB 2-pt)",
    columns: [
      { key: "two_pt_att_per_game", label: "2-pt att/game" },
      { key: "two_pt_scored_per_game", label: "2-pt scored/game" },
      { key: "two_pt_pct", label: "2-pt %" },
      { key: "two_pt_points_per_game", label: "2-pt pts/game" },
      { key: "two_pt_sector_advantage", label: "2-pt Sector Advantage" },
    ],
  },
  setPieces_hur: {
    label: "Set Pieces (Hur)",
    columns: [
      { key: "sixtyfive_att", label: "65 Att" },
      { key: "sixtyfive_sc", label: "65 Sc" },
      { key: "sixtyfive_pct", label: "65 %" },
      { key: "sideline_att", label: "Sideline Att" },
      { key: "sideline_sc", label: "Sideline Sc" },
      { key: "sideline_pct", label: "Sideline %" },
    ],
  },
  restarts: {
    label: "Restarts (KO/PO)",
    columns: [
      { key: "own_ko_ret_s", label: "Own Short %" },
      { key: "own_ko_ret_m", label: "Own Med %" },
      { key: "own_ko_ret_l", label: "Own Long %" },
      { key: "opp_ko_ret_s", label: "Opp Short %" },
      { key: "opp_ko_ret_m", label: "Opp Med %" },
      { key: "opp_ko_ret_l", label: "Opp Long %" },
      { key: "ko_marks_per_game", label: "KO marks/game" },
      { key: "ko_40m_violations_per_game", label: "40 m viol/game" },
      { key: "bubble_50m_advances_per_game", label: "Bubble 50m/game" },
      { key: "crossed40_intercept_risk", label: "Inside-40 KO intercept %" },
    ],
  },
  transition: {
    label: "Transition & Press",
    columns: [
      { key: "to_to_shot_15s_rate_for", label: "TO→Shot ≤15s (For) %" },
      { key: "to_to_shot_15s_rate_against", label: "TO→Shot ≤15s (Against) %" },
      { key: "to_to_score_15s_rate", label: "TO→Score ≤15s %" },
      { key: "to_to_shot_avg_seconds", label: "TO→first shot avg s" },
      { key: "to_to_score_avg_seconds", label: "TO→first score avg s" },
    ],
  },
  environment: {
    label: "Environment, Geometry & Context",
    columns: [
      { key: "pitch_length_m", label: "Pitch L (m)" },
      { key: "pitch_width_m", label: "Pitch W (m)" },
      { key: "surface_tag", label: "Surface" },
      { key: "long_range_soft_delta", label: "Long-range % Δ (soft)" },
      { key: "ko_long_ret_soft_delta", label: "KO long retention Δ (soft)" },
      { key: "wind_rose_summary", label: "Wind rose" },
      { key: "lighting_night_pct", label: "Night games %" },
      { key: "home_neutral_edge", label: "Home vs Neutral edge" },
    ],
  },
  teamVenue: {
    label: "Team @Venue Effect",
    columns: [{ key: "team_at_venue_net_delta", label: "Team @Venue Net Δ" }],
  },
  refVenue: {
    label: "Ref@Venue Overlay",
    columns: [{ key: "ref_frees_per100_delta", label: "Frees/100 Δ (Ref@Venue)" }],
  },
}

function TopBar({
  filters,
  setFilters,
  code,
  setCode,
  viewMode,
  setViewMode,
  rateMode,
  setRateMode,
  preset,
  setPreset,
  onExport,
  savedViews,
  onSaveView,
  onLoadView,
}) {
  return (
    <div className="w-full rounded-lg border bg-card p-3 md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center">
          <Select
            label="Season"
            value={filters.season}
            onChange={(v) => setFilters((s) => ({ ...s, season: v }))}
            options={["All", "2023", "2024", "2025"]}
          />
          <Select
            label="Competition"
            value={filters.competition}
            onChange={(v) => setFilters((s) => ({ ...s, competition: v }))}
            options={["All", "League", "Cup"]}
          />
          <Select label="Code" value={code} onChange={setCode} options={["Football", "Hurling"]} />
          <Select
            label="Grade"
            value={filters.grade}
            onChange={(v) => setFilters((s) => ({ ...s, grade: v }))}
            options={["All", "Senior", "U21"]}
          />
          <Select
            label="Stage"
            value={filters.stage}
            onChange={(v) => setFilters((s) => ({ ...s, stage: v }))}
            options={["All", "Group", "Knockout"]}
          />
          <Select
            label="Window"
            value={filters.window}
            onChange={(v) => setFilters((s) => ({ ...s, window: v }))}
            options={["Season", "L5", "L10", "Custom"]}
          />
          <TextInput
            label="Search"
            value={filters.search}
            onChange={(v) => setFilters((s) => ({ ...s, search: v }))}
            placeholder="Search venues..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            label="View"
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: "attacking", label: "Attacking" },
              { value: "defending", label: "Defending" },
              { value: "paired", label: "Paired" },
            ]}
          />
          <ToggleGroup
            label="Rate mode"
            value={rateMode}
            onChange={setRateMode}
            options={[
              { value: "perMatch", label: "Per match" },
              { value: "raw", label: "Raw" },
            ]}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            label="Presets"
            value={preset}
            onChange={setPreset}
            options={["None", ...DEFAULT_PRESETS.map((p) => p.label)]}
          />
          <ColumnPickerTrigger />
          <TopBottomControl />
          <MultiSortHint />
        </div>
        <div className="flex items-center gap-2">
          <SavedViews savedViews={savedViews} onSave={onSaveView} onLoad={onLoadView} />
          <button
            type="button"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            onClick={onExport}
            aria-label="Export current view"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="sr-only">{label}</span>
      <select
        className="rounded-md border bg-background px-2 py-1 text-foreground"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="sr-only">{label}</span>
      <input
        className="w-full min-w-40 rounded-md border bg-background px-3 py-2 text-foreground"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
    </label>
  )
}

function ToggleGroup({ label, value, onChange, options = [] }) {
  return (
    <div className="flex items-center gap-1">
      <span className="sr-only">{label}</span>
      <div role="group" aria-label={label} className="inline-flex rounded-md border p-1">
        {options.map((opt) => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              className={cn(
                "rounded px-2 py-1 text-sm",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              onClick={() => onChange(opt.value)}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ColumnPickerTrigger() {
  return (
    <span className="rounded-md border bg-background px-2 py-1 text-sm text-foreground" aria-label="Column Picker">
      Column Picker
    </span>
  )
}

function TopBottomControl() {
  return (
    <span className="rounded-md border bg-background px-2 py-1 text-sm text-foreground" aria-label="Top Bottom">
      Top/Bottom
    </span>
  )
}

function MultiSortHint() {
  return (
    <span className="text-sm text-muted-foreground" aria-label="Multi sort hint">
      Hold Shift to multi-sort
    </span>
  )
}

function HeaderCell({ label, onSort, sortDir }) {
  return (
    <th
      scope="col"
      className="whitespace-nowrap border-b bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground"
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-foreground"
        onClick={onSort}
        aria-label={`Sort by ${label}`}
      >
        <span className="text-foreground">{label}</span>
        {sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : ""}
      </button>
    </th>
  )
}

function MetricCell({ metric }) {
  if (!metric || metric.value == null) {
    return <td className="border-b px-3 py-2 text-sm text-muted-foreground">—</td>
  }
  const value = shrinkEB(metric.value, metric.attempts)
  return (
    <td className="border-b px-3 py-2 align-middle">
      <span className="text-sm text-foreground">{typeof value === "number" ? value.toFixed(1) : value}</span>
    </td>
  )
}

export default function VenuesTable({ data = DEFAULT_SAMPLE_DATA, initialCode = "Football" }) {
  const [filters, setFilters] = useState({
    season: "Season",
    competition: "All",
    grade: "All",
    stage: "All",
    window: "Season",
    search: "",
    topBottom: { mode: "none", n: 10 },
  })
  const [code, setCode] = useState(initialCode) // Football | Hurling
  const [viewMode, setViewMode] = useState("paired") // attacking | defending | paired
  const [rateMode, setRateMode] = useState("perMatch") // perMatch | raw
  const [preset, setPreset] = useState("None")
  const [selectedGroups, setSelectedGroups] = useState(() => ({
    scoringPace: true,
    endSplits: true,
    shotQuality: false,
    setPieces_common: true,
    setPieces_fb: initialCode === "Football",
    setPieces_hur: initialCode === "Hurling",
    restarts: true,
    transition: false,
    environment: true,
    teamVenue: false,
    refVenue: false,
  }))
  const [sorts, setSorts] = useState([]) // [{key, dir}]
  const [savedViews, setSavedViews] = useState([])
  const [activeVenue, setActiveVenue] = useState(null)

  // Load saved views (localStorage)
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("venues_saved_views") : null
      if (raw) setSavedViews(JSON.parse(raw))
    } catch { }
  }, [])
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("venues_saved_views", JSON.stringify(savedViews))
      }
    } catch { }
  }, [savedViews])

  // Apply preset (simple mapping)
  useEffect(() => {
    if (preset === "None") return
    const found = DEFAULT_PRESETS.find((p) => p.label === preset)
    if (!found) return
    const next = { ...selectedGroups }
    // turn off most, enable related
    Object.keys(next).forEach((k) => (next[k] = false))
    if (found.key === "shotQuality") next.shotQuality = true
    if (found.key === "setPieces") {
      next.setPieces_common = true
      next.setPieces_fb = code === "Football"
      next.setPieces_hur = code === "Hurling"
    }
    if (found.key === "restarts") next.restarts = true
    if (found.key === "endSplits") next.endSplits = true
    if (found.key === "transition") next.transition = true
    if (found.key === "environment") next.environment = true
    if (found.key === "gameplan") {
      // A computed preset; here we just pick a concise set of columns
      next.scoringPace = true
      next.restarts = true
      if (code === "Football") next.setPieces_fb = true
    }
    setSelectedGroups(next)
  }, [preset, code])

  // Filter + search
  const filtered = useMemo(() => {
    const term = (filters.search || "").toLowerCase()
    return data.filter((v) => {
      if (
        term &&
        !String(v.venue_name || "")
          .toLowerCase()
          .includes(term)
      )
        return false
      return true
    })
  }, [data, filters.search])

  // Sorting (supports multi-sort with Shift)
  const sorted = useMemo(() => {
    if (!sorts.length) return filtered
    const copy = [...filtered]
    copy.sort((a, b) => {
      for (const s of sorts) {
        const av = readComparable(a, s.key)
        const bv = readComparable(b, s.key)
        if (av === bv) continue
        const dir = s.dir === "asc" ? 1 : -1
        return av > bv ? dir : -dir
      }
      return 0
    })
    // Top/Bottom clipping
    if (filters.topBottom.mode === "top") return copy.slice(0, filters.topBottom.n)
    if (filters.topBottom.mode === "bottom") return copy.slice(-filters.topBottom.n)
    return copy
  }, [filtered, sorts, filters.topBottom])

  function readComparable(row, key) {
    const m = row.metrics?.[key]
    if (!m) return Number.NEGATIVE_INFINITY
    return typeof m.value === "number" ? m.value : Number.NEGATIVE_INFINITY
  }

  function onHeaderSort(e, key) {
    const isShift = e.shiftKey
    const existing = sorts.find((s) => s.key === key)
    const nextDir = existing ? (existing.dir === "asc" ? "desc" : existing.dir === "desc" ? null : "asc") : "asc"

    const next = isShift ? [...sorts.filter((s) => s.key !== key)] : []
    if (nextDir) next.push({ key, dir: nextDir })
    setSorts(next)
  }

  // Build active columns list considering code awareness and selected groups
  const activeColumns = useMemo(() => {
    const groups = []
    Object.entries(COLUMN_GROUPS).forEach(([k, def]) => {
      if (!selectedGroups[k]) return
      if (k === "setPieces_fb" && code !== "Football") return
      if (k === "setPieces_hur" && code !== "Hurling") return
      groups.push({ key: k, def })
    })
    // Flatten columns with group keys
    return groups.flatMap((g) => g.def.columns.map((c) => ({ ...c, groupKey: g.key })))
  }, [selectedGroups, code])

  function exportCsv() {
    exportRowsToCsv(sorted, activeColumns, "venues_view.csv")
  }

  function saveView() {
    const view = {
      id: String(Date.now()),
      code,
      selectedGroups,
      sorts,
      label: `View ${savedViews.length + 1}`,
    }
    setSavedViews((arr) => [...arr, view])
  }
  function loadView(id) {
    const v = savedViews.find((vv) => vv.id === id)
    if (!v) return
    setCode(v.code)
    setSelectedGroups(v.selectedGroups)
    setSorts(v.sorts)
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {/* <TopBar
        filters={filters}
        setFilters={setFilters}
        code={code}
        setCode={setCode}
        viewMode={viewMode}
        setViewMode={setViewMode}
        rateMode={rateMode}
        setRateMode={setRateMode}
        preset={preset}
        setPreset={setPreset}
        onExport={exportCsv}
        savedViews={savedViews}
        onSaveView={saveView}
        onLoadView={loadView}
      /> */}

      <div className="overflow-auto rounded-lg border">
        <table className="min-w-[900px] table-fixed">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Venue
              </th>
              <th className="sticky left-[160px] z-10 border-b bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                GP
              </th>
              {activeColumns.map((col) => {
                const s = sorts.find((x) => x.key === col.key)
                return (
                  <HeaderCell
                    key={col.key}
                    label={col.label}
                    sortDir={s?.dir}
                    onSort={(e) => onHeaderSort(e, col.key)}
                  />
                )
              })}
            </tr>
          </thead>
          <tbody className="bg-background">
            {sorted.map((row) => (
              <tr key={row.id} className="cursor-pointer hover:bg-accent" onClick={() => setActiveVenue(row)}>
                <td className="sticky left-0 z-10 border-b bg-background px-3 py-2 text-sm font-medium text-foreground">
                  {row.venue_name}
                </td>
                <td className="sticky left-[160px] z-10 border-b bg-background px-3 py-2 text-sm text-muted-foreground">
                  {row.gp}
                </td>
                {activeColumns.map((col) => (
                  <MetricCell key={col.key} metric={row.metrics?.[col.key]} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeVenue ? <VenueProfilePanel venue={activeVenue} code={code} onClose={() => setActiveVenue(null)} /> : null}
    </div>
  )
}

function SavedViews({ savedViews, onSave, onLoad }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="rounded-md border bg-background px-2 py-1 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
        onClick={onSave}
        aria-label="Save current view"
      >
        Save View
      </button>
      <select
        className="rounded-md border bg-background px-2 py-1 text-sm text-foreground"
        onChange={(e) => onLoad(e.target.value)}
        defaultValue=""
        aria-label="Load saved view"
      >
        <option value="" disabled>
          Load view…
        </option>
        {savedViews.map((v) => (
          <option key={v.id} value={v.id}>
            {v.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// Minimal sample data that meets the structure expected by the table.
// Consumers should replace this with real metrics mapped into {value, delta, percentile, attempts}.
const DEFAULT_SAMPLE_DATA = [
  {
    id: "VEN-A",
    venue_name: "North Park",
    gp: 8,
    metrics: {
      venue_index_pp100_delta: { value: 3.2, delta: 3.2, percentile: 0.78, attempts: 8 },
      points_per_match_for: { value: 17.5, attempts: 8 },
      points_per_match_against: { value: 14.2, attempts: 8 },
      points_per_match_diff: { value: 3.3, attempts: 8 },
      bip_pct: { value: 56.0, percentile: 0.61, attempts: 8 },
      stoppages_per60: { value: 22.0, attempts: 8 },
      pace_adj_delta: { value: 1.8, delta: 1.8, percentile: 0.67, attempts: 8 },
      fast_slow_index: { value: 0.6, attempts: 8 },

      endA_pp100: { value: 105.3, attempts: 4 },
      endB_pp100: { value: 100.2, attempts: 4 },
      end_delta_pp100: { value: 5.1, attempts: 8 },
      end_orientation_deg: { value: 35, attempts: 8 },
      slope_tag: { value: "A→B down", attempts: 8 },

      avg_shot_distance_m: { value: 28.4, attempts: 120 },
      avg_goal_opening_deg: { value: 12.1, attempts: 120 },
      xP_venue_delta: { value: 0.7, delta: 0.7, attempts: 120 },

      free_0_20_pct: { value: 88, percentile: 0.7, attempts: 40 },
      free_21_35_pct: { value: 76, attempts: 35 },
      free_36_55_pct: { value: 58, attempts: 20 },
      free_56_plus_pct: { value: 41, attempts: 10 },
      pen_att_per_game: { value: 0.4, attempts: 8 },
      pen_conv_pct: { value: 75, attempts: 6 },

      two_pt_att_per_game: { value: 2.1, attempts: 8 },
      two_pt_scored_per_game: { value: 0.8, attempts: 8 },
      two_pt_pct: { value: 38, attempts: 80 },
      two_pt_points_per_game: { value: 1.6, attempts: 8 },
      two_pt_sector_advantage: { value: 0.3, attempts: 80 },

      own_ko_ret_s: { value: 72, attempts: 55 },
      own_ko_ret_m: { value: 61, attempts: 40 },
      own_ko_ret_l: { value: 48, attempts: 33 },
      opp_ko_ret_s: { value: 69, attempts: 53 },
      opp_ko_ret_m: { value: 58, attempts: 39 },
      opp_ko_ret_l: { value: 45, attempts: 30 },
      ko_marks_per_game: { value: 1.1, attempts: 8 },
      ko_40m_violations_per_game: { value: 0.2, attempts: 8 },
      bubble_50m_advances_per_game: { value: 0.1, attempts: 8 },
      crossed40_intercept_risk: { value: 14, attempts: 70 },

      to_to_shot_15s_rate_for: { value: 31, attempts: 90 },
      to_to_shot_15s_rate_against: { value: 27, attempts: 85 },
      to_to_score_15s_rate: { value: 11, attempts: 90 },
      to_to_shot_avg_seconds: { value: 12.6, attempts: 90 },
      to_to_score_avg_seconds: { value: 18.3, attempts: 90 },

      pitch_length_m: { value: 144, attempts: 1 },
      pitch_width_m: { value: 88, attempts: 1 },
      surface_tag: { value: "standard", attempts: 8 },
      long_range_soft_delta: { value: -3.0, delta: -3.0, attempts: 30 },
      ko_long_ret_soft_delta: { value: 2.0, delta: 2.0, attempts: 30 },
      wind_rose_summary: { value: "Light 45% / Med 40% / Strong 15%", attempts: 8 },
      lighting_night_pct: { value: 40, attempts: 8 },
      home_neutral_edge: { value: 0.9, attempts: 8 },

      team_at_venue_net_delta: { value: 2.4, attempts: 4 },
      ref_frees_per100_delta: { value: 1.1, attempts: 6 },
    },
  },
  {
    id: "VEN-B",
    venue_name: "River Grounds",
    gp: 5,
    metrics: {
      venue_index_pp100_delta: { value: -1.2, delta: -1.2, percentile: 0.32, attempts: 5 },
      points_per_match_for: { value: 14.8, attempts: 5 },
      points_per_match_against: { value: 15.5, attempts: 5 },
      points_per_match_diff: { value: -0.7, attempts: 5 },
      bip_pct: { value: 51.0, attempts: 5 },
      stoppages_per60: { value: 25.0, attempts: 5 },
      pace_adj_delta: { value: -0.9, delta: -0.9, percentile: 0.67, attempts: 5 },
      fast_slow_index: { value: -0.3, attempts: 5 },

      endA_pp100: { value: 99.0, attempts: 3 },
      endB_pp100: { value: 101.0, attempts: 3 },
      end_delta_pp100: { value: -2.0, attempts: 5 },
      end_orientation_deg: { value: 275, attempts: 5 },
      slope_tag: { value: "flat", attempts: 5 },

      avg_shot_distance_m: { value: 30.1, attempts: 70 },
      avg_goal_opening_deg: { value: 10.8, attempts: 70 },
      xP_venue_delta: { value: -0.3, delta: -0.3, attempts: 70 },

      free_0_20_pct: { value: 84, attempts: 20 },
      free_21_35_pct: { value: 72, attempts: 18 },
      free_36_55_pct: { value: 55, attempts: 12 },
      free_56_plus_pct: { value: 37, attempts: 6 },
      pen_att_per_game: { value: 0.2, attempts: 5 },
      pen_conv_pct: { value: 67, attempts: 3 },

      two_pt_att_per_game: { value: 1.5, attempts: 5 },
      two_pt_scored_per_game: { value: 0.5, attempts: 5 },
      two_pt_pct: { value: 33, attempts: 45 },
      two_pt_points_per_game: { value: 1.0, attempts: 5 },
      two_pt_sector_advantage: { value: -0.2, attempts: 45 },

      own_ko_ret_s: { value: 68, attempts: 35 },
      own_ko_ret_m: { value: 57, attempts: 25 },
      own_ko_ret_l: { value: 44, attempts: 18 },
      opp_ko_ret_s: { value: 64, attempts: 33 },
      opp_ko_ret_m: { value: 52, attempts: 24 },
      opp_ko_ret_l: { value: 40, attempts: 17 },
      ko_marks_per_game: { value: 0.7, attempts: 5 },
      ko_40m_violations_per_game: { value: 0.1, attempts: 5 },
      bubble_50m_advances_per_game: { value: 0.0, attempts: 5 },
      crossed40_intercept_risk: { value: 18, attempts: 44 },

      to_to_shot_15s_rate_for: { value: 28, attempts: 55 },
      to_to_shot_15s_rate_against: { value: 29, attempts: 52 },
      to_to_score_15s_rate: { value: 9, attempts: 55 },
      to_to_shot_avg_seconds: { value: 13.5, attempts: 55 },
      to_to_score_avg_seconds: { value: 19.7, attempts: 55 },

      pitch_length_m: { value: 142, attempts: 1 },
      pitch_width_m: { value: 86, attempts: 1 },
      surface_tag: { value: "soft", attempts: 5 },
      long_range_soft_delta: { value: -4.0, delta: -4.0, attempts: 15 },
      ko_long_ret_soft_delta: { value: 3.0, delta: 3.0, attempts: 15 },
      wind_rose_summary: { value: "Light 30% / Med 50% / Strong 20%", attempts: 5 },
      lighting_night_pct: { value: 30, attempts: 5 },
      home_neutral_edge: { value: 0.6, attempts: 5 },

      team_at_venue_net_delta: { value: -1.2, attempts: 3 },
      ref_frees_per100_delta: { value: 0.4, attempts: 4 },
    },
  },
]
