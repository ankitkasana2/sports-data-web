// import { useState, useEffect } from "react"
// import { Button } from "../../ui/button"
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
// import { MiniPitch } from "../MiniPitch"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
// import { Switch } from "../../ui/switch"
// import { Label } from "../../ui/label"
// import { observer } from "mobx-react-lite"
// import { useStores } from "../../../stores/StoresProvider"
// import { secondsToHHMMSS } from "../LiveUtils"
// import { Badge } from "@/components/ui/badge"
// import { toJS } from "mobx"


// export const FreeDialog = observer(function FreeDialog() {
//   const { liveMatchStore } = useStores()
//   const store = liveMatchStore
//   const open = !!store.ui.currentFree.open
//   const xy = store.ui.currentFree.xy ?? null

//   const [awardedTeam, setAwardedTeam] = useState("home")
//   const [awardedPlayer, setAwardedPlayer] = useState('')
//   const [foulingPlayer, setFoulingPlayer] = useState("")
//   const [foulCategory, setFoulCategory] = useState('')
//   const [is50, setIs50] = useState(false)
//   const [nextAction, setNextAction] = useState('')
//   const [position, setPosition] = useState(null)
//   const [calculation, setCalculation] = useState({
//     free_distance_m: 'none',
//     free_distance_band: 'none',
//     lane_sector: 'none',
//     arc_status: 'none',
//   })





//   useEffect(() => {
//     if (position != null) {

//       let distance = 0
//       let arc = ''
//       if (awardedTeam == 'home') {
//         distance = Math.round(Math.sqrt((position.x - 2) ** 2 + (position.y - 49) ** 2))
//         arc = position.x < 30 ? 'inside_40' : position.x >= 30 && position.x <= 32 ? 'on_40' : position.x > 32 ? 'outside_40' : 'none'
//       } else {
//         distance = Math.round(Math.sqrt((position.x - 95) ** 2 + (position.y - 49) ** 2))
//         arc = position.x > 68.5 ? 'inside_40' : position.x <= 68.5 && position.x >= 67.5 ? 'on_40' : position.x < 67.5 ? 'outside_40' : 'none'
//       }

//       setCalculation(prev => ({
//         ...prev,
//         free_distance_m: distance, // or whatever value
//         free_distance_band: distance < 15 ? 'Very close' : distance >= 15 && distance <= 25 ? "Mid range" : distance >= 26 && distance <= 39 ? 'Long range' : distance > 39 ? "Very long range" : 'none',
//         lane_sector: Math.round(position.x == 50) ? 'Centre' : Math.round(position.x < 50) ? 'Left' : 'Right',
//         arc_status: arc
//       }));

//     }

//   }, [position])


//   // handle 50m advance 
//   const handle50m = () => {
//     setIs50(prev => {
//       const newIs50 = !prev;

//       if (newIs50) {  // this runs with the correct new value
//         if (awardedTeam === 'home') {
//           setPosition({ x: 3, y: 49 });
//         } else {
//           setPosition({ x: 97, y: 49 })
//         }
//       }

//       return newIs50;
//     });
//   }




//   const onSave = () => {
//     store.addEvent({ type: "free", team: awardedTeam, })

//     // store position 
//     store.setDialogXY("free", position)

//     store.closeDialogs()
//   }

//   return (
//     <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
//       <DialogContent className="sm:max-w-2xl">
//         <DialogHeader>
//           <DialogTitle className='flex gap-3 items-center'>
//             <span>Free -</span>
//             <span className="flex gap-2">
//               <span className="text-xs font-medium px-2 py-1 rounded bg-muted">{store.clock.period}</span>
//               <span className="font-mono tabular-nums text-sm">{secondsToHHMMSS(store.clock.seconds)}</span>
//             </span>
//           </DialogTitle>
//         </DialogHeader>

//         <div className="grid gap-3 sm:grid-cols-2">
//           <div className="space-y-3">
//             <MiniPitch
//               code={store.code}
//               mode="select"
//               value={position}
//               onChange={(xy) => (setPosition(xy), setIs50(false))}
//             />
//             <div className="text-xs text-muted-foreground">Click pitch to set XY.</div>

//             <div className="grid grid-cols-2">
//               {/* free_distance_m   */}
//               <div>
//                 <Label className="text-sm font-medium">Free_distance_m</Label>
//                 <Badge>{calculation.free_distance_m}</Badge>
//               </div>

//               {/* free_distance_band   */}
//               <div>
//                 <Label className="text-sm font-medium">Free_distance_band</Label>
//                 <Badge>{calculation.free_distance_band}</Badge>
//               </div>

//               {/* lane sector   */}
//               <div>
//                 <Label className="text-sm font-medium">Lane sector</Label>
//                 <Badge>{calculation.lane_sector}</Badge>
//               </div>

//               {/* arc_status  */}
//               {store.code == 'football' && <div className="grid gap-1">
//                 <Label className="text-sm font-medium">Arc Status</Label>
//                 <Badge>{calculation.arc_status}</Badge>
//               </div>}
//             </div>
//           </div>

//           <div className="space-y-3">
//             <div className="grid gap-1">
//               <label className="text-sm font-medium">Awarded to</label>
//               <Select value={awardedTeam} onValueChange={(v) => setAwardedTeam(v)}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="home">Home</SelectItem>
//                   <SelectItem value="away">Away</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* fouls category  */}
//             <div className="grid gap-1">
//               <label className="text-sm font-medium">Foul Categories</label>
//               <Select value={foulCategory} onValueChange={(v) => setFoulCategory(v)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder='Select a foul categories' />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Dissent">Dissent</SelectItem>
//                   <SelectItem value="Not_retreating_13m">Not_retreating_13m</SelectItem>
//                   <SelectItem value="Throwing_ball_away">Throwing_ball_away</SelectItem>
//                   <SelectItem value="Tactical_delay">Tactical_delay</SelectItem>
//                   <SelectItem value="Melee">Melee</SelectItem>
//                   <SelectItem value="Head_high_contact">Head_high_contact</SelectItem>
//                   <SelectItem value="Cynical_hold_up">Cynical_hold_up</SelectItem>
//                   <SelectItem value="Technical">Technical</SelectItem>
//                   <SelectItem value="Structure_breach">Structure_breach (4-back/3-up)</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>


//             {store.code === "football" && (
//               <>
//                 <div className="flex items-center justify-between rounded-md border p-2">
//                   <Label htmlFor="is50">50m Advance</Label>
//                   <Switch id="is50" checked={is50} onCheckedChange={handle50m} />
//                 </div>
//               </>
//             )}

//             {/* foul won player  */}
//             <div className="grid gap-1">
//               <label className="text-sm font-medium">Foul Won By</label>
//               <Select value={awardedPlayer} onValueChange={(v) => setAwardedPlayer(v)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder='Select player' />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="home">Home</SelectItem>
//                   <SelectItem value="away">Away</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* fouling player  */}
//             <div className="grid gap-1">
//               <label className="text-sm font-medium">Fouling Player</label>
//               <Select value={foulingPlayer} onValueChange={(v) => setFoulingPlayer(v)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder='Select layer' />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="home">Home</SelectItem>
//                   <SelectItem value="away">Away</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* next action  */}
//             <div className="grid gap-1">
//               <label className="text-sm font-medium">Next Action</label>
//               <Select value={nextAction} onValueChange={(v) => setNextAction(v)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder='Select next action' />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {store.code == 'football' && <SelectItem value="solo&go">Solo & Go</SelectItem>}
//                   <SelectItem value="place_Kick">Place kick</SelectItem>
//                   <SelectItem value="play_short">Play short</SelectItem>
//                   <SelectItem value="turnover">Turnover</SelectItem>
//                   <SelectItem value="advantage">Advantage</SelectItem>
//                 </SelectContent>
//               </Select>
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
//     </Dialog>
//   )
// })


import { useState, useEffect } from "react"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { MiniPitch } from "../MiniPitch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Switch } from "../../ui/switch"
import { Label } from "../../ui/label"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../stores/StoresProvider"
import { secondsToHHMMSS } from "../LiveUtils"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export const FreeDialog = observer(function FreeDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentFree.open
  const xy = store.ui.currentFree.xy ?? null

  const [awardedTeam, setAwardedTeam] = useState("home")
  const [awardedPlayer, setAwardedPlayer] = useState("")
  const [foulingPlayer, setFoulingPlayer] = useState("")
  const [foulCategory, setFoulCategory] = useState("")
  const [is50, setIs50] = useState(false)
  const [nextAction, setNextAction] = useState("")
  const [position, setPosition] = useState(null)
  const [calculation, setCalculation] = useState({
    free_distance_m: "none",
    free_distance_band: "none",
    lane_sector: "none",
    arc_status: "none",
  })

  // ⚙️ Auto-calc distance, band, arc
  useEffect(() => {
    if (position) {
      let distance = 0
      let arc = "none"
      const arcThreshold = store.code === "football" ? 40 : 0

      if (awardedTeam === "home") {
        distance = Math.round(Math.sqrt((position.x - 2) ** 2 + (position.y - 49) ** 2))
        arc =
          position.x < 30
            ? "inside_40"
            : position.x >= 30 && position.x <= 32
              ? "on_40"
              : position.x > 32
                ? "outside_40"
                : "none"
      } else {
        distance = Math.round(Math.sqrt((position.x - 95) ** 2 + (position.y - 49) ** 2))
        arc =
          position.x > 68.5
            ? "inside_40"
            : position.x <= 68.5 && position.x >= 67.5
              ? "on_40"
              : position.x < 67.5
                ? "outside_40"
                : "none"
      }

      // band calc
      let band = "none"
      if (distance <= 20) band = "0–20"
      else if (distance <= 35) band = "21–35"
      else if (distance <= 55) band = "36–55"
      else band = "56+"

      const lane = position.x < 45 ? "L" : position.x > 55 ? "R" : "C"

      setCalculation({
        free_distance_m: distance,
        free_distance_band: band,
        lane_sector: lane,
        arc_status: arc,
      })
    }
  }, [position, awardedTeam])

  // ⚙️ Handle 50m advance toggle
  const handle50m = () => {
    setIs50((prev) => {
      const newVal = !prev
      if (newVal) {
        if (awardedTeam === "home") setPosition({ x: 3, y: 49 })
        else setPosition({ x: 97, y: 49 })
      }
      return newVal
    })
  }

  const onSave = async () => {
    try {
      if (!awardedTeam || !awardedPlayer) {
        toast.error("Please select the awarded team and player.")
        return
      }
      if (!position) {
        toast.error("Please select a pitch position.")
        return
      }

      const evt = {
        event_type: "free",
        awarded_team_id: awardedTeam,
        team_id:awardedTeam,
        awarded_player_id: awardedPlayer,
        fouling_player_id: foulingPlayer || null,
        foul_category: foulCategory || null,
        ts: store.clock.seconds,
        period: store.clock.period,
        free_type:
    nextAction === "place_kick" ? "place" :
    nextAction === "play_short" ? "short" :
    nextAction === "solo_go" ? "solo_go" :
    nextAction === "turnover" ? "turnover" :
    nextAction === "advantage" ? "advantage" :
    null,
        xy: position,
        free_distance_m: calculation.free_distance_m,
        free_distance_band: calculation.free_distance_band,
        lane: calculation.lane_sector,
        arc_status: calculation.arc_status,
        is_50m_advance: is50,
        next_action: nextAction || null,
        two_point_option:
          store.code === "football" &&
          is50 &&
          (calculation.arc_status === "on_40" || calculation.arc_status === "inside_40"),

     
      }

      await store.addEvent(evt)
      store.setDialogXY("free", position)
      toast.success("Data saved successfully!")
      store.closeDialogs()
    } catch (error) {
      toast.error("Failed to save event")
      console.error(error)
    }

  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex gap-3 items-center">
            <span>Free / Placed Ball</span>
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
              onChange={(xy) => (setPosition(xy), setIs50(false))}
            />
            <div className="text-xs text-muted-foreground">Click pitch to set XY.</div>

            <div className="grid grid-cols-2 gap-2">
              <Metric label="Distance (m)" value={calculation.free_distance_m} />
              <Metric label="Band" value={calculation.free_distance_band} />
              <Metric label="Lane" value={calculation.lane_sector} />
              {store.code === "football" && <Metric label="Arc Status" value={calculation.arc_status} />}
            </div>
          </div>

          <div className="space-y-3">
            <SelectGroup label="Awarded to" value={awardedTeam} onChange={setAwardedTeam}>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="away">Away</SelectItem>
            </SelectGroup>

            <SelectGroup label="Foul Category" value={foulCategory} onChange={setFoulCategory}>
              <SelectItem value="Dissent">Dissent</SelectItem>
              <SelectItem value="Not_retreating_13m">Not Retreating 13m</SelectItem>
              <SelectItem value="Throwing_ball_away">Throwing Ball Away</SelectItem>
              <SelectItem value="Tactical_delay">Tactical Delay</SelectItem>
              <SelectItem value="Melee">Melee</SelectItem>
              <SelectItem value="Head_high_contact">Head/High Contact</SelectItem>
              <SelectItem value="Cynical_hold_up">Cynical Hold-up</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Structure_breach">Structure Breach (4-back/3-up)</SelectItem>
            </SelectGroup>

            {store.code === "football" && (
              <div className="flex items-center justify-between rounded-md border p-2">
                <Label htmlFor="is50">50m Advance</Label>
                <Switch id="is50" checked={is50} onCheckedChange={handle50m} />
              </div>
            )}

            <SelectGroup label="Foul Won By" value={awardedPlayer} onChange={setAwardedPlayer}>
              <SelectItem value="player1">Player 1</SelectItem>
              <SelectItem value="player2">Player 2</SelectItem>
            </SelectGroup>

            <SelectGroup label="Fouling Player" value={foulingPlayer} onChange={setFoulingPlayer}>
              <SelectItem value="player3">Player 3</SelectItem>
              <SelectItem value="player4">Player 4</SelectItem>
            </SelectGroup>

            <SelectGroup label="Next Action" value={nextAction} onChange={setNextAction}>
              {store.code === "football" && <SelectItem value="solo_go">Solo & Go</SelectItem>}
              <SelectItem value="place_kick">Place Kick</SelectItem>
              <SelectItem value="play_short">Play Short</SelectItem>
              <SelectItem value="turnover">Turnover</SelectItem>
              <SelectItem value="advantage">Advantage</SelectItem>
            </SelectGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => store.closeDialogs()}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

// 🔹 Small UI helpers
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
