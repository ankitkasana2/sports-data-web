"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import RefereesTable from "../../components/analytics/referees/referees-table"
import ProfilePanel from "../../components/analytics/referees/profile-panel"

// Simple mock data generator to demonstrate layout, virtualization, and interactions.
// In production, replace with server data or SWR and wire up all acceptance metrics.
function randomBetween(min, max, digits = 2) {
  const v = Math.random() * (max - min) + min
  return Number(v.toFixed(digits))
}
function genRef(i) {
  const whistlesPer100 = randomBetween(20, 40)
  const freesPer100 = whistlesPer100 - randomBetween(2, 8)
  const cardsY = randomBetween(0.5, 3)
  const cardsR = randomBetween(0, 0.3, 2)
  const advantageAppliedPct = randomBetween(25, 65, 1)
  const advantageQualityDelta = randomBetween(-3, 3, 2) // pp100 Δ (placeholder)
  const possPer60 = randomBetween(52, 66, 1)
  const twoPtAttemptRate = randomBetween(0.05, 0.22, 3)
  const twoPtPct = randomBetween(25, 48, 1)
  const freeDistance = randomBetween(26, 41, 1)
  const penaltiesAtt = randomBetween(0.05, 0.25, 2)
  const penaltiesConvPct = randomBetween(60, 85, 1)
  const gp = Math.floor(randomBetween(3, 28, 0))

  return {
    id: `ref-${i}`,
    ref_name: `Referee ${i + 1}`,
    gp,
    whistlesPer100,
    freesPer100,
    cardsY,
    cardsR,
    advantageAppliedPct,
    advantageQualityDelta,
    possPer60,
    twoPtAttemptRate,
    twoPtPct,
    freeDistance,
    penaltiesAtt,
    penaltiesConvPct,
    homeEdgeIndex: randomBetween(-0.8, 0.8, 2),
    venueDriftAbs: randomBetween(0, 4.5, 2),
    yoyFreesStdev: randomBetween(0.5, 3.5, 2),
  }
}
function makeRefs(n = 500) {
  return Array.from({ length: n }, (_, i) => genRef(i))
}

// League baselines (placeholder). In production compute inside current filters/window.
const LEAGUE_BASELINE = {
  possPer60: 58,
  freesPer100: 28,
  freePointsPerFreeContext: 0.78, // used in Δ → pts example
  twoPtAttemptRate: 0.12,
  twoPtPct: 0.35,
  freeDistance: 33,
}

export default function RefereesDashboard() {
  const [data] = React.useState(() => makeRefs(650))
  const [search, setSearch] = React.useState("")
  const [season, setSeason] = React.useState("2025")
  const [competition, setCompetition] = React.useState("All")
  const [code, setCode] = React.useState("Football")
  const [grade, setGrade] = React.useState("Senior")
  const [stage, setStage] = React.useState("All")
  const [sampleWindow, setSampleWindow] = React.useState("Season") // Season/L5/L10/Custom
  const [view, setView] = React.useState("paired") // attacking | defending | paired
  const [rateMode, setRateMode] = React.useState("per100") // per100 | perMatch
  const [showDiff, setShowDiff] = React.useState(true)
  const [showDeltaLeague, setShowDeltaLeague] = React.useState(true)
  const [showPercentile, setShowPercentile] = React.useState(true)
  const [teamFilter, setTeamFilter] = React.useState("None")
  const [topBottom, setTopBottom] = React.useState("All") // All | Top 50 | Bottom 50
  const [preset, setPreset] = React.useState("Custom")
  const [savedViews, setSavedViews] = React.useState(() => {
    if (typeof window === "undefined") return []
    try {
      return JSON.parse(localStorage.getItem("ref_saved_views") || "[]")
    } catch {
      return []
    }
  })

  const [selectedRef, setSelectedRef] = React.useState(null)

  React.useEffect(() => {
    try {
      localStorage.setItem("ref_saved_views", JSON.stringify(savedViews))
    } catch {}
  }, [savedViews])

  function saveCurrentView(name) {
    const v = {
      name,
      state: {
        search,
        season,
        competition,
        code,
        grade,
        stage,
        sampleWindow,
        view,
        rateMode,
        showDiff,
        showDeltaLeague,
        showPercentile,
        teamFilter,
        topBottom,
        preset,
      },
    }
    setSavedViews((prev) => {
      const others = prev.filter((x) => x.name !== name)
      return [...others, v]
    })
  }

  function loadView(viewName) {
    const v = savedViews.find((x) => x.name === viewName)
    if (!v) return
    const s = v.state
    setSearch(s.search)
    setSeason(s.season)
    setCompetition(s.competition)
    setCode(s.code)
    setGrade(s.grade)
    setStage(s.stage)
    setSampleWindow(s.sampleWindow)
    setView(s.view)
    setRateMode(s.rateMode)
    setShowDiff(s.showDiff)
    setShowDeltaLeague(s.showDeltaLeague)
    setShowPercentile(s.showPercentile)
    setTeamFilter(s.teamFilter)
    setTopBottom(s.topBottom)
    setPreset(s.preset)
  }

  function applyPreset(p) {
    setPreset(p)
    // In production, toggle column visibility per preset here via a ref or store.
    // We just set the label; the table exposes a Column Picker to fine-tune.
  }

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    let out = data
    if (q) out = out.filter((r) => r.ref_name.toLowerCase().includes(q))
    // Example top/bottom cut on whistles per 100 for demonstration:
    if (topBottom === "Top 50") out = [...out].sort((a, b) => b.whistlesPer100 - a.whistlesPer100).slice(0, 50)
    if (topBottom === "Bottom 50") out = [...out].sort((a, b) => a.whistlesPer100 - b.whistlesPer100).slice(0, 50)
    return out
  }, [data, search, topBottom])

  return (
    <div className="space-y-4">
      {/* Top bar controls */}
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>

              <Select value={competition} onValueChange={setCompetition}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Competition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="League">League</SelectItem>
                  <SelectItem value="Championship">Championship</SelectItem>
                </SelectContent>
              </Select>

              <Select value={code} onValueChange={setCode}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Hurling">Hurling</SelectItem>
                </SelectContent>
              </Select>

              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="U21">U21</SelectItem>
                  <SelectItem value="Minor">Minor</SelectItem>
                </SelectContent>
              </Select>

              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Group">Group</SelectItem>
                  <SelectItem value="Knockout">Knockout</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sampleWindow} onValueChange={setSampleWindow}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Season">Season</SelectItem>
                  <SelectItem value="L5">L5</SelectItem>
                  <SelectItem value="L10">L10</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto flex items-center gap-2">
                <Input
                  placeholder="Search referees"
                  className="w-[220px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-1 bg-transparent">
                      Tools <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-56" align="end">
                    <DropdownMenuLabel>Presets</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => applyPreset("Discipline & Foul Mix")}>
                      Discipline & Foul Mix
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applyPreset("Set-Piece Impact")}>
                      Set-Piece Impact
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applyPreset("Restart Enforcement (FB)")}>
                      Restart Enforcement (FB)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applyPreset("Advantage & Close-Game")}>
                      Advantage & Close-Game
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applyPreset("Pace & Possessions")}>
                      Pace & Possessions
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applyPreset("Context")}>Context (team & venue)</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Saved Views</DropdownMenuLabel>
                    {savedViews.length === 0 && <DropdownMenuItem disabled>No saved views</DropdownMenuItem>}
                    {savedViews.map((v) => (
                      <DropdownMenuItem key={v.name} onClick={() => loadView(v.name)}>
                        Load: {v.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        const name = prompt("Save current view as:")
                        if (name) saveCurrentView(name)
                      }}
                    >
                      Save current view…
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Tabs value={view} onValueChange={setView}>
                <TabsList>
                  <TabsTrigger value="attacking">Attacking</TabsTrigger>
                  <TabsTrigger value="defending">Defending</TabsTrigger>
                  <TabsTrigger value="paired">Paired</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs value={rateMode} onValueChange={setRateMode}>
                <TabsList>
                  <TabsTrigger value="perMatch">Per match</TabsTrigger>
                  <TabsTrigger value="per100">Per 100</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Switch checked={showDiff} onCheckedChange={setShowDiff} />
                <span className="text-sm text-muted-foreground">DIFF</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={showDeltaLeague} onCheckedChange={setShowDeltaLeague} />
                <span className="text-sm text-muted-foreground">Δ vs League</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={showPercentile} onCheckedChange={setShowPercentile} />
                <span className="text-sm text-muted-foreground">Percentile</span>
              </div>

              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Team filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">No team filter</SelectItem>
                  <SelectItem value="Team A">Team A</SelectItem>
                  <SelectItem value="Team B">Team B</SelectItem>
                </SelectContent>
              </Select>

              <Select value={topBottom} onValueChange={setTopBottom}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Slice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Top 50">Top 50</SelectItem>
                  <SelectItem value="Bottom 50">Bottom 50</SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto flex items-center gap-2">
                <Badge variant="secondary" className="font-normal">
                  Window: {sampleWindow}
                </Badge>
                <Badge variant="secondary" className="font-normal">
                  Preset: {preset}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table + profile panel */}
      <div className="grid grid-cols-1 gap-4">
        <RefereesTable
          rows={filtered}
          league={LEAGUE_BASELINE}
          view={view}
          rateMode={rateMode}
          flags={{ showDiff, showDeltaLeague, showPercentile }}
          code={code}
          onRowClick={setSelectedRef}
        />
      </div>

      <ProfilePanel
        refData={selectedRef}
        onOpenChange={(open) => !open && setSelectedRef(null)}
        league={LEAGUE_BASELINE}
      />
    </div>
  )
}
