// import { useState, useEffect } from "react"
// import { observer } from "mobx-react-lite"
// import { useStores } from "../../../stores/StoresProvider"
// import { Button } from "../../ui/button"
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
// import { MiniPitch } from "../MiniPitch"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Label } from "@/components/ui/label"
// import { Check, ChevronsUpDown } from "lucide-react"
// import { Textarea } from "../../ui/textarea"
// import { toast } from "sonner"
// import { CircleAlert, FileWarning } from 'lucide-react';
// import { Maximize2, Minimize2 } from "lucide-react";

// import { cn } from "@/lib/utils"
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"



// const frameworks = [
//   {
//     value: "player-1",
//     label: "Player-1",
//   },
//   {
//     value: "player-2",
//     label: "Player-2",
//   },
//   {
//     value: "player-3",
//     label: "Player-3",
//   },
//   {
//     value: "player-4",
//     label: "Player-4",
//   },
// ]



// export const ShotDialog = observer(function ShotDialog() {
//   const { liveMatchStore } = useStores()
//   const store = liveMatchStore
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const open = !!store.ui.currentShot.open
//   const [result, setResult] = useState("")
//   const [shotType, setShotType] = useState("")
//   const [position, setPosition] = useState(null)
//   const [team, setTeam] = useState("home")
//   const [shooter, setShooter] = useState('')
//   const [openShooter, setOpenShooter] = useState(false)
//   const [pressure, setPressure] = useState()
//   const [assist, setAssist] = useState('')
//   const [openAssist, setOpenAssist] = useState(false)
//   const [calculation, setCalculation] = useState({
//     shot_distance_m: 'none',
//     shot_distance_band: 'none',
//     arc_status: 'none',
//   })

//   useEffect(() => {
//     if (!open) return

//     if (store.ui.currentShot.shotType) {
//       setShotType(store.ui.currentShot.shotType)
//     }

//     const h = (e) => {
//       if (e.key.toLowerCase() === "g") setResult("goal")
//       if (e.key.toLowerCase() === "p") setResult("point")
//       if (e.key.toLowerCase() === "w") setResult("wide")
//       if (e.key.toLowerCase() === "v") setResult("saved")
//       if (e.key.toLowerCase() === "b") setResult("blocked")
//       if (e.key.toLowerCase() === "d") setResult("dropped_short")
//     }
//     window.addEventListener("keydown", h)
//     return () => window.removeEventListener("keydown", h)
//   }, [open])


//   // calculation 
//   useEffect(() => {
//     if (position != null) {

//       let distance = 0
//       let arc = ''
//       if (team == 'home') {
//         distance = Math.round(Math.sqrt((position.x - 2) ** 2 + (position.y - 49) ** 2))
//         arc = position.x < 30 ? 'inside_40' : position.x >= 30 && position.x <= 32 ? 'on_40' : position.x > 32 ? 'outside_40' : 'none'
//       } else {
//         distance = Math.round(Math.sqrt((position.x - 95) ** 2 + (position.y - 49) ** 2))
//         arc = position.x > 68.5 ? 'inside_40' : position.x <= 68.5 && position.x >= 67.5 ? 'on_40' : position.x < 67.5 ? 'outside_40' : 'none'
//       }

//       setCalculation(prev => ({
//         ...prev,
//         shot_distance_m: distance, // or whatever value
//         shot_distance_band: distance <= 20 ? '0-20' : distance > 20 && distance <= 35 ? "21-35" : distance > 36 && distance <= 55 ? '36-55' : distance > 55 ? "56+" : 'none',
//         arc_status: arc,
//       }));

//     }

//   }, [position, team])


//   const onSave = () => {

//     if (team == '') {
//       toast(<div className="flex gap-2 items-center">
//         <CircleAlert className="text-red-500 h-4 w-4" />
//         <span>Please select a team.</span>
//       </div>)
//       return
//     } else if (result == '') {
//       toast(<div className="flex gap-2 items-center">
//         <CircleAlert className="text-red-500 h-4 w-4" />
//         <span>Please select result.</span>
//       </div>)
//       return
//     } else if (shotType == '') {
//       toast(<div className="flex gap-2 items-center">
//         <CircleAlert className="text-red-500 h-4 w-4" />
//         <span>Please select shot-type.</span>
//       </div>)
//       return
//     } else if (position == null) {
//       toast(<div className="flex gap-2 items-center">
//         <CircleAlert className="text-red-500 h-4 w-4" />
//         <span>Please select position.</span>
//       </div>)
//       return
//     }


//     // store position
//     store.setDialogXY("shot", position)

//     // Update scoreboard if point/goal
//     if (store.code == 'football') {
//       if (result === "goal") store.addScore(team, "goal")
//       else if (result === "point") {
//         if (['from_play', 'free', 'mark'].includes(shotType) && (calculation.arc_status === 'on_40' || calculation.arc_status == 'outside_40')) {
//           store.addScore(team, "two_point")
//         } else {
//           store.addScore(team, "point")
//         }
//       }

//     } else {
//       if (result === "goal") store.addScore(team, "goal")
//       else if (result === "point") store.addScore(team, "point")
//     }


//     // Record the shot event
//     store.addEvent({ type: "shot", won_team: team, shot_result: result, shot_type: shotType, position })

//     store.closeDialogs()

//     setResult('')
//     setShotType('')
//     setPosition(null)
//     setTeam('home')
//     setShooter('')
//     setOpenShooter(false)
//     setPressure('')
//     setAssist('')
//     setOpenAssist(false)
//     setCalculation({
//       shot_distance_m: 'none',
//       shot_distance_band: 'none',
//       arc_status: 'none',
//     })
//   }

//   return (
//     <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
//       <DialogContent className="sm:max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>Shot</DialogTitle>
//         </DialogHeader>

//         <div className="grid gap-3 sm:grid-cols-2">
//           <div className="space-y-3">
//             <div className="relative">
//               <MiniPitch
//                 code={store.code}
//                 mode="select"
//                 value={position}
//                 onChange={(xy) => setPosition(xy)}
//                 isFullScreen={isFullScreen}
//                 className={`${isFullScreen ? "fullscreen-pitch" : "normal-pitch"}`}
//               />

             
//             </div>
//             <div className="text-xs text-muted-foreground">
//               Click pitch to set XY. Quick keys: G goal, P point, W wide, V saved, B blocked, D dropped.
//             </div>

//             <div className="grid grid-cols-2">
//               {/* shot_distance_m   */}
//               <div>
//                 <Label className="text-sm font-medium">Shot_distance_m</Label>
//                 <Badge>{calculation.shot_distance_m}</Badge>
//               </div>

//               {/* shot_distance_band   */}
//               <div>
//                 <Label className="text-sm font-medium">Shot_distance_band</Label>
//                 <Badge>{calculation.shot_distance_band}</Badge>
//               </div>

//               {/* arcstatus */}
//               {store.code == 'football' && <div className="grid gap-1">
//                 <Label className="text-sm font-medium">Arc status</Label>
//                 <Badge>{calculation.arc_status}</Badge>
//               </div>}
//             </div>

//           </div>


//           <div className="space-y-3 ">
//             <div className="flex justify-between">
//               <div className="grid gap-1">
//                 <label className="text-sm font-medium">Team</label>
//                 <Select value={team} onValueChange={(v) => setTeam(v)}>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="home">Home</SelectItem>
//                     <SelectItem value="away">Away</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* result  */}
//               <div className="grid gap-1">
//                 <label className="text-sm font-medium">Result</label>
//                 <Select value={result} onValueChange={(v) => setResult(v)}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select result" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="goal">Goal</SelectItem>
//                     <SelectItem value="point">Point</SelectItem>
//                     <SelectItem value="wide">Wide</SelectItem>
//                     <SelectItem value="saved">Saved</SelectItem>
//                     <SelectItem value="blocked">Blocked</SelectItem>
//                     <SelectItem value="short">Dropped Short</SelectItem>
//                     <SelectItem value="post">Off Post</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* shot type  */}
//             <div className="grid gap-1">
//               <label className="text-sm font-medium">Shot Type</label>
//               <Select value={shotType} onValueChange={(v) => setShotType(v)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select shot type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="from_play">Open Play</SelectItem>
//                   <SelectItem value="free">Free</SelectItem>
//                   {<SelectItem value={store.code == 'football' ? '45' : '65'}>{store.code == 'football' ? '45' : '65'}</SelectItem>}
//                   <SelectItem value="penalty">Penalty</SelectItem>
//                   <SelectItem value="sideline">Sideline</SelectItem>
//                   {store.code == 'football' && <SelectItem value="mark">Mark</SelectItem>}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex justify-between">
//               {/* shooter  */}
//               <div className="grid gap-1">
//                 <label className="text-sm font-medium">Shooter</label>
//                 <Popover open={openShooter} onOpenChange={setOpenShooter}>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       role="combobox"
//                       aria-expanded={openShooter}
//                       className=" justify-between"
//                     >
//                       {shooter
//                         ? frameworks.find((framework) => framework.value === shooter)?.label
//                         : "Select player"}
//                       <ChevronsUpDown className="opacity-50" />
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-[200px] p-0">
//                     <Command>
//                       <CommandInput placeholder="Search player..." className="h-9" />
//                       <CommandList>
//                         <CommandEmpty>No player found.</CommandEmpty>
//                         <CommandGroup>
//                           {frameworks.map((framework) => (
//                             <CommandItem
//                               key={framework.value}
//                               value={framework.value}
//                               onSelect={(currentValue) => {
//                                 setShooter(currentValue === shooter ? "" : currentValue)
//                                 setOpenShooter(false)
//                               }}
//                             >
//                               {framework.label}
//                               <Check
//                                 className={cn(
//                                   "ml-auto",
//                                   shooter === framework.value ? "opacity-100" : "opacity-0"
//                                 )}
//                               />
//                             </CommandItem>
//                           ))}
//                         </CommandGroup>
//                       </CommandList>
//                     </Command>
//                   </PopoverContent>
//                 </Popover>
//               </div>

//               {/* pressure  */}
//               <div className="grid gap-1">
//                 <label className="text-sm font-medium">Pressure</label>
//                 <Select value={pressure} onValueChange={(v) => setPressure(v)}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select pressure" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="None">None</SelectItem>
//                     <SelectItem value="Light">Light</SelectItem>
//                     <SelectItem value="Heavy">Heavy</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>


//             {/* assist  */}
//             <div className="grid gap-1">
//               <label className="text-sm font-medium">Assist</label>
//               <Popover open={openAssist} onOpenChange={setOpenAssist}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     role="combobox"
//                     aria-expanded={openAssist}
//                     className=" justify-between"
//                   >
//                     {assist
//                       ? frameworks.find((framework) => framework.value === assist)?.label
//                       : "Select player"}
//                     <ChevronsUpDown className="opacity-50" />
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-[200px] p-0">
//                   <Command>
//                     <CommandInput placeholder="Search player.." className="h-9" />
//                     <CommandList>
//                       <CommandEmpty>No player found.</CommandEmpty>
//                       <CommandGroup>
//                         {frameworks.map((framework) => (
//                           <CommandItem
//                             key={framework.value}
//                             value={framework.value}
//                             onSelect={(currentValue) => {
//                               setAssist(currentValue === assist ? "" : currentValue)
//                               setOpenAssist(false)
//                             }}
//                           >
//                             {framework.label}
//                             <Check
//                               className={cn(
//                                 "ml-auto",
//                                 assist === framework.value ? "opacity-100" : "opacity-0"
//                               )}
//                             />
//                           </CommandItem>
//                         ))}
//                       </CommandGroup>
//                     </CommandList>
//                   </Command>
//                 </PopoverContent>
//               </Popover>
//             </div>

//           </div>
//         </div>

//         <DialogFooter>
//           <Button onClick={() => store.closeDialogs()} variant="outline">
//             Cancel
//           </Button>
//           <Button onClick={onSave}>Save</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog >
//   )
// })


import { useState, useEffect } from "react"
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

  // 🧮 Auto-calc distance, angle, sector, arc
  useEffect(() => {
    if (!position) return

    const goal = team === "home" ? { x: 100, y: 50 } : { x: 0, y: 50 }
    const dx = goal.x - position.x
    const dy = goal.y - position.y
    const distance = Math.round(Math.sqrt(dx * dx + dy * dy))
    const angle = Math.round(Math.atan2(Math.abs(dy), Math.abs(dx)) * (180 / Math.PI))

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

    const sector = dy < -10 ? "L" : dy > 10 ? "R" : "C"

    setCalc({
      distance_m: distance,
      distance_band: band,
      angle_deg: angle,
      sector,
      arc_status: arc,
    })
  }, [position, team, store.code])

  // 🎯 Keyboard quick keys
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

  const onSave = () => {
    if (!team || !result || !shotType || !shooter || !position) {
      toast(<ValidationMsg text="Please fill all required fields (team, shooter, result, position)." />)
      return
    }

    // 🧾 Event object
    const evt = {
      event_type: "shot",
      team,
      shooter_player_id: shooter,
      assist_player_id: assist || null,
      shot_type: shotType,
      shot_result: result,
      pressure: pressure || "None",
      ts: store.clock.seconds,
      period: store.clock.period,
      xy: position,
      distance_m: calc.distance_m,
      distance_band: calc.distance_band,
      angle_deg: calc.angle_deg,
      sector: calc.sector,
      arc_status: calc.arc_status,
      points_awarded:
        result === "goal"
          ? 3
          : store.code === "football" &&
            result === "point" &&
            (shotType === "from_play" || shotType === "free" || shotType === "mark") &&
            (calc.arc_status === "on_40" || calc.arc_status === "outside_40")
          ? 2
          : result === "point"
          ? 1
          : 0,
    }

    // 🧠 Update scoreboard
    if (evt.points_awarded > 0) store.addScore(team, evt.points_awarded === 3 ? "goal" : evt.points_awarded === 2 ? "two_point" : "point")

    store.addEvent(evt)
    store.setDialogXY("shot", position)
    store.closeDialogs()

    // Reset
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
          <DialogTitle>Shot / Score</DialogTitle>
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
})

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
