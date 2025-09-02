import { useState } from "react"
import { useLive } from "./LiveContext"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export function TurnoverDialog() {
  const { state, dispatch } = useLive()
  const open = !!state.ui.currentTurnover?.open
  const [gain, setGain] = useState(state.teamA.id)

  const onSave = () => {
    dispatch({
      type: "SUBMIT_EVENT",
      event: {
        id: undefined,
        type: "turnover",
        match_id: state.matchId,
        team_losing_possession_id: gain === state.teamA.id ? state.teamB.id : state.teamA.id,
        team_gaining_possession_id: gain,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dispatch({ type: "CLOSE_DIALOGS" })}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Turnover</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Gaining team</label>
            <Select value={gain} onValueChange={(v) => setGain(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={state.teamA.id}>{state.teamA.name}</SelectItem>
                <SelectItem value={state.teamB.id}>{state.teamB.name}</SelectItem>
              </SelectContent>
            </Select>
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
