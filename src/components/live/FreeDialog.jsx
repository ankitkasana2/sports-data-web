import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { MiniPitch } from "./MiniPitch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"

export const FreeDialog = observer(function FreeDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentFree.open
  const xy = store.ui.currentFree.xy ?? null

  const [awardedTeam, setAwardedTeam] = useState("home")
  const [foulingTeam, setFoulingTeam] = useState("away")
  const [is45, setIs45] = useState(false)
  const [is65, setIs65] = useState(false)
  const [tapAndGo, setTapAndGo] = useState(false)

  const onSave = () => {
    store.addEvent({ type: "free", team: awardedTeam })
    store.closeDialogs()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Free</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-3">
            <MiniPitch
              code={store.code}
              mode="select"
              value={xy ?? undefined}
              onChange={(xy) => store.setDialogXY("free", xy)}
            />
            <div className="text-xs text-muted-foreground">Click pitch to set XY.</div>
          </div>

          <div className="space-y-3">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Awarded to</label>
              <Select value={awardedTeam} onValueChange={(v) => setAwardedTeam(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Fouling team</label>
              <Select value={foulingTeam} onValueChange={(v) => setFoulingTeam(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {store.code === "football" && (
              <>
                <div className="flex items-center justify-between rounded-md border p-2">
                  <Label htmlFor="is45">Is 45</Label>
                  <Switch id="is45" checked={is45} onCheckedChange={setIs45} />
                </div>
                <div className="flex items-center justify-between rounded-md border p-2">
                  <Label htmlFor="tap">Tap & Go</Label>
                  <Switch id="tap" checked={tapAndGo} onCheckedChange={setTapAndGo} />
                </div>
              </>
            )}

            {store.code === "hurling" && (
              <div className="flex items-center justify-between rounded-md border p-2">
                <Label htmlFor="is65">Is 65</Label>
                <Switch id="is65" checked={is65} onCheckedChange={setIs65} />
              </div>
            )}
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
