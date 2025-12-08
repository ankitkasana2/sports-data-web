// ShotDialog.jsx
import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { MiniPitch } from "../MiniPitch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronsUpDown, Check, CircleAlert } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { secondsToHHMMSS } from "../LiveUtils"
const players = [
  { value: "player-1", label: "Player 1" },
  { value: "player-2", label: "Player 2" },
  { value: "player-3", label: "Player 3" },
  { value: "player-4", label: "Player 4" },
]

export const ShotDialog = observer(function ShotDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentShot.open

  const [team, setTeam] = useState("home")
  const [result, setResult] = useState("")
  const [shotType, setShotType] = useState("")
  const [shooter, setShooter] = useState("")
  const [assist, setAssist] = useState("")
  const [pressure, setPressure] = useState("")
  const [position, setPosition] = useState(null)
  const [openShooter, setOpenShooter] = useState(false)
  const [openAssist, setOpenAssist] = useState(false)

  const [calc, setCalc] = useState({
    distance_m: "—",
    distance_band: "—",
    angle_deg: "—",
    sector: "—",
    arc_status: "—",
  })

  // Auto-calc distance, angle, sector, arc
  useEffect(() => {
    if (!position) {
      setCalc({
        distance_m: "—",
        distance_band: "—",
        angle_deg: "—",
        sector: "—",
        arc_status: "—",
      })
      return
    }

    // choose goal center depending on which team is attacking
    // assume pitch coords: x 0..100 (0 = left goal, 100 = right goal), y 0..100 (50 center)
    const goal = team === "home" ? { x: 100, y: 50 } : { x: 0, y: 50 }
    const dx = goal.x - position.x
    const dy = goal.y - position.y
    const distance = Math.round(Math.sqrt(dx * dx + dy * dy))

    // angle: compute angle subtended by goal (approx) — simple approximation using dy/dx
    // here using atan2(abs(dy), abs(dx)) -> degrees (gives 0..90). That's consistent with earlier code.
    const angle = Math.round(Math.atan2(Math.abs(dy), Math.abs(dx)) * (180 / Math.PI))

    // arc status for football (40m / arc we used 39..41 as on_40 etc.)
    const arc =
      store.code === "football"
        ? distance < 39
          ? "inside_40"
          : distance >= 39 && distance <= 41
          ? "on_40"
          : "outside_40"
        : "n/a"

    const band =
      distance <= 20
        ? "0–20"
        : distance <= 35
        ? "21–35"
        : distance <= 55
        ? "36–55"
        : "56+"

    // sector: left / center / right (dy negative = left side assuming origin top-left)
    const sector = position.y < 33.33 ? "L" : position.y > 66.66 ? "R" : "C"

    setCalc({
      distance_m: distance,
      distance_band: band,
      angle_deg: angle,
      sector,
      arc_status: arc,
    })
  }, [position, team, store.code])

  // Keyboard quick keys
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      const k = e.key.toLowerCase()
      if (k === "g") setResult("goal")
      if (k === "p") setResult("point")
      if (k === "w") setResult("wide")
      if (k === "v") setResult("saved")
      if (k === "b") setResult("blocked")
      if (k === "d") setResult("dropped_short")
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open])

  const onSave = async () => {
    // validations
    if (!team) {
      toast(<ValidationMsg text="Please select a team." />)
      return
    }
    if (!shooter) {
      toast(<ValidationMsg text="Please select shooter." />)
      return
    }
    if (!result) {
      toast(<ValidationMsg text="Please select result." />)
      return
    }
    if (!shotType) {
      toast(<ValidationMsg text="Please select shot type." />)
      return
    }
    if (!position) {
      toast(<ValidationMsg text="Please choose position on pitch." />)
      return
    }

    // build event
    const evt = {
      event_type: "shot",
      awarded_team_id: team,
      team_id:team,
      shooter_player_id: shooter,
      assist_player_id: assist || null,
      shot_type: shotType,
      shot_result: result,
      pressure: pressure || "None",
      ts: store.clock.seconds,
      period: store.clock.period,
      xy: position,
      distance_m: calc.distance_m === "—" ? null : calc.distance_m,
      distance_band: calc.distance_band,
      angle_deg: calc.angle_deg === "—" ? null : calc.angle_deg,
      sector: calc.sector,
      arc_status: calc.arc_status,
      spot_x: position ? position.x : null,
      spot_y: position ? position.y : null
      // points_awarded computed below
    }

    // compute points awarded
    const points_awarded =
      result === "goal"
        ? 3
        : store.code === "football" &&
          result === "point" &&
          (shotType === "from_play" || shotType === "free" || shotType === "mark") &&
          (calc.arc_status === "on_40" || calc.arc_status === "outside_40")
        ? 2
        : result === "point"
        ? 1
        : 0

    evt.points_awarded = points_awarded

    // add event
    store.addEvent(evt)
    // store XY for UI (persist last position)
    store.setDialogXY("shot", position)

    // update scoreboard if any points
    if (evt.points_awarded > 0) {
      // addScore accepts teamName and kind: 'goal' | 'two_point' | 'point' OR we support points number
      if (evt.points_awarded === 3) store.addScore(team, "goal")
      else if (evt.points_awarded === 2) store.addScore(team, "two_point")
      else if (evt.points_awarded === 1) store.addScore(team, "point")
    }

    // POSSESSION LOGIC:
    // - goal / point => possession ends (and scoreboard updated)
    // - wide => possession ends (defence gets ball)
    // - saved/blocked => ambiguous: we need to know who got the rebound
    //    --> we prompt the user (simple confirm):
    //         OK = attack retained (start sub-possession)
    //         Cancel = defence gained (end possession)
    // - dropped_short / post etc. => treat as possession end (defence) by default
    const shotEndsPossession = ["goal", "point", "wide", "dropped_short", "post"].includes(result)
    const ambiguousResults = ["saved", "blocked"]

    if (shotEndsPossession) {
      store.endPossession(team === "home" ? "home" : "away")
      store.closeDialogs()
    } else if (ambiguousResults.includes(result)) {
      // prompt referee/operator: did attack retain?
      // Using window.confirm for simplicity — replace with a nicer UI dialog if you want.
      const attackRetained = window.confirm(
        "Did the attacking team retain possession after this shot? (OK = ATTACK retained / Cancel = DEFENCE gained)"
      )
      if (attackRetained) {
        // attacker keeps possession -> new sub-possession
        store.startSubPossession(team)
      } else {
        // defence gains ball -> end possession for attack
        store.endPossession(team === "home" ? "home" : "away")
      }
      store.closeDialogs()
    } else {
      // fallback: end possession
      store.endPossession(team === "home" ? "home" : "away")
      toast.success("Data saved successfully!")
      store.closeDialogs()
    }
 
    // reset dialog local state
    setResult("")
    setShotType("")
    setShooter("")
    setAssist("")
    setPressure("")
    setPosition(null)
  }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
         <DialogTitle className="flex gap-3 items-center">
                     <span>Shot / Score</span>
                     <span className="flex gap-2">
                       <span className="text-xs font-medium px-2 py-1 rounded bg-muted">{store.clock.period}</span>
                       <span className="font-mono tabular-nums text-sm">{secondsToHHMMSS(store.clock.seconds)}</span>
                     </span>
                   </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Pitch Section */}
          <div className="space-y-3">
            <MiniPitch code={store.code} mode="select" value={position} onChange={setPosition} />
            <div className="text-xs text-muted-foreground">
              Click to set shot XY. Quick keys: G-goal, P-point, W-wide, V-save, B-block, D-drop.
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Metric label="Distance (m)" value={calc.distance_m} />
              <Metric label="Angle (°)" value={calc.angle_deg} />
              <Metric label="Sector" value={calc.sector} />
              {store.code === "football" && <Metric label="Arc" value={calc.arc_status} />}
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-3">
            <SelectGroup label="Team" value={team} onChange={setTeam}>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="away">Away</SelectItem>
            </SelectGroup>

            <SelectGroup label="Result" value={result} onChange={setResult}>
              <SelectItem value="goal">Goal (3)</SelectItem>
              <SelectItem value="point">Point (1)</SelectItem>
              {store.code === "football" && <SelectItem value="two_point">2-Point (Arc)</SelectItem>}
              <SelectItem value="wide">Wide</SelectItem>
              <SelectItem value="saved">Saved</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="dropped_short">Dropped Short</SelectItem>
              <SelectItem value="post">Off Post</SelectItem>
            </SelectGroup>

            <SelectGroup label="Shot Type" value={shotType} onChange={setShotType}>
              <SelectItem value="from_play">Open Play</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value={store.code === "football" ? "45" : "65"}>
                {store.code === "football" ? "45" : "65"}
              </SelectItem>
              <SelectItem value="penalty">Penalty</SelectItem>
              <SelectItem value="sideline">Sideline</SelectItem>
              {store.code === "football" && <SelectItem value="mark">Mark</SelectItem>}
            </SelectGroup>

            {/* Shooter & Assist */}
            <PlayerSelector label="Shooter" value={shooter} onChange={setShooter} open={openShooter} setOpen={setOpenShooter} />
            <PlayerSelector label="Assist" value={assist} onChange={setAssist} open={openAssist} setOpen={setOpenAssist} />

            <SelectGroup label="Pressure" value={pressure} onChange={setPressure}>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="Light">Light</SelectItem>
              <SelectItem value="Heavy">Heavy</SelectItem>
            </SelectGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => store.closeDialogs()}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}) // end ShotDialog

// Helper Components
function Metric({ label, value }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <Badge>{value}</Badge>
    </div>
  )
}

function SelectGroup({ label, value, onChange, children }) {
  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  )
}

function PlayerSelector({ label, value, onChange, open, setOpen }) {
  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="justify-between">
            {value ? players.find((p) => p.value === value)?.label : `Select ${label.toLowerCase()}`}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search player..." className="h-9" />
            <CommandList>
              <CommandEmpty>No player found.</CommandEmpty>
              <CommandGroup>
                {players.map((p) => (
                  <CommandItem
                    key={p.value}
                    onSelect={() => {
                      onChange(p.value === value ? "" : p.value)
                      setOpen(false)
                    }}
                  >
                    {p.label}
                    <Check className={cn("ml-auto", value === p.value ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function ValidationMsg({ text }) {
  return (
    <div className="flex gap-2 items-center">
      <CircleAlert className="text-red-500 h-4 w-4" />
      <span>{text}</span>
    </div>
  )
}
