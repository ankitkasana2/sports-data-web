import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { toast } from "sonner"
import { CircleAlert } from 'lucide-react';
import { secondsToHHMMSS } from "../LiveUtils"
export const ThrowInDialog = observer(function ThrowInDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentThrowIn.open

  const [wonTeam, setWonTeam] = useState("")

  const onSave = () => {
    try {
      if (wonTeam == '') {
        toast(<div className="flex gap-2 items-center">
          <CircleAlert className="text-red-500 h-4 w-4" />
          <span>Please select a team.</span>
        </div>)
        return
      }


      // store event 
      store.addEvent({
        event_type: 'throw_in',
        throw_in_won_by_team_id: wonTeam,
        team_id:wonTeam
      })
      toast.success("Data saved successfully!")
      store.closeDialogs()
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
             <DialogTitle className="flex gap-3 items-center">
                                          <span>Throw In</span>
                                          <span className="flex gap-2">
                                            <span className="text-xs font-medium px-2 py-1 rounded bg-muted">{store.clock.period}</span>
                                            <span className="font-mono tabular-nums text-sm">{secondsToHHMMSS(store.clock.seconds)}</span>
                                          </span>
                                        </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
              <SelectGroup
              label="Won By"
              value={wonTeam || undefined}
              onChange={setWonTeam}
            >
              <SelectItem value={store.team_a_name}>
                {store.team_a_name}
              </SelectItem>
            
              <SelectItem value={store.team_b_name}>
                {store.team_b_name}
              </SelectItem>
            </SelectGroup>
            
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

function SelectGroup({ label, value, onChange, children }) {
  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  )
}