import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { toast } from "sonner"
import { CircleAlert } from 'lucide-react';

export const BackPassDialog = observer(function BackPassDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentBackPass.open

  const [team, setTeam] = useState("teamA")
  const [outcome, setOutcome] = useState("")


  const onSave = () => {
 
    if (team == '') {
      toast(<div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>Please select a team.</span>
      </div>)
      return
    } else if (outcome == '') {
      toast(<div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>Please select outcome.</span>
      </div>)
      return
    }


    // store event 
    store.addEvent({
      event_type: 'free',
      free_type: 'ordinary',
      free_outcome: outcome,
      awarded_team_id: team,
    })
     toast.success("Data successfully saved!")
    store.closeDialogs()

    // if set shot 
    if (outcome == 'set_shot') {
      setTimeout(() => {
        store.openDialog('shot', 'ordinary')
      }, 500);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Back Pass To GK Violation</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Offending Team</label>
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

          {/* outcome  */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Outcome</label>
            <Select value={outcome} onValueChange={(v) => setOutcome(v)}>
              <SelectTrigger>
                <SelectValue placeholder="select an outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="play_on">Play On</SelectItem>
                <SelectItem value="set_shot">Set Shot Now</SelectItem>
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
