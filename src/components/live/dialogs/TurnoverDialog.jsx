
import { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { secondsToHHMMSS } from "../LiveUtils"
import { MiniPitch } from "../MiniPitch"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "../../ui/label"
import { toast } from "sonner"
import { CircleAlert, FileWarning } from 'lucide-react';

export const TurnoverDialog = observer(function TurnoverDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentTurnover.open

  const [position, setPosition] = useState(null)
  const [awardedTeam, setAwardedPlayer] = useState("")
  const [mechanism, setMechanism] = useState('')
  const [player, setPlayer] = useState({
    wonBy: '',
    loseBy: '',
    pressureBy: '',
  })
  const [pressureFlag, setPressureFlag] = useState(false)
  const [onBalanceFlag, setOnBalanceFlag] = useState(false)
  const [message, setMessage] = useState('')
  const [calculation, setCalculation] = useState({
    turnover_distance_m: 'none',
    turnover_distance_band: 'none',
    lane_sector: 'none',
    zone: 'none',
  })



  useEffect(() => {
    if (position != null) {

      setCalculation(prev => ({ ...prev, zone: getZone(position.x, position.y) }))

      let distance = 0
      let arc = ''
      if (awardedTeam == 'home') {
        distance = Math.round(Math.sqrt((position.x - 2) ** 2 + (position.y - 49) ** 2))
        arc = position.x < 30 ? 'inside_40' : position.x >= 30 && position.x <= 32 ? 'on_40' : position.x > 32 ? 'outside_40' : 'none'
      } else {
        distance = Math.round(Math.sqrt((position.x - 95) ** 2 + (position.y - 49) ** 2))
        arc = position.x > 68.5 ? 'inside_40' : position.x <= 68.5 && position.x >= 67.5 ? 'on_40' : position.x < 67.5 ? 'outside_40' : 'none'
      }

      setCalculation(prev => ({
        ...prev,
        turnover_distance_m: distance, // or whatever value
        turnover_distance_band: distance <= 20 ? '0-20' : distance > 20 && distance <= 35 ? "21-35" : distance > 36 && distance <= 55 ? '36-55' : distance > 55 ? "56+" : 'none',
        lane_sector: Math.round(position.x >= 33.33 && position.x <= 66.67) ? 'Centre' : Math.round(position.x < 33.33) ? 'Left' : 'Right',
        arc_status: arc
      }));

    }

  }, [position, awardedTeam])



  const onSave = () => {

    if (awardedTeam == '') {
      toast(<div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>Please select a team.</span>
      </div>)
      return
    } else if (mechanism == '') {
      toast(<div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>Please select mechanism.</span>
      </div>)
      return
    } else if (player.wonBy == '') {
      toast(<div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>Please select player who won turnover.</span>
      </div>)
      return
    }

    if (position == null) {
      toast(<div className="flex gap-2 items-center">
        <FileWarning className="text-yellow-600 h-4 w-4" />
        <span>Zone Not Set.</span>
      </div>)
    }

    store.setDialogXY("turnover", position)


    // store event 
    store.addEvent({
       event_type: 'turnover',
      turnover_mechanism: mechanism,
      forced_flag: mechanism == 'Handling_error' && mechanism == 'Loose_ball' ? 'false' : 'true',
      ball_type: '',
      won_team: awardedTeam,
      team_id: awardedTeam,
      spot_x: position ? position.x : null,
      spot_y: position ? position.y : null,
      zone: calculation.zone,
      lane_sector: calculation.lane_sector,
      turnover_distance_m: calculation.turnover_distance_m,
      turnover_distance_band: calculation.turnover_distance_band,
      turnover_won_by_player_id: player.wonBy,
      turnover_conceded_by_player_id: player.loseBy,
      pressure_player_id: player.pressureBy,
      on_balance_flag: onBalanceFlag,
      pressure_flag: pressureFlag,
      notes: message,
    })
       toast.success("Data saved successfully!")
    store.closeDialogs()

    // set emplty 
    setAwardedPlayer('home')
    setPosition(null)
    setPressureFlag(false)
    setOnBalanceFlag(false)
    setMessage('')
    setMechanism('')
    setPlayer({
      wonBy: '',
      loseBy: '',
      pressureBy: '',
    })
    setCalculation({
      turnover_distance_m: 'none',
      turnover_distance_band: 'none',
      lane_sector: 'none',
      zone: 'none',
    })
  }

  // calculate zone 
  function getZone(xPercent, yPercent) {
    // Rows
    let row = ""
    if (yPercent <= 33.33) row = "DEF"
    else if (yPercent <= 66.66) row = "MID"
    else row = "HB"

    // Columns
    let col = ""
    if (xPercent <= 20) col = "Left"
    else if (xPercent <= 40) col = "Left-Center"
    else if (xPercent <= 60) col = "Center"
    else if (xPercent <= 80) col = "Right-Center"
    else col = "Right"

    return `${row}-${col}`
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className='w-full sm:max-w-lg md:max-w-3xl '>
        <DialogHeader>
          <DialogTitle className='flex gap-3 items-center'>
            <span>Turnover</span>
            <span className="flex gap-2">
              <span className="text-xs font-medium px-2 py-1 rounded bg-muted">{store.clock.period}</span>
              <span className="font-mono tabular-nums text-sm">{secondsToHHMMSS(store.clock.seconds)}</span>
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <MiniPitch
              code={store.code}
              mode="select"
              value={position}
              onChange={(xy) => (setPosition(xy))}
            />
            <div className="text-xs text-muted-foreground">Click pitch to set XY.</div>

            <div className="grid grid-cols-2">
              {/* turnover_distance_m   */}
              <div>
                <Label className="text-sm font-medium">Turnover_distance_m</Label>
                <Badge>{calculation.turnover_distance_m}</Badge>
              </div>

              {/* turnover_distance_band   */}
              <div>
                <Label className="text-sm font-medium">Turnover_distance_band</Label>
                <Badge>{calculation.turnover_distance_band}</Badge>
              </div>

              {/* lane sector   */}
              <div>
                <Label className="text-sm font-medium">Lane sector</Label>
                <Badge>{calculation.lane_sector}</Badge>
              </div>

              {/* zone  */}
              {store.code == 'football' && <div className="grid gap-1">
                <Label className="text-sm font-medium">Zone</Label>
                <Badge>{calculation.zone}</Badge>
              </div>}
            </div>
          </div>

          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
            {/* team  */}
            <div className="grid gap-1">
           
              <SelectGroup
               label="Gaining team"
               value={awardedTeam || undefined}
               onChange={setAwardedPlayer}
             >
               <SelectItem value={store.team_a_name}>
                 {store.team_a_name}
               </SelectItem>
             
               <SelectItem value={store.team_b_name}>
                 {store.team_b_name}
               </SelectItem>
             </SelectGroup>
            </div>

            {/* mechanissm  */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Mechanism</label>
              <Select value={mechanism} onValueChange={(v) => setMechanism(v)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select the mechanism' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Interception">Interception</SelectItem>
                  <SelectItem value="Tackle">Tackle-dispossession</SelectItem>
                  <SelectItem value="Block">Blockdown / Block</SelectItem>
                  {store.code == 'hurling' && <SelectItem value="Hook">Hook</SelectItem>}
                  <SelectItem value="Handling_error">Handling error </SelectItem>
                  <SelectItem value="Save">Save & recovery</SelectItem>
                  <SelectItem value="Loose_ball">Loose ball win</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* won by player  */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Won by player</label>
              <Select value={player.wonBy} onValueChange={(v) => setPlayer(prev => ({ ...prev, wonBy: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a player' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player1">Player1</SelectItem>
                  <SelectItem value="player2">Player2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* lose by player  */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Lose by player</label>
              <Select value={player.loseBy} onValueChange={(v) => setPlayer(prev => ({ ...prev, loseBy: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a player' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player1">Player1</SelectItem>
                  <SelectItem value="player2">Player2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* pressure by player  */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Pressure by player</label>
              <Select value={player.pressureBy} onValueChange={(v) => setPlayer(prev => ({ ...prev, pressureBy: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a player' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player1">Player1</SelectItem>
                  <SelectItem value="player2">Player2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* pressure flag  */}
            <div className="flex items-center space-x-2">
              <label htmlFor="pressure-switch" className="text-sm font-medium">
                Under Pressure?
              </label>
              <Switch
                id="pressure-switch"
                checked={pressureFlag}
                onCheckedChange={setPressureFlag}
              />
            </div>

            {/* onBalanceFlag */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">On Balance?</label>
              <Switch checked={onBalanceFlag} onCheckedChange={setOnBalanceFlag} />
            </div>


            {/* note  */}
            <div className="grid gap-3 col-span-2">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Note</label>
                <Textarea placeholder="Type your message here." value={message}
                  onChange={(e) => setMessage(e.target.value)} />
              </div>
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