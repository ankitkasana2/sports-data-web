import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { secondsToHHMMSS } from "../LiveUtils"

export const KickoutOrPuckoutDialog = observer(function KickoutOrPuckoutDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentKickoutOrPuckout.open

  const [length, setLength] = useState("")
  const [executingTeam, setExecutingTeam] = useState("")
  const [outcome, setOutcome] = useState('')
  const [line, setLine] = useState('')
  const [side, setSide] = useState('')
  const [wonTeam, setWonTeam] = useState("")
  const [winnerPlayer, setWinnerPlayer] = useState('')
  const [targetzone, setTargetzone] = useState('')
  const [firstReceiverPlayer, setFirstReceiverPlayer] = useState('')
  const [restartTaker, setRestartTaker] = useState('')
  const [mark, setMark] = useState('none')
  const [retained, setRetained] = useState('false')
  const [bubble50m, setBubble50m] = useState(false)


  // handle preset 
  const handlePreset = (val) => {
    switch (val) {
      case 1:
        setWonTeam(executingTeam)
        setRetained('true')
        setOutcome('clean')
        break;

      case 2:
        setOutcome('from_break')
        setWonTeam(executingTeam)
        setRetained('true')
        break;

      case 3:
        setOutcome('clean')
        setWonTeam(executingTeam)
        setRetained('false')
        break;

      case 4:
        setOutcome('from_break')
        setWonTeam(executingTeam)
        setRetained('false')
        break;


      default:
        break;
    }
  }

  // Validation for Save button
  const isValid = length && outcome && targetzone;

  const onSave = async () => {
    try {
      const evt = {
        event_type: 'restart',
        awarded_team_id: executingTeam,
        team_id: executingTeam,
        won_by_team_id: wonTeam,
        start_cause: 'restart',
        outcome_restart: outcome,
        target_zone: targetzone,
        first_receiver_player_id: firstReceiverPlayer || null,
        restart_taker_player_id: restartTaker || null,
        restart_type: store.code === "football" ? "kickout" : "puckout",
        retained: retained === 'false' ? false : true,
        side: side,
        line: line,
        // Boolean mapping
        kickout_mark: mark !== 'none',
        mark_play_on: mark === 'play_on',
        bubble_50m: bubble50m,
      }

      // store event
      store.addEvent(evt)

      // success message
      toast.success("Data saved successfully!")

      store.closeDialogs()
    } catch (error) {
      toast.error("Failed to save event")
      console.error(error)
    }

  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex gap-3 items-center">{store.code === "football" ? "Kick-out" : "Puck-out"}
            <span className="flex gap-2">
              <span className="text-xs font-medium px-2 py-1 rounded bg-muted">{store.clock.period}</span>
              <span className="font-mono tabular-nums text-sm">{secondsToHHMMSS(store.clock.seconds)}</span>
            </span>

          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* preset tiles  */}
          <div className="grid grid-cols-2 gap-2 col-span-2">
            <Button variant={'secondary'} className='cursor-pointer' onClick={() => handlePreset(1)} size={'sm'}>Clean Own (1)</Button>
            <Button variant={'secondary'} className='cursor-pointer' onClick={() => handlePreset(2)} size={'sm'}>Break Own (2)</Button>
            <Button variant={'secondary'} className='cursor-pointer' onClick={() => handlePreset(3)} size={'sm'}>Clean Opp (3)</Button>
            <Button variant={'secondary'} className='cursor-pointer' onClick={() => handlePreset(4)} size={'sm'}>Break Opp (4)</Button>
          </div>

          {/* team  */}
          <div className="grid gap-1">

            <SelectGroup
              label="Taking Team"
              value={executingTeam || undefined}
              onChange={setExecutingTeam}
            >
              <SelectItem value={store.team_a_name}>
                {store.team_a_name}
              </SelectItem>

              <SelectItem value={store.team_b_name}>
                {store.team_b_name}
              </SelectItem>
            </SelectGroup>
          </div>

          {/* restart taker (GK) */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Restart Taker (GK)</label>
            <Select value={restartTaker} onValueChange={setRestartTaker}>
              <SelectTrigger>
                <SelectValue placeholder='Select taker' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player1">Player1</SelectItem>
                <SelectItem value="player2">Player2</SelectItem>
                <SelectItem value="player3">Player3</SelectItem>
                <SelectItem value="player4">Player4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* outcome  */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Outcome</label>
            <Select value={outcome} onValueChange={(v) => setOutcome(v)}>
              <SelectTrigger>
                <SelectValue placeholder='Select outcome' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clean">clean</SelectItem>
                <SelectItem value="from_break">from_break</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* length  */}
          <div className="grid gap-1 col-span-2">
            <label className="text-sm font-medium">Length Band</label>
            <RadioGroup
              value={length}
              onValueChange={setLength}
              className="flex space-x-2"
            >
              <div className="flex items-center">
                <RadioGroupItem value="short" id="short" className="sr-only" />
                <label
                  htmlFor="short"
                  className={`px-3 py-1 rounded-md border text-sm cursor-pointer ${length === "short"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 "
                    }`}
                >
                  Short
                </label>
              </div>

              <div className="flex items-center">
                <RadioGroupItem value="medium" id="medium" className="sr-only" />
                <label
                  htmlFor="medium"
                  className={`px-3 py-1 rounded-md border text-sm cursor-pointer ${length === "medium"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 "
                    }`}
                >
                  Medium
                </label>
              </div>

              <div className="flex items-center">
                <RadioGroupItem value="long" id="long" className="sr-only" />
                <label
                  htmlFor="long"
                  className={`px-3 py-1 rounded-md border text-sm cursor-pointer ${length === "long"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 "
                    }`}
                >
                  Long
                </label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-1 col-span-2">
            {/* target zone  */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Target Zone</label>
              <Select value={targetzone} onValueChange={(v) => setTargetzone(v)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select target zone' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Left post">Left post</SelectItem>
                  <SelectItem value="Centre post">Centre post</SelectItem>
                  <SelectItem value="Right post">Right post</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* first receiver player  */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">First Receiver Player</label>
              <Select value={firstReceiverPlayer} onValueChange={(v) => setFirstReceiverPlayer(v)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a player' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player1">Player1</SelectItem>
                  <SelectItem value="player2">Player2</SelectItem>
                  <SelectItem value="player3">Player3</SelectItem>
                  <SelectItem value="player4">Player4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Destination */}
          <div className="grid grid-cols-2 gap-1 col-span-2">
            {/* side  */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Side</label>
              <Select value={side} onValueChange={(v) => setSide(v)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select outcome' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clean">clean</SelectItem>
                  <SelectItem value="from_break">from_break</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* line  */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Line</label>
              <Select value={line} onValueChange={(v) => setLine(v)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select outcome' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FB">FB</SelectItem>
                  <SelectItem value="HB">HB</SelectItem>
                  <SelectItem value="MF">MF</SelectItem>
                  <SelectItem value="HF">HF</SelectItem>
                  <SelectItem value="FF">FF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* won by  */}
          <div className="grid gap-1">
            <SelectGroup
              label="Won By "
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

          {/* winner  */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">Winner</label>
            <Select value={winnerPlayer} onValueChange={(v) => setWinnerPlayer(v)}>
              <SelectTrigger>
                <SelectValue placeholder='Select a player' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player1">Player1</SelectItem>
                <SelectItem value="player2">Player2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 40m crossed  */}
          {store.code == 'football' && <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Checkbox id="terms" checked={retained === 'true'} onCheckedChange={(c) => setRetained(c ? 'true' : 'false')} />
              <Label htmlFor="terms">Crossed 40m?</Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox id="bubble50" checked={bubble50m} onCheckedChange={setBubble50m} />
              <Label htmlFor="bubble50">Bubble 50m?</Label>
            </div>

            <div>
              <Label>Retained</Label>
              <Badge>{retained}</Badge>
            </div>
          </div>}

          <div className="grid gap-1">
            <label className="text-sm font-medium">Mark</label>
            <Select value={mark} onValueChange={(v) => setMark(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="play_on">Play on</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => store.closeDialogs()} variant="outline">
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!isValid}>Save</Button>
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