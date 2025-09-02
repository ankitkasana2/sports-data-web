import { useLive } from "./LiveContext"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { secondsToHHMMSS } from "./LiveUtils"
import { useState } from "react"

export function TopBar() {
  const { state, dispatch } = useLive()
  const [openSetTime, setOpenSetTime] = useState(false)
  const [timeText, setTimeText] = useState("00:00")

  const setByDelta = (delta) => {
    if (state.clock.running) return
    const next = Math.max(0, state.clock.timeSec + delta)
    dispatch({ type: "CLOCK_SET", timeSec: next })
  }

  const applySetTime = () => {
    if (state.clock.running) return
    const [mm, ss] = timeText.split(":").map((v) => Number.parseInt(v || "0", 10))
    const next = Math.max(0, (mm || 0) * 60 + (ss || 0))
    dispatch({ type: "CLOCK_SET", timeSec: next })
    setOpenSetTime(false)
  }

  const autosaveLabel = state.lastSavedAt ? new Date(state.lastSavedAt).toLocaleTimeString() : "—"

  return (
    <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded bg-muted">{state.clock.period}</span>
          <span className="font-mono tabular-nums text-lg">{secondsToHHMMSS(state.clock.timeSec)}</span>
          <Button
            variant="default"
            size="sm"
            onClick={() => dispatch({ type: state.clock.running ? "CLOCK_PAUSE" : "CLOCK_START" })}
            aria-keyshortcuts="Space"
          >
            {state.clock.running ? "Pause" : "Start"} (Space)
          </Button>
          <Button variant="outline" size="sm" onClick={() => setByDelta(-5)} disabled={state.clock.running}>
            −5s
          </Button>
          <Button variant="outline" size="sm" onClick={() => setByDelta(+5)} disabled={state.clock.running}>
            +5s
          </Button>
          <Dialog open={openSetTime} onOpenChange={setOpenSetTime}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={state.clock.running}>
                Set time…
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Clock (MM:SS)</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2">
                <Input value={timeText} onChange={(e) => setTimeText(e.target.value)} placeholder="MM:SS" />
              </div>
              <DialogFooter>
                <Button onClick={applySetTime}>Apply</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "UNDO" })} aria-keyshortcuts="Z">
            Undo (Z)
          </Button>
          <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "REDO" })} aria-keyshortcuts="Y">
            Redo (Y)
          </Button>
        </div>

        {/* Scoreboard: goals–points (total) */}
        <div className="flex items-center gap-4">
          <ScoreBox
            label="Team A"
            g={state.scoreboard.teamA.goals}
            p={state.scoreboard.teamA.points}
            total={state.scoreboard.teamA.total}
          />
          <span className="text-muted-foreground">—</span>
          <ScoreBox
            label="Team B"
            g={state.scoreboard.teamB.goals}
            p={state.scoreboard.teamB.points}
            total={state.scoreboard.teamB.total}
          />
        </div>

        <div className="text-xs text-muted-foreground">Saved {autosaveLabel}</div>
      </div>
    </div>
  )
}

function ScoreBox({ label, g, p, total }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{label}</span>
      <span className="font-mono tabular-nums">
        {g}–{p}
      </span>
      <span className="text-xs text-muted-foreground">({total})</span>
    </div>
  )
}
