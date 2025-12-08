import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { MiniPitch } from "../MiniPitch"
import { toast } from "sonner"
import { CircleAlert } from 'lucide-react';
import { secondsToHHMMSS } from "../LiveUtils"

export const SidelineDialog = observer(function SidelineDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentSideline.open


  const [awardedTeam, setAwardedTeam] = useState("Team_A")
  const [outcome, setOutcome] = useState("")
  const [position, setPosition] = useState(null)

  // saving event 
  const onSave = () => {

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
      event_type: 'sideline',
      free_type: 'Sideline',
      free_outcome: outcome,
      awarded_team_id: awardedTeam,
      team_id:awardedTeam,
      spot_x: position ? position.x : null,
      spot_y: position ? position.y : null
    })

    // store position 
    store.setDialogXY("sideline", position)
    toast.success("Data saved successfully!")
    store.closeDialogs()

    // if set shot 
    if (outcome == 'set_shot') {
      setTimeout(() => {
        store.openDialog('shot', 'sideline')
      }, 500);
    }

  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
           <DialogTitle className="flex gap-3 items-center">
                      <span>Sideline</span>
                      <span className="flex gap-2">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-muted">{store.clock.period}</span>
                        <span className="font-mono tabular-nums text-sm">{secondsToHHMMSS(store.clock.seconds)}</span>
                      </span>
                    </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* mini pitch  */}
          <div className="space-y-3">
            <MiniPitch
              code={store.code}
              mode="select"
              value={position}
              onChange={(xy) => (setPosition(xy))}
            />
            <div className="text-xs text-muted-foreground">Click pitch to set XY.</div>
          </div>

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
