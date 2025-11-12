// import { useState } from "react"
// import { observer } from "mobx-react-lite"
// import { useStores } from "../../../stores/StoresProvider"
// import { Button } from "../../ui/button"
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Label } from "@/components/ui/label"
// import { Badge } from "@/components/ui/badge"

// export const KickoutOrPuckoutDialog = observer(function KickoutOrPuckoutDialog() {
//   const { liveMatchStore } = useStores()
//   const store = liveMatchStore
//   const open = !!store.ui.currentKickoutOrPuckout.open

//   const [length, setLength] = useState("short")
//   const [executingTeam, setExecutingTeam] = useState("home")
//   const [outcome, setOutcome] = useState('')
//   const [line, setLine] = useState('')
//   const [side, setSide] = useState('')
//   const [wonTeam, setWonTeam] = useState('Home')
//   const [winnerPlayer, setWinnerPlayer] = useState('')
//   const [mark, setMark] = useState('none')
//   const [retained, setRetained] = useState('false')


//   // handle preset 
//   const handlePreset = (val) => {
//     switch (val) {
//       case 1:
//         setWonTeam(executingTeam)
//         setRetained('true')
//         setOutcome('clean')
//         break;

//       case 2:
//         setOutcome('from_break')
//         setWonTeam(executingTeam)
//         setRetained('true')
//         break;

//       case 3:
//         setOutcome('clean')
//         setWonTeam(executingTeam)
//         setRetained('false')
//         break;

//       case 4:
//         setOutcome('from_break')
//         setWonTeam(executingTeam)
//         setRetained('false')
//         break;


//       default:
//         break;
//     }
//   }

//   const onSave = () => {
//     const type = 

//     // store event 
//     store.addEvent({
//       type: 'restart',
//       start_cause : 'restart',
//       start_restart_type : store.code === "football" ? "kickout" : "puckout",
      
//     })


//     store.closeDialogs()
//   }

//   return (
//     <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>{store.code === "football" ? "Kick-out" : "Puck-out"}</DialogTitle>
//         </DialogHeader>

//         <div className="grid grid-cols-2 gap-4">
//           {/* preset tiles  */}
//           <div className="grid grid-cols-2 gap-2 col-span-2">
//             <Button variant={'secondary'} className='cursor-pointer' onClick={() => handlePreset(1)} size={'sm'}>Clean Own (1)</Button>
//             <Button variant={'secondary'} className='cursor-pointer' onClick={() => handlePreset(2)} size={'sm'}>Break Own (2)</Button>
//             <Button variant={'secondary'} className='cursor-pointer' onClick={() => handlePreset(3)} size={'sm'}>Clean Opp (3)</Button>
//             <Button variant={'secondary'} className='cursor-pointer' onClick={() => handlePreset(4)} size={'sm'}>Break Opp (4)</Button>
//           </div>

//           {/* team  */}
//           <div className="grid gap-1">
//             <label className="text-sm font-medium">Taking team</label>
//             <Select value={executingTeam} onValueChange={(v) => (setExecutingTeam(v), v==wonTeam?setRetained('true'):setRetained('false'))}>
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="home">Home</SelectItem>
//                 <SelectItem value="away">Away</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* outcome  */}
//           <div className="grid gap-1">
//             <label className="text-sm font-medium">Outcome</label>
//             <Select value={outcome} onValueChange={(v) => setOutcome(v)}>
//               <SelectTrigger>
//                 <SelectValue placeholder='Select outcome' />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="clean">clean</SelectItem>
//                 <SelectItem value="from_break">from_break</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* length  */}
//           <div className="grid gap-1 col-span-2">
//             <RadioGroup
//               value={length}
//               onValueChange={setLength}
//               className="flex space-x-2"
//             >
//               <div className="flex items-center">
//                 <RadioGroupItem value="short" id="short" className="sr-only" />
//                 <label
//                   htmlFor="short"
//                   className={`px-3 py-1 rounded-md border text-sm cursor-pointer ${length === "short"
//                     ? "bg-primary text-white"
//                     : "bg-white text-gray-700 "
//                     }`}
//                 >
//                   Short
//                 </label>
//               </div>

//               <div className="flex items-center">
//                 <RadioGroupItem value="medium" id="medium" className="sr-only" />
//                 <label
//                   htmlFor="medium"
//                   className={`px-3 py-1 rounded-md border text-sm cursor-pointer ${length === "medium"
//                     ? "bg-primary text-white"
//                     : "bg-white text-gray-700 "
//                     }`}
//                 >
//                   Medium
//                 </label>
//               </div>

//               <div className="flex items-center">
//                 <RadioGroupItem value="long" id="long" className="sr-only" />
//                 <label
//                   htmlFor="long"
//                   className={`px-3 py-1 rounded-md border text-sm cursor-pointer ${length === "long"
//                     ? "bg-primary text-white"
//                     : "bg-white text-gray-700 "
//                     }`}
//                 >
//                   Long
//                 </label>
//               </div>
//             </RadioGroup>
//           </div>

//           {/* Destination */}
//           <div className="grid grid-cols-2 gap-1 col-span-2">
//             {/* side  */}
//             <div className="grid gap-1">
//               <label className="text-sm font-medium">Side</label>
//               <Select value={side} onValueChange={(v) => setSide(v)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder='Select outcome' />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="clean">clean</SelectItem>
//                   <SelectItem value="from_break">from_break</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* line  */}
//             <div className="grid gap-1">
//               <label className="text-sm font-medium">Line</label>
//               <Select value={line} onValueChange={(v) => setLine(v)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder='Select outcome' />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="FB">FB</SelectItem>
//                   <SelectItem value="HB">HB</SelectItem>
//                   <SelectItem value="MF">MF</SelectItem>
//                   <SelectItem value="HF">HF</SelectItem>
//                   <SelectItem value="FF">FF</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* won by  */}
//           <div className="grid gap-1">
//             <label className="text-sm font-medium">Won By</label>
//             <Select value={wonTeam} onValueChange={(v) => (setWonTeam(v), v==executingTeam?setRetained('true'):setRetained('false'))}>
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="home">Home</SelectItem>
//                 <SelectItem value="away">Away</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* winner  */}
//           <div className="grid gap-1">
//             <label className="text-sm font-medium">Winner</label>
//             <Select value={winnerPlayer} onValueChange={(v) => setWinnerPlayer(v)}>
//               <SelectTrigger>
//                 <SelectValue placeholder='Select a player' />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="player1">Player1</SelectItem>
//                 <SelectItem value="player2">Player2</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* 40m crossed  */}
//           {store.code == 'football' && <div className="flex flex-col gap-2">
//             <div className="flex items-center gap-3">
//               <Checkbox id="terms" />
//               <Label htmlFor="terms">Crossed 40m?</Label>
//             </div>
//             <div>
//               <Label>Retained</Label>
//               <Badge>{retained}</Badge>
//             </div>
//           </div>}

//           <div className="grid gap-1">
//             <label className="text-sm font-medium">Mark</label>
//             <Select value={mark} onValueChange={(v) => setMark(v)}>
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="none">None</SelectItem>
//                 <SelectItem value="free">Free</SelectItem>
//                 <SelectItem value="play_on">Play on</SelectItem>
//               </SelectContent>
//             </Select>
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

export const KickoutOrPuckoutDialog = observer(function KickoutOrPuckoutDialog() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore
  const open = !!store.ui.currentKickoutOrPuckout.open

  const [length, setLength] = useState("short")
  const [executingTeam, setExecutingTeam] = useState("home")
  const [outcome, setOutcome] = useState('')
  const [line, setLine] = useState('')
  const [side, setSide] = useState('')
  const [wonTeam, setWonTeam] = useState('Home')
  const [winnerPlayer, setWinnerPlayer] = useState('')
  const [mark, setMark] = useState('none')
  const [retained, setRetained] = useState('false')


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

  const onSave = () => {
    const type = 

    // store event 
    store.addEvent({
      type: 'restart',
      start_cause : 'restart',
      start_restart_type : store.code === "football" ? "kickout" : "puckout",
      
    })


    store.closeDialogs()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && store.closeDialogs()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{store.code === "football" ? "Kick-out" : "Puck-out"}</DialogTitle>
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
            <label className="text-sm font-medium">Taking team</label>
            <Select value={executingTeam} onValueChange={(v) => (setExecutingTeam(v), v==wonTeam?setRetained('true'):setRetained('false'))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="away">Away</SelectItem>
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
            <label className="text-sm font-medium">Won By</label>
            <Select value={wonTeam} onValueChange={(v) => (setWonTeam(v), v==executingTeam?setRetained('true'):setRetained('false'))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="away">Away</SelectItem>
              </SelectContent>
            </Select>
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
              <Checkbox id="terms" />
              <Label htmlFor="terms">Crossed 40m?</Label>
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
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
