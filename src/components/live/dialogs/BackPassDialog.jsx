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


  const onSave = () => {

    if (awardedTeam == '') {
      toast(<div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>Please select a team.</span>
      </div>)
      return
    }


    // store event 
    // store.addEvent({
    //   type: 'free',
    //   free_type: 'ordinary',
    //   free_outcome: outcome,
    //   won_team: awardedTeam,
    //   spot_x: position ? position.x : null,
    //   spot_y: position ? position.y : null
    // })

    store.closeDialogs()
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
