import { useState } from "react"
import { useLive } from "./LiveContext"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export function RestartDialog() {
  const { state, dispatch } = useLive()
  const open = !!state.ui.currentRestart?.open

  const [length, setLength] = useState("short")
  const [direction, setDirection] = useState("middle")
  const [executing, setExecuting] = useState(state.teamA.id)

  const onSave = () => {
    const type = state.code === "football" ? "kickout" : "puckout"
    dispatch({
      type: "SUBMIT_EVENT",
      event: {
        id: undefined,
        match_id: state.matchId,
        type,
        executing_team_id: executing,
        length,
        direction,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dispatch({ type: "CLOSE_DIALOGS" })}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{state.code === "football" ? "Kick-out" : "Puck-out"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Executing team</label>
            <Select value={executing} onValueChange={(v) => setExecuting(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={state.teamA.id}>{state.teamA.name}</SelectItem>
                <SelectItem value={state.teamB.id}>{state.teamB.name}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">Length</label>
            <Select value={length} onValueChange={(v) => setLength(v)}>
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

          <div className="grid gap-1">
            <label className="text-sm font-medium">Direction</label>
            <Select value={direction} onValueChange={(v) => setDirection(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="middle">Middle</SelectItem>
                <SelectItem value="right">Right</SelectItem>
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
