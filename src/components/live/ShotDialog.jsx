import { useState, useEffect } from "react"
import { useLive } from "./LiveContext"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { MiniPitch } from "./MiniPitch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export function ShotDialog() {
  const { state, dispatch } = useLive()
  const open = !!state.ui.currentShot?.open
  const [result, setResult] = useState("point")
  const [shotType, setShotType] = useState("open_play")
  const xy = state.ui.currentShot?.xy ?? null

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
    // Minimal required fields + score value derived later
    const teamId = state.teamA.id // For demo, alternate by parity of shots
    const which = state.events.filter((e) => e.type === "shot").length % 2 === 0 ? state.teamA.id : state.teamB.id

    dispatch({
      type: "SUBMIT_EVENT",
      event: {
        id: undefined,
        type: "shot",
        team_id: which,
        match_id: state.matchId,
        period: state.clock.period,
        time_sec: state.clock.timeSec,
        hhmmss: "",
        xy: xy ?? undefined,
        result,
        shot_type: shotType,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dispatch({ type: "CLOSE_DIALOGS" })}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Shot</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-3">
            <MiniPitch
              code={state.code}
              mode="select"
              value={xy ?? undefined}
              onChange={(xy) => dispatch({ type: "SET_DIALOG_XY", dialog: "shot", xy })}
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

            {state.code === "football" && (
              <div className="rounded-md border p-2 text-xs">
                Two-pointer logic: outside/on 40 m arc from open play or free qualifies, unless touched in flight. We
                derive the score value from XY and shot_type.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => dispatch({ type: "CLOSE_DIALOGS" })} variant="outline">
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
