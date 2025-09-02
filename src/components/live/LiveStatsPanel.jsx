import { useMemo } from "react"
import { useLive } from "./LiveContext"
import { Card } from "../ui/card"

export function LiveStatsPanel({ compact = false }) {
  const { state } = useLive()

  const shots = useMemo(() => {
    const list = state.events.filter((e) => e.type === "shot")
    const attempts = list.length
    const goals = list.filter((s) => s.result === "goal").length
    const points = list.filter((s) => s.result === "point").length
    const wides = list.filter((s) => s.result === "wide").length
    const short = list.filter((s) => s.result === "dropped_short").length
    const saved = list.filter((s) => s.result === "saved").length
    const blocked = list.filter((s) => s.result === "blocked").length
    const ptsTotal = list.reduce(
      (acc, s) => acc + (s.score_value ?? (s.result === "goal" ? 3 : s.result === "point" ? 1 : 0)),
      0,
    )
    const pps = computePPP(state)
    return { attempts, goals, points, wides, short, saved, blocked, ptsTotal, pps }
  }, [state])

  const restarts = useMemo(() => {
    const isKick = state.code === "football"
    const list = state.events.filter((e) => (isKick ? e.type === "kickout" : e.type === "puckout"))
    // Placeholder: compute percentages when first_contact/final_possession fields exist
    return { total: list.length, ownRetentionPct: null }
  }, [state])

  if (compact) {
    return (
      <div className="flex items-center gap-4 overflow-x-auto py-2 text-sm">
        <StatPill label="Shots" value={`${shots.attempts}`} sub={`${shots.goals}G/${shots.points}P`} />
        <StatPill
          label="Scores"
          value={`${state.scoreboard.teamA.goals}-${state.scoreboard.teamA.points} • ${state.scoreboard.teamB.goals}-${state.scoreboard.teamB.points}`}
          sub={`A ${state.scoreboard.teamA.total} • B ${state.scoreboard.teamB.total}`}
        />
        <StatPill label="Frees" value={`${state.events.filter((e) => e.type === "free").length}`} />
        <StatPill
          label="Restart retention"
          value={restarts.ownRetentionPct !== null ? `${(restarts.ownRetentionPct * 100).toFixed(0)}%` : "—"}
        />
        <StatPill label="PPP" value={shots.pps.toFixed(2)} />
      </div>
    )
  }

  return (
    <Card className="p-3">
      <div className="mb-2 text-sm font-medium">Live Stats</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded border p-2">
          <div className="font-medium">Shots</div>
          <div>Attempts: {shots.attempts}</div>
          <div>
            Goals: {shots.goals} • Points: {shots.points}
          </div>
          <div>
            Wides: {shots.wides} • Saved: {shots.saved} • Blocked: {shots.blocked} • Short: {shots.short}
          </div>
          <div>PPP: {shots.pps.toFixed(2)}</div>
        </div>
        <div className="rounded border p-2">
          <div className="font-medium">{state.code === "football" ? "Kick-outs" : "Puck-outs"}</div>
          <div>Total: {restarts.total}</div>
          <div>
            Own retention: {restarts.ownRetentionPct !== null ? `${(restarts.ownRetentionPct * 100).toFixed(0)}%` : "—"}
          </div>
        </div>
      </div>
    </Card>
  )
}

function StatPill({ label, value, sub }) {
  return (
    <div className="rounded-full border px-3 py-1">
      <span className="font-medium">{label}:</span> <span className="ml-1">{value}</span>
      {sub && <span className="ml-2 text-muted-foreground">{sub}</span>}
    </div>
  )
}

function computePPP(state) {
  const pts = state.scoreboard.teamA.total + state.scoreboard.teamB.total // team-neutral display
  const completed = state.possessions.filter((p) => p.end_time_sec != null).length || 1
  return pts / completed
}
