import { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { MiniPitch } from "./MiniPitch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export const ShotDialog = observer(function ShotDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentShot.open
  const [result, setResult] = useState("point")
  const [shotType, setShotType] = useState("open_play")
  const [position, setPosition] = useState(null)

  useEffect(() => {
    if (!open) return
    const h = (e) => {
      if (e.key.toLowerCase() === "g") setResult("goal")
      if (e.key.toLowerCase() === "p") setResult("point")
      if (e.key.toLowerCase() === "w") setResult("wide")
      if (e.key.toLowerCase() === "v") setResult("saved")
      if (e.key.toLowerCase() === "b") setResult("blocked")
      if (e.key.toLowerCase() === "d") setResult("dropped_short")
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [open])

  const onSave = () => {
    // Simple alternation for team side demo: home/away
    const shotCount = store.events.filter((e) => e.type === "shot").length
    const team = shotCount % 2 === 0 ? "home" : "away"

    // Record the shot event
    store.addEvent({ type: "shot", team, result, shot_type: shotType, position })

    // store position 
    store.setDialogXY("shot", position)
    // Update scoreboard if point/goal
    if (result === "goal") store.addScore(team, "goal")
    if (result === "point") store.addScore(team, "point")

    store.closeDialogs()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Shot</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-3">
            <MiniPitch
              code={store.code}
              mode="select"
              value={position}
              onChange={(xy) => setPosition(xy)}
            />
            <div className="text-xs text-muted-foreground">
              Click pitch to set XY. Quick keys: G goal, P point, W wide, V saved, B blocked, D dropped.
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Result</label>
              <Select value={result} onValueChange={(v) => setResult(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goal">Goal</SelectItem>
                  <SelectItem value="point">Point</SelectItem>
                  <SelectItem value="wide">Wide</SelectItem>
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="dropped_short">Dropped short</SelectItem>
                  <SelectItem value="off_post">Off post</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Shot Type</label>
              <Select value={shotType} onValueChange={(v) => setShotType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open_play">Open play</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="45">45</SelectItem>
                  <SelectItem value="65">65</SelectItem>
                  <SelectItem value="penalty">Penalty</SelectItem>
                  <SelectItem value="sideline_cut">Sideline cut</SelectItem>
                  <SelectItem value="mark_free">Mark free</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {store.code === "football" && (
              <div className="rounded-md border p-2 text-xs">
                Two-pointer logic can be derived later. We update score for goals/points now.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => store.closeDialogs()} variant="outline">
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
