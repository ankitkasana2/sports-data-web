import { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { MiniPitch } from "../MiniPitch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

export const ShotDialog = observer(function ShotDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentShot.open
  const [result, setResult] = useState("point")
  const [shotType, setShotType] = useState("open_play")
  const [position, setPosition] = useState(null)
  const [team, setTeam] = useState("teamA")
  const [arcStatus, setArcStatus] = useState("none")
  const [shooter, setShooter] = useState('')
  const [pressure, setPressure] = useState('')
  const [badge, setBadge] = useState('none')

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

            <div className="flex justify-between">
              {/* distance band  */}
              <div>
                <Label className="text-sm font-medium">Distance band</Label>
                <Badge>{badge}</Badge>
              </div>

              {/* arc_status  */}
              {store.code == 'football' && <div className="grid gap-1">
                <Label className="text-sm font-medium">Arc Status</Label>
                <Badge>{arcStatus}</Badge>
              </div>}
            </div>

          </div>


          <div className="space-y-3 ">
            <div className="flex justify-between">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Team</label>
                <Select value={team} onValueChange={(v) => setTeam(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teamA">Team A</SelectItem>
                    <SelectItem value="teamB">Team B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                    <SelectItem value="short">Dropped Short</SelectItem>
                    <SelectItem value="post">Off Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            <div className="grid gap-1">
              <label className="text-sm font-medium">Shot Type</label>
              <Select value={shotType} onValueChange={(v) => setShotType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open_play">Open Play</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  {<SelectItem value={store.code == 'football' ? '45' : '65'}>{store.code == 'football' ? '45' : '65'}</SelectItem>}
                  <SelectItem value="penalty">Penalty</SelectItem>
                  <SelectItem value="sideline_cut">Sideline</SelectItem>
                  {store.code == 'football' && <SelectItem value="mark_free">Mark free</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              {/* shooter  */}
              <div className="grid gap-1">
                <label className="text-sm font-medium">Shooter</label>
                <Select value={shooter} onValueChange={(v) => setShooter(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goal">Goal</SelectItem>
                    <SelectItem value="point">Point</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* pressure  */}
              <div className="grid gap-1">
                <label className="text-sm font-medium">Pressure</label>
                <Select value={pressure} onValueChange={(v) => setPressure(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pressure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Light">Light</SelectItem>
                    <SelectItem value="Heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>



          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => store.closeDialogs()} variant="outline">
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
})
