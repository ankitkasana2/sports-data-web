import { useMemo, useState } from "react"
import TopBar from "@/components/analytics/top-bar"
import Controls from "@/components/analytics/controls"
import ColumnGroups from "@/components/analytics/column-groups"
import PlayerAnalyticsTable from "../../components/analytics/players/player-table"
import ProfilePanel from "@/components/analytics/profile-panel"
import { TEAMS, computeDerived, DEFAULT_VISIBLE_COLUMNS } from "@/components/analytics/data/mock"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import PlayersTable from "../../components/analytics/players/player-table"

const samplePlayers = [
  {
    id: 1,
    name: "A. Murphy",
    team: "County A",
    position: "MF",
    gp: 10,
    min_total: 620,
    min_avg: 62.0,
    starts: 9,
    subs: 1,
    on_pitch_pct: 0.78,
    goals: 3,
    points: 24,
    share_scoring: 0.19,
    from_play: { att: 40, sc: 18, pct: 0.45 },
    frees: { att: 12, sc: 9, pct: 0.75 },
    f45: { att: 6, sc: 3, pct: 0.5 },
    pen: { att: 2, sc: 1, pct: 0.5 },
    two_pt: { att: 20, rate: 0.22, pct: 0.35, pts_game: 1.8 },
    h65: null,
    sideline: null,
    to_won: 22,
    to_conc: 17,
    to_to_shot_15: 0.31,
    receipts: 28,
    receipt_share: 0.14,
    receipts_to_shots_15: 0.6,
    is_gk: false,
    ortg_on: 98.4,
    drtg_on: 93.2,
    net_on: 5.2,
    pace_on: 46.1,
    plus_minus_per60: 1.3,
    fouls_won: 18,
    fouls_conc: 16,
    cards: 2,
    matchLog: [
      { date: "2025-05-01", minutes: 68, points: 5, shots: 6, frees: 2 },
      { date: "2025-04-24", minutes: 60, points: 4, shots: 5, frees: 1 },
    ],
    shotMatrix: [
      { type: "FP 0–20m", att: 10, sc: 6, pct: 0.6 },
      { type: "FP 21–35m", att: 14, sc: 6, pct: 0.43 },
    ],
    chemistry: [
      { name: "B. O’Connor", events: 12, share: 0.22 },
      { name: "C. Walsh", events: 9, share: 0.18 },
    ],
  },
  {
    id: 2,
    name: "D. Kelly",
    team: "County B",
    position: "GK",
    gp: 10,
    min_total: 640,
    min_avg: 64.0,
    starts: 10,
    subs: 0,
    on_pitch_pct: 0.92,
    goals: 0,
    points: 2,
    share_scoring: 0.03,
    from_play: { att: 5, sc: 2, pct: 0.4 },
    frees: { att: 3, sc: 2, pct: 0.67 },
    f45: { att: 2, sc: 1, pct: 0.5 },
    pen: { att: 0, sc: 0, pct: 0 },
    two_pt: { att: 0, rate: 0, pct: 0, pts_game: 0 },
    to_won: 4,
    to_conc: 8,
    to_to_shot_15: 0.1,
    receipts: 0,
    receipt_share: 0,
    receipts_to_shots_15: 0,
    is_gk: true,
    ko: {
      taken: 120,
      short_pct: 0.55,
      med_pct: 0.28,
      long_pct: 0.17,
      crossed_40_pct: 0.48,
      marks_conceded_per_game: 0.4,
    },
    ortg_on: 92.3,
    drtg_on: 91.1,
    net_on: 1.2,
    pace_on: 44.9,
    plus_minus_per60: 0.2,
    fouls_won: 1,
    fouls_conc: 3,
    cards: 0,
    matchLog: [
      { date: "2025-05-01", minutes: 70, points: 0, shots: 0, frees: 0 },
      { date: "2025-04-24", minutes: 64, points: 0, shots: 0, frees: 0 },
    ],
    shotMatrix: [],
    chemistry: [{ name: "E. Byrne", events: 18, share: 0.33 }],
  },
]

export default function PlayerAnalyticsPage() {
  const [view, setView] = useState("Attacking") // Attacking | Defending | Paired
  const [rateMode, setRateMode] = useState("perMatch") // perMatch | per100
  const [opponentAdjusted, setOpponentAdjusted] = useState(false)
  const [showDiff, setShowDiff] = useState(true)
  const [showDelta, setShowDelta] = useState(false)
  const [showPercentile, setShowPercentile] = useState(false)
  const [sampleWindow, setSampleWindow] = useState("Season")
  const [search, setSearch] = useState("")
  const [topBottom, setTopBottom] = useState("all") // all | top10 | bottom10
  const [activeGroups, setActiveGroups] = useState(["Scoring & Ratings", "Restarts", "Transition"])
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS)
  const [sort, setSort] = useState([{ id: "ortg_for", desc: true }])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [savedViews, setSavedViews] = useState(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem("analytics_saved_views")
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const rows = useMemo(() => {
    const derived = TEAMS.map((t) => computeDerived(t, { rateMode }))
    let filtered = derived

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter((r) => r.team.toLowerCase().includes(q))
    }

    if (topBottom === "top10") {
      filtered = [...filtered].sort((a, b) => b.ortg_for - a.ortg_for).slice(0, 10)
    } else if (topBottom === "bottom10") {
      filtered = [...filtered].sort((a, b) => a.ortg_for - b.ortg_for).slice(0, 10)
    }

    // basic multi-sort support
    const multi = [...filtered]
    for (let i = sort.length - 1; i >= 0; i--) {
      const { id, desc } = sort[i]
      multi.sort((a, b) => {
        const av = a[id] ?? 0
        const bv = b[id] ?? 0
        if (av === bv) return 0
        return desc ? bv - av : av - bv
      })
    }
    return multi
  }, [search, topBottom, sort, rateMode])

  function handleSaveView(name) {
    const viewObj = {
      name,
      view,
      rateMode,
      opponentAdjusted,
      showDiff,
      showDelta,
      showPercentile,
      sampleWindow,
      activeGroups,
      visibleColumns,
      sort,
      topBottom,
      search,
      timestamp: Date.now(),
    }
    const next = [...savedViews.filter((v) => v.name !== name), viewObj]
    setSavedViews(next)
    try {
      localStorage.setItem("analytics_saved_views", JSON.stringify(next))
    } catch { }
  }

  function applySavedView(v) {
    setView(v.view)
    setRateMode(v.rateMode)
    setOpponentAdjusted(v.opponentAdjusted)
    setShowDiff(v.showDiff)
    setShowDelta(v.showDelta)
    setShowPercentile(v.showPercentile)
    setSampleWindow(v.sampleWindow)
    setActiveGroups(v.activeGroups)
    setVisibleColumns(v.visibleColumns)
    setSort(v.sort)
    setTopBottom(v.topBottom)
    setSearch(v.search)
  }

  return (
    <>
      <Card className="border-0 rounded-none">
        <div className="p-3 md:p-4">
          <Controls
            search={search}
            onSearchChange={setSearch}
            topBottom={topBottom}
            onTopBottomChange={setTopBottom}
            sort={sort}
            onSortChange={setSort}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
            rows={rows}
            onSaveView={handleSaveView}
            savedViews={savedViews}
            onApplySavedView={applySavedView}
          />

          <Separator className="my-3" />

          <ColumnGroups
            activeGroups={activeGroups}
            onToggleGroup={(g) =>
              setActiveGroups((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
            }
          />
        </div>
      </Card>

      <div className="p-3 md:p-4"> 
        <PlayersTable data={samplePlayers} />
      </div>
    </>
  )
}
