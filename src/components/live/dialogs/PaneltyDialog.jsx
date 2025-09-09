import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

export const PaneltyDialog = observer(function PaneltyDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentPanelty.open

  const [awardedTeam, setAwardedTeam] = useState("teamA")
  const [fouledPlayer, setFouledPlayer] = useState("")
  const [takeNow, setTakeNow] = useState("yes")


  const onSave = () => {
    // const type = store.code === "football" ? "kickout" : "puckout"
    // store.addEvent({ type, team: awardedTeam })

    store.closeDialogs()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Panelty</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Awarded to</label>
            <Select value={awardedTeam} onValueChange={(v) => setAwardedTeam(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teamA">Team A</SelectItem>
                <SelectItem value="teamB">Team B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* foules player  */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Fouled Player</label>
            <Select value={fouledPlayer} onValueChange={(v) => setFouledPlayer(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select fouled player"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player1">Player 1</SelectItem>
                <SelectItem value="player2">Player 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* outcome  */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Take Now ?</label>
            <Select value={takeNow} onValueChange={(v) => setTakeNow(v)}>
              <SelectTrigger>
                <SelectValue placeholder="select an outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
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
