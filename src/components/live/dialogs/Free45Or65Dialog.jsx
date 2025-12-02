import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { toast } from "sonner"
import { CircleAlert } from 'lucide-react';


export const Free45Or65Dialog = observer(function Free45Or65Dialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.current45Or65.open

  const [awardedTeam, setAwardedTeam] = useState("Team_A")
  const [outcome, setOutcome] = useState("")

  const onSave = () => {
    try {
      if (awardedTeam == '') {
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
        free_type: store.code == 'football' ? '45' : '65',
        free_outcome: outcome,
        awarded_team_id: awardedTeam,
      })
      toast.success("Data saved successfully!")
      store.closeDialogs()

      // if set shot 
      if (outcome == 'set_shot') {
        setTimeout(() => {
          store.openDialog('shot', store.code == 'football' ? '45' : '65')
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
          <DialogTitle>{store.code == "football" ? '45' : '65'}</DialogTitle>
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
