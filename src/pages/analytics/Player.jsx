import { useMemo, useState } from "react"
import TopBar from "@/components/analytics/top-bar"
import Controls from "@/components/analytics/controls"
import ColumnGroups from "@/components/analytics/column-groups"
import PlayerAnalyticsTable from "../../components/analytics/players/player-table"
import ProfilePanel from "@/components/analytics/profile-panel"
import { TEAMS, computeDerived, DEFAULT_VISIBLE_COLUMNS } from "@/components/analytics/data/mock"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const sampleData = [
  {
    player: "John Doe",
    team: "Team A",
    matches: 5,
    scoring: { goals: 3, onePt: 5, twoPt: 2, totalPoints: 10 },
    shooting: { attempts: 12, scores: 10, accuracy: 83 },
    creation: { assists: 4, secondaryAssists: 2 },
    possession: { turnoversWon: 3, turnoversConceded: 1, foulsWon: 2, foulsCommitted: 0 },
    restarts: { targeted: 5, marksWon: 2, involvementInScores: 3 },
    soloGo: { attempts: 4, turnovers: 1, scoresInChain: 2 },
    keeperStats: { kickOutsTaken: 20, crossed40Pct: 60, retentionPct: 75, marksConceded: 2, violations: 0 },
    minutesPlayed: { total: 300, avgPerMatch: 60 },
  },
  {
    player: "Jane Smith",
    team: "Team B",
    matches: 6,
    scoring: { goals: 5, onePt: 7, twoPt: 1, totalPoints: 13 },
    shooting: { attempts: 15, scores: 13, accuracy: 87 },
    creation: { assists: 6, secondaryAssists: 3 },
    possession: { turnoversWon: 4, turnoversConceded: 2, foulsWon: 3, foulsCommitted: 1 },
    restarts: { targeted: 6, marksWon: 3, involvementInScores: 4 },
    soloGo: { attempts: 5, turnovers: 2, scoresInChain: 3 },
    keeperStats: { kickOutsTaken: 18, crossed40Pct: 65, retentionPct: 70, marksConceded: 1, violations: 0 },
    minutesPlayed: { total: 360, avgPerMatch: 60 },
  },
  {
    player: "Mark Johnson",
    team: "Team A",
    matches: 4,
    scoring: { goals: 2, onePt: 3, twoPt: 0, totalPoints: 5 },
    shooting: { attempts: 8, scores: 5, accuracy: 62 },
    creation: { assists: 2, secondaryAssists: 1 },
    possession: { turnoversWon: 2, turnoversConceded: 3, foulsWon: 1, foulsCommitted: 2 },
    restarts: { targeted: 3, marksWon: 1, involvementInScores: 1 },
    soloGo: { attempts: 3, turnovers: 1, scoresInChain: 1 },
    keeperStats: { kickOutsTaken: 10, crossed40Pct: 50, retentionPct: 60, marksConceded: 3, violations: 1 },
    minutesPlayed: { total: 240, avgPerMatch: 60 },
  },
  {
    player: "Emily Davis",
    team: "Team C",
    matches: 7,
    scoring: { goals: 4, onePt: 6, twoPt: 2, totalPoints: 12 },
    shooting: { attempts: 18, scores: 12, accuracy: 67 },
    creation: { assists: 5, secondaryAssists: 4 },
    possession: { turnoversWon: 5, turnoversConceded: 2, foulsWon: 4, foulsCommitted: 1 },
    restarts: { targeted: 7, marksWon: 4, involvementInScores: 5 },
    soloGo: { attempts: 6, turnovers: 1, scoresInChain: 3 },
    keeperStats: { kickOutsTaken: 25, crossed40Pct: 70, retentionPct: 80, marksConceded: 2, violations: 0 },
    minutesPlayed: { total: 420, avgPerMatch: 60 },
  },
  {
    player: "Luke Brown",
    team: "Team B",
    matches: 5,
    scoring: { goals: 1, onePt: 4, twoPt: 1, totalPoints: 6 },
    shooting: { attempts: 10, scores: 6, accuracy: 60 },
    creation: { assists: 3, secondaryAssists: 2 },
    possession: { turnoversWon: 3, turnoversConceded: 2, foulsWon: 2, foulsCommitted: 1 },
    restarts: { targeted: 5, marksWon: 2, involvementInScores: 2 },
    soloGo: { attempts: 2, turnovers: 1, scoresInChain: 1 },
    keeperStats: { kickOutsTaken: 15, crossed40Pct: 55, retentionPct: 65, marksConceded: 2, violations: 1 },
    minutesPlayed: { total: 300, avgPerMatch: 60 },
  },
];

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
        <PlayerAnalyticsTable data={sampleData} />
      </div>

      <ProfilePanel
        team={selectedTeam}
        open={!!selectedTeam}
        onOpenChange={(o) => {
          if (!o) setSelectedTeam(null)
        }}
      />
    </>
  )
}
