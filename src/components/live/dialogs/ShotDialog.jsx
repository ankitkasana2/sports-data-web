import { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { MiniPitch } from "../MiniPitch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Check, ChevronsUpDown } from "lucide-react"
import { Textarea } from "../../ui/textarea"
import { toast } from "sonner"
import { CircleAlert, FileWarning } from 'lucide-react';
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"



const frameworks = [
  {
    value: "player-1",
    label: "Player-1",
  },
  {
    value: "player-2",
    label: "Player-2",
  },
  {
    value: "player-3",
    label: "Player-3",
  },
  {
    value: "player-4",
    label: "Player-4",
  },
]



export const ShotDialog = observer(function ShotDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentShot.open
  const [result, setResult] = useState("")
  const [shotType, setShotType] = useState("open_play")
  const [position, setPosition] = useState(null)
  const [team, setTeam] = useState("home")
  const [shooter, setShooter] = useState('')
  const [openShooter, setOpenShooter] = useState(false)
  const [pressure, setPressure] = useState()
  const [assist, setAssist] = useState('')
  const [openAssist, setOpenAssist] = useState(false)
  const [calculation, setCalculation] = useState({
    shot_distance_m: 'none',
    shot_distance_band: 'none',
    arc_status: 'none',
  })

  useEffect(() => {
    if (!open) return
    const h = (e) => {
      if (e.key.toLowerCase() === "g") setResult("goal")
      if (e.key.toLowerCase() === "p") setResult("point")
      if (e.key.toLowerCase() === "w") setResult("wide")
      if (e.key.toLowerCase() === "v") setResult("saved")
      if (e.key.toLowerCase() === "b") setResult("blocked")
      if (e.key.toLowerCase() === "d") setResult("dropped_short")
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [open])


  // calculation 
  useEffect(() => {
    if (position != null) {

      let distance = 0
      let arc = ''
      if (team == 'home') {
        distance = Math.round(Math.sqrt((position.x - 2) ** 2 + (position.y - 49) ** 2))
        arc = position.x < 30 ? 'inside_40' : position.x >= 30 && position.x <= 32 ? 'on_40' : position.x > 32 ? 'outside_40' : 'none'
      } else {
        distance = Math.round(Math.sqrt((position.x - 95) ** 2 + (position.y - 49) ** 2))
        arc = position.x > 68.5 ? 'inside_40' : position.x <= 68.5 && position.x >= 67.5 ? 'on_40' : position.x < 67.5 ? 'outside_40' : 'none'
      }

      setCalculation(prev => ({
        ...prev,
        shot_distance_m: distance, // or whatever value
        shot_distance_band: distance <= 20 ? '0-20' : distance > 20 && distance <= 35 ? "21-35" : distance > 36 && distance <= 55 ? '36-55' : distance > 55 ? "56+" : 'none',
        arc_status: arc,
      }));

    }

  }, [position, team])


  const onSave = () => {

    if (team == '') {
      toast(<div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>Please select a team.</span>
      </div>)
      return
    } else if (result == '') {
      toast(<div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>Please select result.</span>
      </div>)
      return
    } else if (shotType == '') {
      toast(<div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>Please select shot-type.</span>
      </div>)
      return
    } else if (position == null) {
      toast(<div className="flex gap-2 items-center">
        <CircleAlert className="text-red-500 h-4 w-4" />
        <span>Please select position.</span>
      </div>)
      return
    }

    // Simple alternation for team side demo: home/away
    const shotCount = store.events.filter((e) => e.type === "shot").length
    const team2 = shotCount % 2 === 0 ? "home" : "away"

    // store position
    store.setDialogXY("shot", position)

    // Update scoreboard if point/goal
    if (store.code == 'football') {
      if (result === "goal") store.addScore(team, "goal")
      if (result === "point") store.addScore(team, "point")
    } else {

    }


    // Record the shot event
    store.addEvent({ type: "shot", team2, result, shot_type: shotType, position })




    store.closeDialogs()

    setResult('')
    setShotType('open_play')
    setPosition(null)
    setTeam('home')
    setShooter('')
    setOpenShooter(false)
    setPressure('')
    setAssist('')
    setOpenAssist(false)
    setCalculation({
      shot_distance_m: 'none',
      shot_distance_band: 'none',
      arc_status: 'none',
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Shot</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-3">
            <MiniPitch
              code={store.code}
              mode="select"
              value={position}
              onChange={(xy) => setPosition(xy)}
            />
            <div className="text-xs text-muted-foreground">
              Click pitch to set XY. Quick keys: G goal, P point, W wide, V saved, B blocked, D dropped.
            </div>

            <div className="grid grid-cols-2">
              {/* shot_distance_m   */}
              <div>
                <Label className="text-sm font-medium">Shot_distance_m</Label>
                <Badge>{calculation.shot_distance_m}</Badge>
              </div>

              {/* shot_distance_band   */}
              <div>
                <Label className="text-sm font-medium">Shot_distance_band</Label>
                <Badge>{calculation.shot_distance_band}</Badge>
              </div>

              {/* arcstatus */}
              {store.code == 'football' && <div className="grid gap-1">
                <Label className="text-sm font-medium">Arc status</Label>
                <Badge>{calculation.arc_status}</Badge>
              </div>}
            </div>

          </div>


          <div className="space-y-3 ">
            <div className="flex justify-between">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Team</label>
                <Select value={team} onValueChange={(v) => setTeam(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* result  */}
              <div className="grid gap-1">
                <label className="text-sm font-medium">Result</label>
                <Select value={result} onValueChange={(v) => setResult(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goal">Goal</SelectItem>
                    <SelectItem value="point">Point</SelectItem>
                    <SelectItem value="wide">Wide</SelectItem>
                    <SelectItem value="saved">Saved</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="short">Dropped Short</SelectItem>
                    <SelectItem value="post">Off Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* shot type  */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Shot Type</label>
              <Select value={shotType} onValueChange={(v) => setShotType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open_play">Open Play</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  {<SelectItem value={store.code == 'football' ? '45' : '65'}>{store.code == 'football' ? '45' : '65'}</SelectItem>}
                  <SelectItem value="penalty">Penalty</SelectItem>
                  <SelectItem value="sideline_cut">Sideline</SelectItem>
                  {store.code == 'football' && <SelectItem value="mark_free">Mark free</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              {/* shooter  */}
              <div className="grid gap-1">
                <label className="text-sm font-medium">Shooter</label>
                <Popover open={openShooter} onOpenChange={setOpenShooter}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openShooter}
                      className=" justify-between"
                    >
                      {shooter
                        ? frameworks.find((framework) => framework.value === shooter)?.label
                        : "Select player"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search player..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No player found.</CommandEmpty>
                        <CommandGroup>
                          {frameworks.map((framework) => (
                            <CommandItem
                              key={framework.value}
                              value={framework.value}
                              onSelect={(currentValue) => {
                                setShooter(currentValue === shooter ? "" : currentValue)
                                setOpenShooter(false)
                              }}
                            >
                              {framework.label}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  shooter === framework.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* pressure  */}
              <div className="grid gap-1">
                <label className="text-sm font-medium">Pressure</label>
                <Select value={pressure} onValueChange={(v) => setPressure(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pressure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Light">Light</SelectItem>
                    <SelectItem value="Heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            {/* assist  */}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Assist</label>
              <Popover open={openAssist} onOpenChange={setOpenAssist}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openAssist}
                    className=" justify-between"
                  >
                    {assist
                      ? frameworks.find((framework) => framework.value === assist)?.label
                      : "Select player"}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search player.." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No player found.</CommandEmpty>
                      <CommandGroup>
                        {frameworks.map((framework) => (
                          <CommandItem
                            key={framework.value}
                            value={framework.value}
                            onSelect={(currentValue) => {
                              setAssist(currentValue === assist ? "" : currentValue)
                              setOpenAssist(false)
                            }}
                          >
                            {framework.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                assist === framework.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
    </Dialog >
  )
})
