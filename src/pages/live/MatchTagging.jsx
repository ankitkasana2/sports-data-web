import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Checkbox } from "../../components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Badge } from "../../components/ui/badge"
import { Textarea } from "../../components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"

// Utility helpers
const nowMs = () => Date.now()
const pad2 = (n) => String(n).padStart(2, "0")
const msToClock = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${pad2(m)}:${pad2(s)}`
}
const uuid = () => Math.random().toString(36).slice(2) + "-" + Math.random().toString(36).slice(2)

const LOCAL_KEY = (matchId) => `live-match:${matchId}`

// Core component
export default function LiveMatchPage({ matchId }) {
  // High-level states
  const [phase, setPhase] = useState("pre-match") // pre-match | in-play | half-time | full-time | completed
  const [activePanel, setActivePanel] = useState("lineups") // lineups | feed | stats | pitch
  const [halfLengthMin, setHalfLengthMin] = useState(35) // configurable clock
  const [extraTimeEnabled, setExtraTimeEnabled] = useState(false)

  // Teams and lineups (simple seed; replace with real data)
  const [teams, setTeams] = useState({
    home: { id: "home", name: "Home", code: "HUR" },
    away: { id: "away", name: "Away", code: "HUR" },
  })
  const [lineups, setLineups] = useState({
    home: {
      starters: Array.from({ length: 15 }).map((_, i) => ({
        id: `h${i + 1}`,
        name: `H Player ${i + 1}`,
        onField: true,
        cards: [],
      })),
      bench: Array.from({ length: 8 }).map((_, i) => ({
        id: `hb${i + 1}`,
        name: `H Bench ${i + 1}`,
        onField: false,
        cards: [],
      })),
    },
    away: {
      starters: Array.from({ length: 15 }).map((_, i) => ({
        id: `a${i + 1}`,
        name: `A Player ${i + 1}`,
        onField: true,
        cards: [],
      })),
      bench: Array.from({ length: 8 }).map((_, i) => ({
        id: `ab${i + 1}`,
        name: `A Bench ${i + 1}`,
        onField: false,
        cards: [],
      })),
    },
  })

  // Match metadata (pre-match)
  const [meta, setMeta] = useState({
    season: new Date().getFullYear(),
    competition: "",
    venue: "",
    referee: "",
    ruleset: "standard",
    weather: { windDir: "", windStrength: "", surface: "" },
  })

  // Clock state
  const [clock, setClock] = useState({
    isRunning: false,
    startedAt: 0,
    elapsedMs: 0,
    period: "H1", // H1 | H2 | ET1 | ET2
  })
  const tickRef = useRef(null)

  // Data tracking
  const [events, setEvents] = useState([]) // ordered by time added
  const [possessions, setPossessions] = useState([])
  const [openPossession, setOpenPossession] = useState(null) // { id, team }
  const [subs, setSubs] = useState([]) // { id, team, offId, onId, timeMs }

  // UI states
  const [showPreMatch, setShowPreMatch] = useState(true)
  const [showHotkeys, setShowHotkeys] = useState(false)
  const [saveStatus, setSaveStatus] = useState({ state: "idle", at: null }) // idle | saving | saved

  // Derived: scoreboard from events
  const scoreboard = useMemo(() => {
    const score = { home: { goals: 0, points: 0 }, away: { goals: 0, points: 0 } }
    for (const ev of events) {
      if (ev.type === "shot" && ev.details?.result) {
        if (ev.details.result === "goal") score[ev.team].goals += 1
        if (ev.details.result === "point") score[ev.team].points += 1
      }
    }
    return score
  }, [events])

  const totalPoints = (t) => scoreboard[t].goals * 3 + scoreboard[t].points

  // Live stats (lean version)
  const liveStats = useMemo(() => {
    const stats = {
      shotsFor: { home: 0, away: 0 },
      shotsOn: { home: 0, away: 0 }, // goal+point
      freesFor: { home: 0, away: 0 },
      freesAgainst: { home: 0, away: 0 },
      puckoutOwn: { home: 0, away: 0 },
      puckoutRetained: { home: 0, away: 0 },
      turnoversWon: { home: 0, away: 0 },
      turnoversLost: { home: 0, away: 0 },
      possessions: { home: 0, away: 0 },
    }
    const possStartByTeam = { home: 0, away: 0 }
    for (const p of possessions) {
      if (p.team) possStartByTeam[p.team] += 1
    }
    stats.possessions = possStartByTeam

    for (const ev of events) {
      if (ev.type === "shot") {
        stats.shotsFor[ev.team] += 1
        if (ev.details?.result === "goal" || ev.details?.result === "point") {
          stats.shotsOn[ev.team] += 1
        }
      }
      if (ev.type === "free") {
        if (ev.details?.outcome === "won") stats.freesFor[ev.team] += 1
        if (ev.details?.outcome === "conceded") stats.freesAgainst[ev.team] += 1
      }
      if (ev.type === "puckout") {
        if (ev.details?.who === "own") {
          stats.puckoutOwn[ev.team] += 1
          if (ev.details?.retained) stats.puckoutRetained[ev.team] += 1
        }
      }
      if (ev.type === "turnover") {
        if (ev.details?.kind === "won") stats.turnoversWon[ev.team] += 1
        if (ev.details?.kind === "lost") stats.turnoversLost[ev.team] += 1
      }
    }
    const ppp = {
      home: stats.possessions.home ? (totalPoints("home") / stats.possessions.home).toFixed(2) : "0.00",
      away: stats.possessions.away ? (totalPoints("away") / stats.possessions.away).toFixed(2) : "0.00",
    }
    return { ...stats, ppp }
  }, [events, possessions])

  // Auto-save and resume
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_KEY(matchId))
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setPhase(parsed.phase || "in-play")
        setTeams(parsed.teams || teams)
        setLineups(parsed.lineups || lineups)
        setEvents(parsed.events || [])
        setPossessions(parsed.possessions || [])
        setOpenPossession(parsed.openPossession || null)
        setSubs(parsed.subs || [])
        setMeta(parsed.meta || meta)
        setHalfLengthMin(parsed.halfLengthMin || 35)
        setExtraTimeEnabled(!!parsed.extraTimeEnabled)
        const wasRunning = parsed.clock?.isRunning
        const elapsed = parsed.clock?.elapsedMs || 0
        setClock({
          isRunning: !!wasRunning,
          startedAt: wasRunning ? nowMs() - elapsed : 0,
          elapsedMs: elapsed,
          period: parsed.clock?.period || "H1",
        })
        setShowPreMatch(false)
      } catch (e) {
        // ignore corrupted state
      }
    }
  }, [matchId])

  useEffect(() => {
    setSaveStatus({ state: "saving", at: null })
    const t = setTimeout(() => {
      const snapshot = {
        phase,
        teams,
        lineups,
        events,
        possessions,
        openPossession,
        subs,
        meta,
        halfLengthMin,
        extraTimeEnabled,
        clock: { ...clock, startedAt: clock.isRunning ? nowMs() - clock.elapsedMs : 0 },
      }
      localStorage.setItem(LOCAL_KEY(matchId), JSON.stringify(snapshot))
      setSaveStatus({ state: "saved", at: Date.now() })
    }, 1200)
    return () => clearTimeout(t)
  }, [
    phase,
    teams,
    lineups,
    events,
    possessions,
    openPossession,
    subs,
    meta,
    halfLengthMin,
    extraTimeEnabled,
    clock,
    matchId,
  ])

  // Clock ticking
  useEffect(() => {
    if (clock.isRunning) {
      tickRef.current = setInterval(() => {
        setClock((c) => ({ ...c, elapsedMs: nowMs() - c.startedAt }))
      }, 250)
      return () => clearInterval(tickRef.current)
    }
    return () => { }
  }, [clock.isRunning])

  const startClock = useCallback(() => {
    setClock((c) => (c.isRunning ? c : { ...c, isRunning: true, startedAt: nowMs() - c.elapsedMs }))
    if (phase === "pre-match") setPhase("in-play")
  }, [phase])

  const pauseClock = useCallback(() => {
    setClock((c) => (c.isRunning ? { ...c, isRunning: false, elapsedMs: nowMs() - c.startedAt } : c))
  }, [])

  const resetClock = useCallback(() => {
    setClock((c) => ({ ...c, isRunning: false, startedAt: 0, elapsedMs: 0 }))
  }, [])

  // Possession engine (recompute from events when undone/edited)
  const recomputePossessions = useCallback((allEvents) => {
    const poss = []
    let open = null
    for (const ev of allEvents) {
      const endOpen = (cause) => {
        if (open) {
          open.endEventId = ev.id
          open.endTimeMs = ev.timeMs
          open.endCause = cause
          poss.push(open)
          open = null
        }
      }
      const openFor = (team) => {
        open = { id: uuid(), team, startEventId: ev.id, startTimeMs: ev.timeMs }
      }

      if (ev.type === "puckout") {
        // restart opens possession
        const team = ev.details?.who === "own" ? ev.team : ev.team === "home" ? "away" : "home"
        // close any open before opening a new on restart boundary
        if (open) endOpen("restart")
        openFor(team)
      }
      if (ev.type === "turnover") {
        if (ev.details?.kind === "won") {
          // if open exists for other team, close it, then open for this team
          if (open && open.team !== ev.team) {
            endOpen("turnover_conceded")
          }
          if (!open || open.team !== ev.team) {
            openFor(ev.team)
          }
        } else if (ev.details?.kind === "lost") {
          // close current if it's ours, open for opp
          if (open && open.team === ev.team) {
            endOpen("turnover_conceded")
          }
          const opp = ev.team === "home" ? "away" : "home"
          openFor(opp)
        }
      }
      if (ev.type === "free") {
        if (ev.details?.outcome === "conceded") {
          if (open) endOpen("foul_conceded")
          const opp = ev.team === "home" ? "away" : "home"
          openFor(opp)
        }
        // if won, possession continues
      }
      if (ev.type === "shot") {
        // shots end possession; rebound continuation is advanced, skip for MVP
        if (open) endOpen("shot")
      }
      if (ev.type === "period") {
        // half-time / full-time boundaries close possession
        if (open) endOpen(ev.details?.boundary || "period")
      }
    }
    return { poss, open }
  }, [])

  // Add event helpers
  const addEvent = useCallback(
    (partial) => {
      const ev = { id: uuid(), timeMs: clock.elapsedMs, ...partial }
      const next = [...events, ev]
      const { poss, open } = recomputePossessions(next)
      setEvents(next)
      setPossessions(poss)
      setOpenPossession(open)
    },
    [events, clock.elapsedMs, recomputePossessions],
  )

  const undoLast = useCallback(() => {
    if (!events.length) return
    const next = events.slice(0, -1)
    const { poss, open } = recomputePossessions(next)
    setEvents(next)
    setPossessions(poss)
    setOpenPossession(open)
  }, [events, recomputePossessions])

  // Hotkeys
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase()
      if (k === " " || k === "spacebar") {
        e.preventDefault()
        clock.isRunning ? pauseClock() : startClock()
      } else if (k === "z") {
        e.preventDefault()
        undoLast()
      } else if (k === "s") {
        e.preventDefault()
        setShotDialog({ open: true })
      } else if (k === "f") {
        e.preventDefault()
        setFreeDialog({ open: true })
      } else if (k === "p") {
        e.preventDefault()
        setPuckDialog({ open: true })
      } else if (k === "t") {
        e.preventDefault()
        openTurnover("home")
      } else if (k === "?") {
        setShowHotkeys((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [clock.isRunning, pauseClock, startClock, undoLast])

  // Shot dialog state
  const [shotDialog, setShotDialog] = useState({
    open: false,
    team: "home",
    shooterId: "",
    result: "point",
    note: "",
    xy: null,
  })
  // Free dialog
  const [freeDialog, setFreeDialog] = useState({ open: false, team: "home", outcome: "won", foul: "tackle", note: "" })
  // Puck-out dialog
  const [puckDialog, setPuckDialog] = useState({
    open: false,
    team: "home",
    who: "own",
    length: "short",
    outcome: "clean",
    retained: true,
  })

  // Turnover quick action
  const openTurnover = (team) => {
    addEvent({ type: "turnover", team, details: { kind: "won" } })
  }

  // Substitution
  const makeSub = (team, offId, onId) => {
    if (!offId || !onId) return
    const sub = { id: uuid(), team, offId, onId, timeMs: clock.elapsedMs }
    setSubs((s) => [...s, sub])
    setLineups((l) => {
      const next = structuredClone(l)
      const side = next[team]
      const setOnField = (list, id, val) => {
        const p = list.find((x) => x.id === id)
        if (p) p.onField = val
      }
      setOnField(side.starters, offId, false)
      setOnField(side.bench, offId, false)
      setOnField(side.starters, onId, true)
      setOnField(side.bench, onId, true)
      return next
    })
  }

  // Minutes played computation (simplified)
  const playerMinutes = useMemo(() => {
    const compute = (teamKey) => {
      const players = [...lineups[teamKey].starters, ...lineups[teamKey].bench]
      const byId = Object.fromEntries(players.map((p) => [p.id, { ...p, minutes: 0, onSince: p.onField ? 0 : null }]))
      // starters on since 0; subs adjust
      for (const pId in byId) {
        if (byId[pId].onField) byId[pId].onSince = 0
      }
      // apply subs in time order
      const subsOrdered = subs
        .filter((s) => s.team === teamKey)
        .slice()
        .sort((a, b) => a.timeMs - b.timeMs)
      for (const s of subsOrdered) {
        const off = byId[s.offId]
        if (off && off.onSince !== null) {
          off.minutes += (s.timeMs - off.onSince) / 60000
          off.onSince = null
        }
        const on = byId[s.onId]
        if (on) {
          on.onSince = s.timeMs
        }
      }
      // add current running time for on-field
      const endMs = clock.elapsedMs
      for (const pId in byId) {
        const p = byId[pId]
        if (p.onSince !== null) {
          p.minutes += (endMs - p.onSince) / 60000
        }
      }
      return Object.values(byId)
    }
    return { home: compute("home"), away: compute("away") }
  }, [lineups, subs, clock.elapsedMs])

  // Validation (lean)
  const validate = () => {
    const warns = []
    const pointsHome = totalPoints("home")
    const pointsAway = totalPoints("away")
    const tallyHome = events
      .filter((e) => e.type === "shot" && e.team === "home")
      .reduce((acc, e) => acc + (e.details?.result === "goal" ? 3 : e.details?.result === "point" ? 1 : 0), 0)
    const tallyAway = events
      .filter((e) => e.type === "shot" && e.team === "away")
      .reduce((acc, e) => acc + (e.details?.result === "goal" ? 3 : e.details?.result === "point" ? 1 : 0), 0)
    if (pointsHome !== tallyHome) warns.push("Home scoreboard mismatch with event log.")
    if (pointsAway !== tallyAway) warns.push("Away scoreboard mismatch with event log.")
    const possExpected = events.filter(
      (e) => e.type === "puckout" || (e.type === "turnover" && e.details?.kind === "won"),
    ).length
    if (possExpected !== possessions.length) warns.push("Possession count mismatch (restarts + turnovers won).")
    if (!meta.venue || !meta.referee) warns.push("Missing referee/venue.")
    if (
      lineups.home.starters.filter((p) => p.onField).length < 15 ||
      lineups.away.starters.filter((p) => p.onField).length < 15
    )
      warns.push("Lineups incomplete.")
    return warns
  }

  const completeMatch = () => {
    const warns = validate()
    if (warns.length) {
      setPhase("full-time")
      setValidationMessages(warns)
      return
    }
    setValidationMessages([])
    setPhase("completed")
  }

  const [validationMessages, setValidationMessages] = useState([])

  // Export CSVs
  const downloadCsv = (filename, rows) => {
    const csv = rows.map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const exportEvents = () => {
    const rows = [
      ["id", "time_ms", "period", "team", "type", "details", "possession_id"],
      ...events.map((e) => [
        e.id,
        e.timeMs,
        clock.period,
        e.team,
        e.type,
        JSON.stringify(e.details || {}),
        findPossessionIdForEvent(e.id),
      ]),
    ]
    downloadCsv(`events-${matchId}.csv`, rows)
  }
  const exportPossessions = () => {
    const rows = [
      [
        "id",
        "team",
        "start_event",
        "start_time_ms",
        "end_event",
        "end_time_ms",
        "end_cause",
        "duration_ms",
        "points_from",
      ],
      ...possessions.map((p) => [
        p.id,
        p.team,
        p.startEventId,
        p.startTimeMs,
        p.endEventId || "",
        p.endTimeMs ?? "",
        p.endCause || "",
        p.endTimeMs && p.startTimeMs ? p.endTimeMs - p.startTimeMs : "",
        pointsFromPossession(p.id),
      ]),
    ]
    downloadCsv(`possessions-${matchId}.csv`, rows)
  }
  const exportMinutes = () => {
    const rows = [
      ["team", "player_id", "player_name", "minutes"],
      ...["home", "away"].flatMap((side) => playerMinutes[side].map((p) => [side, p.id, p.name, p.minutes.toFixed(1)])),
    ]
    downloadCsv(`minutes-${matchId}.csv`, rows)
  }

  const findPossessionIdForEvent = (eventId) => {
    const p = possessions.find((pp) => pp.startEventId === eventId || pp.endEventId === eventId)
    if (p) return p.id
    return ""
  }
  const pointsFromPossession = (possessionId) => {
    // look for the ending shot
    const p = possessions.find((pp) => pp.id === possessionId)
    if (!p?.endEventId) return 0
    const ev = events.find((e) => e.id === p.endEventId)
    if (ev?.type === "shot") {
      if (ev.details?.result === "goal") return 3
      if (ev.details?.result === "point") return 1
    }
    return 0
  }

  // UI rendering
  return (
    <main className="p-4 md:p-6 space-y-4">
      {/* Top bar */}
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline">{clock.period}</Badge>
              <div className="text-3xl font-semibold tabular-nums">{msToClock(clock.elapsedMs)}</div>
              <div className="flex items-center gap-2">
                {!clock.isRunning ? (
                  <Button onClick={startClock} variant="default">
                    Start (Space)
                  </Button>
                ) : (
                  <Button onClick={pauseClock} variant="secondary">
                    Pause (Space)
                  </Button>
                )}
                <Button variant="outline" onClick={resetClock}>
                  Reset
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    addEvent({
                      type: "period",
                      team: "home",
                      details: { boundary: phase === "in-play" ? "half-time" : "full-time" },
                    })
                  }
                >
                  Mark {phase === "in-play" ? "Half-Time" : "Full-Time"}
                </Button>
                <Button variant="ghost" onClick={undoLast}>
                  Undo (Z)
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Scoreboard
                title={teams.home.name}
                g={scoreboard.home.goals}
                p={scoreboard.home.points}
                total={totalPoints("home")}
              />
              <div className="text-xl font-semibold">vs</div>
              <Scoreboard
                title={teams.away.name}
                g={scoreboard.away.goals}
                p={scoreboard.away.points}
                total={totalPoints("away")}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Save:{" "}
              {saveStatus.state === "saving"
                ? "Saving..."
                : saveStatus.state === "saved"
                  ? `Saved at ${new Date(saveStatus.at || Date.now()).toLocaleTimeString()}`
                  : "Idle"}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportEvents}>
                Export Events CSV
              </Button>
              <Button variant="outline" onClick={exportPossessions}>
                Export Possessions CSV
              </Button>
              <Button variant="outline" onClick={exportMinutes}>
                Export Minutes CSV
              </Button>
              <Dialog open={showHotkeys} onOpenChange={setShowHotkeys}>
                <DialogTrigger asChild>
                  <Button variant="ghost">Hotkeys (?)</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Hotkeys</DialogTitle>
                  </DialogHeader>
                  <ul className="text-sm space-y-2">
                    <li>
                      <b>Space</b> – Start/Pause clock
                    </li>
                    <li>
                      <b>Z</b> – Undo last event
                    </li>
                    <li>
                      <b>S</b> – Shot
                    </li>
                    <li>
                      <b>F</b> – Free
                    </li>
                    <li>
                      <b>P</b> – Puck-out/Kick-out
                    </li>
                    <li>
                      <b>T</b> – Turnover (won)
                    </li>
                  </ul>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Event Pad */}
        <section className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Pad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => setShotDialog({ open: true, team: "home", result: "point" })}>Shot (S)</Button>
                <Button variant="secondary" onClick={() => setFreeDialog({ open: true, team: "home", outcome: "won" })}>
                  Free (F)
                </Button>
                <Button variant="outline" onClick={() => setPuckDialog({ open: true, team: "home", who: "own" })}>
                  Puck-out (P)
                </Button>
                <Button variant="outline" onClick={() => openTurnover("home")}>
                  Turnover (T)
                </Button>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Tip: Choose team inside dialogs. Possessions open/close automatically.
              </div>
            </CardContent>
          </Card>

          {/* Quick Sub */}
          <Card>
            <CardHeader>
              <CardTitle>Substitution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <SubForm lineups={lineups} onSubmit={makeSub} />
            </CardContent>
          </Card>
        </section>

        {/* Right Panels */}
        <section className="lg:col-span-8">
          <Tabs value={activePanel} onValueChange={setActivePanel}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="lineups">Lineups</TabsTrigger>
              <TabsTrigger value="feed">Event Feed</TabsTrigger>
              <TabsTrigger value="stats">Live Stats</TabsTrigger>
              <TabsTrigger value="pitch">Mini Pitch</TabsTrigger>
            </TabsList>

            <TabsContent value="lineups" className="space-y-4">
              <LineupsPanel lineups={lineups} playerMinutes={playerMinutes} />
            </TabsContent>

            <TabsContent value="feed">
              <EventFeed
                events={events}
                onEdit={(idx, patch) => {
                  const next = events.slice()
                  next[idx] = { ...next[idx], ...patch }
                  const { poss, open } = recomputePossessions(next)
                  setEvents(next)
                  setPossessions(poss)
                  setOpenPossession(open)
                }}
              />
            </TabsContent>

            <TabsContent value="stats">
              <LiveStatsPanel stats={liveStats} />
            </TabsContent>

            <TabsContent value="pitch">
              <MiniPitch
                events={events.filter((e) => e.type === "shot")}
                onPoint={(xy) => setShotDialog((s) => ({ ...s, open: true, xy }))}
              />
            </TabsContent>
          </Tabs>
        </section>
      </div>

      {/* Validation warnings */}
      {validationMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 text-sm space-y-1">
              {validationMessages.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Phase: {phase}</div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setPhase("half-time")
              pauseClock()
              setValidationMessages(validate())
            }}
          >
            Half-Time
          </Button>
          <Button variant="default" onClick={completeMatch}>
            Complete Match
          </Button>
        </div>
      </div>

      {/* Pre-Match Checklist Modal */}
      <Dialog open={showPreMatch} onOpenChange={(v) => setShowPreMatch(v)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pre-Match Checklist</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Season</Label>
              <Input
                type="number"
                value={meta.season}
                onChange={(e) => setMeta({ ...meta, season: Number(e.target.value) })}
              />
              <Label>Competition</Label>
              <Input value={meta.competition} onChange={(e) => setMeta({ ...meta, competition: e.target.value })} />
              <Label>Venue</Label>
              <Input value={meta.venue} onChange={(e) => setMeta({ ...meta, venue: e.target.value })} />
              <Label>Referee</Label>
              <Input value={meta.referee} onChange={(e) => setMeta({ ...meta, referee: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ruleset</Label>
              <Select value={meta.ruleset} onValueChange={(v) => setMeta({ ...meta, ruleset: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ruleset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Half Length (min)</Label>
                  <Input
                    type="number"
                    value={halfLengthMin}
                    onChange={(e) => setHalfLengthMin(Number(e.target.value || 0))}
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <Checkbox
                    id="et"
                    checked={extraTimeEnabled}
                    onCheckedChange={(v) => setExtraTimeEnabled(Boolean(v))}
                  />
                  <Label htmlFor="et">Extra-Time possible</Label>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Wind Dir</Label>
                  <Input
                    value={meta.weather.windDir}
                    onChange={(e) => setMeta({ ...meta, weather: { ...meta.weather, windDir: e.target.value } })}
                  />
                </div>
                <div>
                  <Label>Wind Strength</Label>
                  <Input
                    value={meta.weather.windStrength}
                    onChange={(e) => setMeta({ ...meta, weather: { ...meta.weather, windStrength: e.target.value } })}
                  />
                </div>
                <div>
                  <Label>Surface</Label>
                  <Input
                    value={meta.weather.surface}
                    onChange={(e) => setMeta({ ...meta, weather: { ...meta.weather, surface: e.target.value } })}
                  />
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Textarea placeholder="Any pre-match notes..." />
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Complete all required fields to start.</div>
            <Button
              onClick={() => {
                setShowPreMatch(false)
                setPhase("in-play")
                startClock()
              }}
              disabled={
                !meta.venue || !meta.referee || lineups.home.starters.length < 15 || lineups.away.starters.length < 15
              }
            >
              Confirm & Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shot Dialog */}
      <Dialog open={shotDialog.open} onOpenChange={(v) => setShotDialog((s) => ({ ...s, open: v }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Shot</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Team</Label>
                <Select value={shotDialog.team} onValueChange={(v) => setShotDialog((s) => ({ ...s, team: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">{teams.home.name}</SelectItem>
                    <SelectItem value="away">{teams.away.name}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Result</Label>
                <Select value={shotDialog.result} onValueChange={(v) => setShotDialog((s) => ({ ...s, result: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goal">Goal</SelectItem>
                    <SelectItem value="point">Point</SelectItem>
                    <SelectItem value="wide">Wide</SelectItem>
                    <SelectItem value="saved">Saved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Label>Shooter</Label>
            <Input
              value={shotDialog.shooterId}
              onChange={(e) => setShotDialog((s) => ({ ...s, shooterId: e.target.value }))}
              placeholder="Player ID/Name (free text MVP)"
            />
            <Label>Note</Label>
            <Input
              value={shotDialog.note}
              onChange={(e) => setShotDialog((s) => ({ ...s, note: e.target.value }))}
              placeholder="Optional"
            />
            <div>
              <Label>Shot Location</Label>
              <MiniPitch clickToSet className="mt-2" onPoint={(xy) => setShotDialog((s) => ({ ...s, xy }))} />
              <div className="text-xs text-muted-foreground mt-1">Click on the mini pitch to set location.</div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                addEvent({
                  type: "shot",
                  team: shotDialog.team,
                  details: {
                    result: shotDialog.result,
                    shooterId: shotDialog.shooterId,
                    note: shotDialog.note,
                    xy: shotDialog.xy,
                  },
                })
                setShotDialog({ open: false, team: "home", shooterId: "", result: "point", note: "", xy: null })
              }}
            >
              Add Shot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Free Dialog */}
      <Dialog open={freeDialog.open} onOpenChange={(v) => setFreeDialog((s) => ({ ...s, open: v }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Free</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Team</Label>
              <Select value={freeDialog.team} onValueChange={(v) => setFreeDialog((s) => ({ ...s, team: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">{teams.home.name}</SelectItem>
                  <SelectItem value="away">{teams.away.name}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Outcome</Label>
              <Select value={freeDialog.outcome} onValueChange={(v) => setFreeDialog((s) => ({ ...s, outcome: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="conceded">Conceded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Foul Type</Label>
              <Input
                value={freeDialog.foul}
                onChange={(e) => setFreeDialog((s) => ({ ...s, foul: e.target.value }))}
                placeholder="e.g., Tackle"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                addEvent({
                  type: "free",
                  team: freeDialog.team,
                  details: { outcome: freeDialog.outcome, foul: freeDialog.foul },
                })
                setFreeDialog({ open: false, team: "home", outcome: "won", foul: "tackle", note: "" })
              }}
            >
              Add Free
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Puck-out Dialog */}
      <Dialog open={puckDialog.open} onOpenChange={(v) => setPuckDialog((s) => ({ ...s, open: v }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Puck-out / Kick-out</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Team</Label>
              <Select value={puckDialog.team} onValueChange={(v) => setPuckDialog((s) => ({ ...s, team: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">{teams.home.name}</SelectItem>
                  <SelectItem value="away">{teams.away.name}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Who</Label>
              <Select value={puckDialog.who} onValueChange={(v) => setPuckDialog((s) => ({ ...s, who: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="own">Own</SelectItem>
                  <SelectItem value="oppo">Opposition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Length</Label>
              <Select value={puckDialog.length} onValueChange={(v) => setPuckDialog((s) => ({ ...s, length: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Outcome</Label>
              <Select value={puckDialog.outcome} onValueChange={(v) => setPuckDialog((s) => ({ ...s, outcome: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clean">Clean</SelectItem>
                  <SelectItem value="contested">Contested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <Checkbox
                id="retained"
                checked={puckDialog.retained}
                onCheckedChange={(v) => setPuckDialog((s) => ({ ...s, retained: Boolean(v) }))}
              />
              <Label htmlFor="retained">Possession retained</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                addEvent({
                  type: "puckout",
                  team: puckDialog.team,
                  details: {
                    who: puckDialog.who,
                    length: puckDialog.length,
                    outcome: puckDialog.outcome,
                    retained: puckDialog.retained,
                  },
                })
                setPuckDialog({
                  open: false,
                  team: "home",
                  who: "own",
                  length: "short",
                  outcome: "clean",
                  retained: true,
                })
              }}
            >
              Add Puck-out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

// Subcomponents

function Scoreboard({ title, g, p, total }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-lg font-medium">{title}</div>
      <Badge variant="secondary" className="text-base">
        {g}-{p}
      </Badge>
      <span className="text-muted-foreground">({total})</span>
    </div>
  )
}

function SubForm({ lineups, onSubmit }) {
  const [team, setTeam] = useState("home")
  const [offId, setOffId] = useState("")
  const [onId, setOnId] = useState("")
  const players = useMemo(() => {
    const side = lineups[team]
    return [...side.starters, ...side.bench]
  }, [lineups, team])
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
      <div className="md:col-span-1">
        <Label>Team</Label>
        <Select value={team} onValueChange={setTeam}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="away">Away</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-1">
        <Label>Off</Label>
        <Select value={offId} onValueChange={setOffId}>
          <SelectTrigger>
            <SelectValue placeholder="Player off" />
          </SelectTrigger>
          <SelectContent>
            {players
              .filter((p) => p.onField)
              .map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-1">
        <Label>On</Label>
        <Select value={onId} onValueChange={setOnId}>
          <SelectTrigger>
            <SelectValue placeholder="Player on" />
          </SelectTrigger>
          <SelectContent>
            {players
              .filter((p) => !p.onField)
              .map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-1 flex items-end">
        <Button
          className="w-full"
          onClick={() => {
            onSubmit(team, offId, onId)
            setOffId("")
            setOnId("")
          }}
          disabled={!offId || !onId}
        >
          Make Sub
        </Button>
      </div>
    </div>
  )
}

function LineupsPanel({ lineups, playerMinutes }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {["home", "away"].map((side) => (
        <Card key={side}>
          <CardHeader>
            <CardTitle className="capitalize">{side} lineup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Minutes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerMinutes[side].map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.onField ? <Badge>On</Badge> : <Badge variant="outline">Off</Badge>}</TableCell>
                    <TableCell className="text-right">{p.minutes.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EventFeed({ events, onEdit }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...events].reverse().map((e, idx) => {
              const displayIdx = events.length - 1 - idx
              return (
                <TableRow key={e.id}>
                  <TableCell className="tabular-nums">{msToClock(e.timeMs)}</TableCell>
                  <TableCell className="capitalize">{e.team}</TableCell>
                  <TableCell className="uppercase">{e.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs">{JSON.stringify(e.details || {})}</code>
                      {/* Simple inline edit: change a result from wide->point, etc. */}
                      {e.type === "shot" && (
                        <Select
                          onValueChange={(v) => onEdit(displayIdx, { details: { ...(e.details || {}), result: v } })}
                          defaultValue={e.details?.result}
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="goal">Goal</SelectItem>
                            <SelectItem value="point">Point</SelectItem>
                            <SelectItem value="wide">Wide</SelectItem>
                            <SelectItem value="saved">Saved</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  No events yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function LiveStatsPanel({ stats }) {
  const pct = (num, den) => (den ? `${Math.round((num / den) * 100)}%` : "0%")
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Shots</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div>
            Home: {stats.shotsFor.home} total, {stats.shotsOn.home} on — Conv:{" "}
            {pct(stats.shotsOn.home, stats.shotsFor.home)}
          </div>
          <div>
            Away: {stats.shotsFor.away} total, {stats.shotsOn.away} on — Conv:{" "}
            {pct(stats.shotsOn.away, stats.shotsFor.away)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Frees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div>
            For: H {stats.freesFor.home} / A {stats.freesFor.away}
          </div>
          <div>
            Against: H {stats.freesAgainst.home} / A {stats.freesAgainst.away}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Puck-outs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div>
            Own: H {stats.puckoutOwn.home} / A {stats.puckoutOwn.away}
          </div>
          <div>
            Retention: H {stats.puckoutRetained.home} / A {stats.puckoutRetained.away}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>PPP & Possessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div>
            PPP: H {stats.ppp.home} / A {stats.ppp.away}
          </div>
          <div>
            Possessions: H {stats.possessions.home} / A {stats.possessions.away}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MiniPitch({ events = [], onPoint, clickToSet = false, className = "" }) {
  // Simple 100x60 field coordinate system
  const ref = useRef(null)
  const handleClick = (e) => {
    if (!clickToSet || !onPoint || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    onPoint({ x, y })
  }
  return (
    <div
      className={`border rounded-md bg-background relative h-56 ${className}`}
      ref={ref}
      onClick={handleClick}
      aria-label="Mini pitch"
    >
      {/* midline */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-muted" />
      {events.map((e) => {
        const { x = Math.random(), y = Math.random() } = e.details?.xy || {}
        const color =
          e.details?.result === "goal"
            ? "bg-emerald-600"
            : e.details?.result === "point"
              ? "bg-blue-600"
              : "bg-slate-400"
        return (
          <div
            key={e.id}
            className={`absolute w-2 h-2 rounded-full ${color}`}
            style={{ left: `${x * 100}%`, top: `${y * 100}%`, transform: "translate(-50%, -50%)" }}
          />
        )
      })}
    </div>
  )
}
