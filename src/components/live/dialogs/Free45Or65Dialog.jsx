import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

export const Free45Or65Dialog = observer(function Free45Or65Dialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.current45Or65.open

  const [awardedTeam, setAwardedTeam] = useState("teamA")
  const [outcome, setOutcome] = useState("")

  const onSave = () => {
    // const type = store.code === "football" ? "kickout" : "puckout"
    // store.addEvent({ type, team: awardedTeam })

    store.closeDialogs()
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
                <SelectItem value="playOn">Play On</SelectItem>
                <SelectItem value="setShotNow">Set Shot Now</SelectItem>
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
