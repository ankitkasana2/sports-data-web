import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { toast } from "sonner"
import { CircleAlert } from 'lucide-react';
import { secondsToHHMMSS } from "../LiveUtils" 
export const MarkDialog = observer(function MarkDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentMark.open


  const [awardedTeam, setAwardedTeam] = useState("Team_A")
  const [option, setOption] = useState("")
  const [player, setPlayer] = useState("")

  const onSave = () => {
  try {
    if (awardedTeam == '') {
      toast(<div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>Please select a team.</span>
      </div>)
      return
    } else if (option == '') {
      toast(<div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>Please select outcome.</span>
      </div>)
      return
    }


    // store event 
    store.addEvent({
      event_type: 'Mark',
      free_type: 'mark_free',
      free_outcome: option,
      team_id: awardedTeam,
    })

     toast.success("Data saved successfully!")
    store.closeDialogs()


    // if set shot 
    if (option == 'set_shot') {
      setTimeout(() => {
        store.openDialog('shot', 'mark')
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
            <DialogTitle className="flex gap-3 items-center">
                      <span>Mark</span>
                      <span className="flex gap-2">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-muted">{store.clock.period}</span>
                        <span className="font-mono tabular-nums text-sm">{secondsToHHMMSS(store.clock.seconds)}</span>
                      </span>
                    </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Awarded To</label>
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

          {/* player  */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Catcher</label>
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
                <SelectItem value="set_shot">Mark Free</SelectItem>
                <SelectItem value="play_on">Play On</SelectItem>
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
