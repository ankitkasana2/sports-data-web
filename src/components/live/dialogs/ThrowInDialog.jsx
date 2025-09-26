import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

export const ThrowInDialog = observer(function ThrowInDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentThrowIn.open

  const [wonTeam, setWonTeam] = useState('Team_A')

  const onSave = () => {
    const type = 'throw_in'
    store.addEvent({ type, won_team: wonTeam })

    store.closeDialogs()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Throw In</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Won By</label>
            <Select value={wonTeam} onValueChange={(v) => setWonTeam(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Team_A">Team A</SelectItem>
                <SelectItem value="Team_B">Team B</SelectItem>
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
