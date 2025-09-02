import { useState } from "react"
import { useLive } from "./LiveContext"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { MiniPitch } from "./MiniPitch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"

export function FreeDialog() {
  const { state, dispatch } = useLive()
  const open = !!state.ui.currentFree?.open
  const xy = state.ui.currentFree?.xy ?? null

  const [awardedTeam, setAwardedTeam] = useState(state.teamA.id)
  const [foulingTeam, setFoulingTeam] = useState(state.teamB.id)
  const [is45, setIs45] = useState(false)
  const [is65, setIs65] = useState(false)
  const [tapAndGo, setTapAndGo] = useState(false)

  const onSave = () => {
    dispatch({
      type: "SUBMIT_EVENT",
      event: {
        // id left undefined for backend to generate
        type: "free",
        match_id: state.matchId,
        awarded_to_team_id: awardedTeam,
        fouling_team_id: foulingTeam,
        xy: xy ?? undefined,
        meta: {},
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dispatch({ type: "CLOSE_DIALOGS" })}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Free</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-3">
            <MiniPitch
              code={state.code}
              mode="select"
              value={xy ?? undefined}
              onChange={(xy) => dispatch({ type: "SET_DIALOG_XY", dialog: "free", xy })}
            />
            <div className="text-xs text-muted-foreground">Click pitch to set XY.</div>
          </div>

          <div className="space-y-3">
            {/* Awarded Team */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Awarded to</label>
              <Select value={awardedTeam} onValueChange={(v) => setAwardedTeam(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={state.teamA.id}>{state.teamA.name}</SelectItem>
                  <SelectItem value={state.teamB.id}>{state.teamB.name}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fouling Team */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Fouling team</label>
              <Select value={foulingTeam} onValueChange={(v) => setFoulingTeam(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={state.teamA.id}>{state.teamA.name}</SelectItem>
                  <SelectItem value={state.teamB.id}>{state.teamB.name}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Football options */}
            {state.code === "football" && (
              <>
                <div className="flex items-center justify-between rounded-md border p-2">
                  <Label htmlFor="is45">Is 45</Label>
                  <Switch id="is45" checked={is45} onCheckedChange={setIs45} />
                </div>
                <div className="flex items-center justify-between rounded-md border p-2">
                  <Label htmlFor="tap">Tap & Go</Label>
                  <Switch id="tap" checked={tapAndGo} onCheckedChange={setTapAndGo} />
                </div>
              </>
            )}

            {/* Hurling options */}
            {state.code === "hurling" && (
              <div className="flex items-center justify-between rounded-md border p-2">
                <Label htmlFor="is65">Is 65</Label>
                <Switch id="is65" checked={is65} onCheckedChange={setIs65} />
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
