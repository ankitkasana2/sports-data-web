import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { secondsToHHMMSS } from "./LiveUtils"

export const TopBar = observer(function TopBar() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const [openSetTime, setOpenSetTime] = useState(false)
  const [timeText, setTimeText] = useState("00:00")

  const setByDelta = (delta) => {
    if (store.clock.running) return
    const next = Math.max(0, store.clock.seconds + delta)
    store.setTime(next)
  }

  const applySetTime = () => {
    if (store.clock.running) return
    const [mm, ss] = timeText.split(":").map((v) => Number.parseInt(v || "0", 10))
    const next = Math.max(0, (mm || 0) * 60 + (ss || 0))
    store.setTime(next)
    setOpenSetTime(false)
  }

  const formatSaveTime = (timestamp) => {
    if (!timestamp) return "—"
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Placeholder for autosave timestamp
  const autosaveLabel = store.lastSavedAt ? formatSaveTime(store.lastSavedAt) : "—"

  const saveStatus = store.pendingChanges ? "Saving..." : `Saved ${autosaveLabel}`
  const offlineIndicator = !store.isOnline ? " (Offline)" : ""

  const totalHome = store.score.home.goals * 3 + store.score.home.points
  const totalAway = store.score.away.goals * 3 + store.score.away.points

  return (
    <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded bg-muted">{store.clock.period}</span>
          <span className="font-mono tabular-nums text-lg">{secondsToHHMMSS(store.clock.seconds)}</span>
          <Button
            variant="default"
            size="sm"
            onClick={() => (store.clock.running ? store.pauseClock() : store.startClock())}
            aria-keyshortcuts="Space"
          >
            {store.clock.running ? "Pause" : "Start"} (Space)
          </Button>
          <Button variant="outline" size="sm" onClick={() => setByDelta(-5)} disabled={store.clock.running}>
            −5s
          </Button>
          <Button variant="outline" size="sm" onClick={() => setByDelta(+5)} disabled={store.clock.running}>
            +5s
          </Button>
          <Dialog open={openSetTime} onOpenChange={setOpenSetTime}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={store.clock.running}>
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
          <Button variant="ghost" size="sm" onClick={() => store.undo()} aria-keyshortcuts="Z">
            Undo (Z)
          </Button>
          <Button variant="ghost" size="sm" onClick={() => store.redo()} aria-keyshortcuts="Y">
            Redo (Y)
          </Button>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center gap-4">
          <ScoreBox label="Team A" g={store.score.home.goals} p={store.score.home.points} total={totalHome} />
          <span className="text-muted-foreground">—</span>
          <ScoreBox label="Team B" g={store.score.away.goals} p={store.score.away.points} total={totalAway} />
        </div>

        {/* <div className="text-xs text-muted-foreground">Saved {autosaveLabel}</div> */}
        <div className={`text-xs ${!store.isOnline ? "text-orange-500" : "text-muted-foreground"}`}>
          {saveStatus}
          {offlineIndicator}
        </div>
      </div>
    </div>
  )
})

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
