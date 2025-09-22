import { useState } from "react"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { MiniPitch } from "../MiniPitch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Switch } from "../../ui/switch"
import { Label } from "../../ui/label"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { secondsToHHMMSS } from "../LiveUtils"

export const FreeDialog = observer(function FreeDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentFree.open
  const xy = store.ui.currentFree.xy ?? null

  const [awardedTeam, setAwardedTeam] = useState("home")
  const [awardedPlayer, setAwardedPlayer] = useState('')
  const [foulingPlayer, setFoulingPlayer] = useState("")
  const [foulCategory, setFoulCategory] = useState('')
  const [is50, setIs50] = useState(false)
  const [nextAction, setNextAction] = useState('')
  const [position, setPosition] = useState(null)


  const onSave = () => {
    store.addEvent({ type: "free", team: awardedTeam })

    // store position 
    store.setDialogXY("free", position)

    store.closeDialogs()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className='flex gap-3 items-center'>
            <span>Free -</span>
            <span className="flex gap-2">
              <span className="text-xs font-medium px-2 py-1 rounded bg-muted">{store.clock.period}</span>
              <span className="font-mono tabular-nums text-sm">{secondsToHHMMSS(store.clock.seconds)}</span>
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-3">
            <MiniPitch
              code={store.code}
              mode="select"
              value={position}
              onChange={(xy) => setPosition(xy)}
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

            {/* fouls category  */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Foul Categories</label>
              <Select value={foulCategory} onValueChange={(v) => setFoulCategory(v)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a foul categories' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dissent">Dissent</SelectItem>
                  <SelectItem value="Not_retreating_13m">Not_retreating_13m</SelectItem>
                  <SelectItem value="Throwing_ball_away">Throwing_ball_away</SelectItem>
                  <SelectItem value="Tactical_delay">Tactical_delay</SelectItem>
                  <SelectItem value="Melee">Melee</SelectItem>
                  <SelectItem value="Head_high_contact">Head_high_contact</SelectItem>
                  <SelectItem value="Cynical_hold_up">Cynical_hold_up</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Structure_breach">Structure_breach (4-back/3-up)</SelectItem>
                </SelectContent>
              </Select>
            </div>


            {store.code === "football" && (
              <>
                <div className="flex items-center justify-between rounded-md border p-2">
                  <Label htmlFor="is50">50m Advance</Label>
                  <Switch id="is50" checked={is50} onCheckedChange={setIs50} />
                </div>
              </>
            )}

            {/* foul won player  */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Foul Won By</label>
              <Select value={awardedPlayer} onValueChange={(v) => setAwardedPlayer(v)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select player' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* fouling player  */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Fouling Player</label>
              <Select value={foulingPlayer} onValueChange={(v) => setFoulingPlayer(v)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select layer' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* next action  */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Next Action</label>
              <Select value={nextAction} onValueChange={(v) => setNextAction(v)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select next action' />
                </SelectTrigger>
                <SelectContent>
                  {store.code == 'football' && <SelectItem value="solo&go">Solo & Go</SelectItem>}
                  <SelectItem value="place_Kick">Place kick</SelectItem>
                  <SelectItem value="play_short">Play short</SelectItem>
                  <SelectItem value="turnover">Turnover</SelectItem>
                  <SelectItem value="advantage">Advantage</SelectItem>
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
