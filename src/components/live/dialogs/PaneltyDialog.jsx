import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { toast } from "sonner"
import { CircleAlert } from 'lucide-react';

export const PaneltyDialog = observer(function PaneltyDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentPanelty.open

  const [awardedTeam, setAwardedTeam] = useState("Team_A")
  const [fouledPlayer, setFouledPlayer] = useState("")
  const [takeNow, setTakeNow] = useState("set_shot")


  const onSave = () => {
    try {
      if (awardedTeam == '') {
        toast(<div className="flex gap-2 items-center">
          <CircleAlert className="text-red-500 h-4 w-4" />
          <span>Please select a team.</span>
        </div>)
        return
      } else if (takeNow == '') {
        toast(<div className="flex gap-2 items-center">
          <CircleAlert className="text-red-500 h-4 w-4" />
          <span>Select if the penalty is taken.</span>
        </div>)
        return
      }

      // store event 
      store.addEvent({
        event_type: 'panelty',
        free_type: 'Penalty_awarded',
        free_outcome: takeNow,
        awarded_team_id: awardedTeam,
        team_id:awardedTeam,
      })
      toast.success("Data saved successfully!")
      store.closeDialogs()

      // if set shot 
      if (takeNow == 'set_shot') {
        setTimeout(() => {
          store.openDialog('shot', 'penalty')
        }, 500);
      }
    }
    catch (error) {
      toast.error("Failed to save event")
      console.error(error)
    }

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
                <SelectItem value="Team_A">Team A</SelectItem>
                <SelectItem value="Team_B">Team B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* foules player  */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Fouled Player</label>
            <Select value={fouledPlayer} onValueChange={(v) => setFouledPlayer(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select fouled player" />
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
                <SelectItem value="set_shot">Yes</SelectItem>
                <SelectItem value="play_on">No</SelectItem>
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
