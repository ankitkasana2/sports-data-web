import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

export const MarkDialog = observer(function MarkDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentMark.open


  const [team, setTeam] = useState("teamA")
  const [option, setOption] = useState("")
  const [player, setPlayer] = useState("")

  const onSave = () => {
    // const type = store.code === "football" ? "kickout" : "puckout"
    // store.addEvent({ type, team:  team})

    store.closeDialogs()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
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

          {/* player  */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Player</label>
            <Select value={player} onValueChange={(v) => setPlayer(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player1">Player 1</SelectItem>
                <SelectItem value="player2">Player 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* option */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Option</label>
            <Select value={option} onValueChange={(v) => setOption(v)}>
              <SelectTrigger>
                <SelectValue placeholder="select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="markFree">Mark Free</SelectItem>
                <SelectItem value="playOn">Play On</SelectItem>
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
