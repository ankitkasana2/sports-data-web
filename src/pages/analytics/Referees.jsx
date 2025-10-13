import { useMemo, useState } from "react"
import TopBar from "@/components/analytics/top-bar"
import Controls from "@/components/analytics/controls"
import ColumnGroups from "@/components/analytics/column-groups"
import TeamsTable from "@/components/analytics/teams-table"
import ProfilePanel from "@/components/analytics/profile-panel"
import { TEAMS, computeDerived, DEFAULT_VISIBLE_COLUMNS } from "@/components/analytics/data/mock"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import RefereeAnalyticsTable from "../../components/analytics/referees/referee-table"

const refereeData = [
  {
    name: "Ref A",
    matches: 6,
    freesPer100: 11,
    cardsPer100: 1.5,
    pointsFromFreesPer100: 8,
    advances50mPer10OppKickouts: 3,
    kickoutNonCrossing40mPct: 60,
    pace: 35,
    addedTimePerHalf: 90,
    closeGamePct: 40,
    overUnderTendency: "Over",
  },
  {
    name: "Ref B",
    matches: 2, // small sample
    freesPer100: 10,
    cardsPer100: 1.1,
    pointsFromFreesPer100: 8,
    advances50mPer10OppKickouts: 2,
    kickoutNonCrossing40mPct: 55,
    pace: 32,
    addedTimePerHalf: 85,
    closeGamePct: 35,
    overUnderTendency: "Under",
  },
  {
    name: "Ref C",
    matches: 5,
    freesPer100: 14,
    cardsPer100: 2.0,
    pointsFromFreesPer100: 9,
    advances50mPer10OppKickouts: 4,
    kickoutNonCrossing40mPct: 65,
    pace: 38,
    addedTimePerHalf: 95,
    closeGamePct: 45,
    overUnderTendency: "Over",
  },
];


export default function RefereeAnalyticsPage() {
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
    } catch {}
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
        <RefereeAnalyticsTable data={refereeData}/>
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
