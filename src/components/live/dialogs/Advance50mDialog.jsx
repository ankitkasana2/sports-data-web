import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { CircleAlert } from 'lucide-react';


export const Advance50mDialog = observer(function Advance50mDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.current50mAdvance.open

  const [team, setTeam] = useState("teamA")
  const [message, setMessage] = useState('')

  const onSave = () => {

    if (team == '') {
      toast(<div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>Please select a team.</span>
      </div>)
      return
    }

    // store event 
    // store.addEvent({
    //   free_type: 'Advance 50m',
    //   won_team: team,
    // })

    store.closeDialogs()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>50m Advance</DialogTitle>
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

          {/* message  */}
          <div className="grid gap-3 col-span-2">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Reason</label>
              <Textarea placeholder="Type your message here." value={message}
                onChange={(e) => setMessage(e.target.value)} />
            </div>
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
