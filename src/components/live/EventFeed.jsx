// import { useMemo } from "react"
// import { secondsToHHMMSS } from "./LiveUtils"
// import { observer } from "mobx-react-lite"
// import { useStores } from "../../stores/StoresProvider"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
// import { EllipsisVertical, Pencil, Clock } from 'lucide-react';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "../ui/popover"
// import { Separator } from "../ui/separator"


// export const EventFeed = observer(function EventFeed() {
//   const { liveMatchStore } = useStores()
//   const store = liveMatchStore

//   const rows = useMemo(() => {
//     const sorted = [...(store.events || [])].sort((a, b) => a.ts - b.ts)
//     return sorted
//   }, [store.events.length])

//   const details = (e) => {
//     if (e.event_type === "throw_in") {
//       return `Throw-in • Won by ${e.throw_in_won_by_team_id}`
//     } else if (e.event_type === 'free') {
//       return `${e.free_type} • ${e.awarded_team_id} • ${e.free_outcome}`
//     } else if (e.event_type === 'card') {
//       return `${e.event_type} • ${e.card_type} • ${e.card_player_id}`
//     } else if (e.event_type === 'note') {
//       return `${e.event_type} • ${'...'}`
//     }
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Event Feed</CardTitle>
//       </CardHeader>
//       <CardContent className="h-auto max-h-[50vh] overflow-y-scroll">
//         <Table>
//           <TableHeader >
//             <TableRow className="sticky top-0">
//               <TableHead>Time</TableHead>
//               <TableHead>Team</TableHead>
//               <TableHead>Type</TableHead>
//               <TableHead>Details</TableHead>
//               <TableHead>Score</TableHead>
//               <TableHead>POS id</TableHead>
//               <TableHead>Tools</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {rows.map((e, idx) => {
//               return (
//                 <TableRow key={e.id}>
//                   <TableCell className="tabular-nums">{e.ts}s</TableCell>
//                   <TableCell className="capitalize">{e.won_team ? e.won_team : e.awarded_team_id ? e.awarded_team_id : '-'}</TableCell>
//                   <TableCell className="uppercase">{e.event_type}</TableCell>
//                   <TableCell>
//                     <div className="flex items-center gap-2 w-full">
//                       <div className="text-green-800">{details(e)}</div>
//                       {/* Simple inline edit: change a result from wide->point, etc. */}
//                       {e.type === "shot" && (
//                         <Select
//                           onValueChange={() => { }}
//                           defaultValue={e.shot_result}
//                         >
//                           <SelectTrigger className="h-8 w-[90px]">
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="goal">Goal</SelectItem>
//                             <SelectItem value="point">Point</SelectItem>
//                             <SelectItem value="wide">Wide</SelectItem>
//                             <SelectItem value="saved">Saved</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       )}
//                     </div>
//                   </TableCell>
//                   <TableCell className="uppercase">{e.shot_result == 'goal' ? '+3' : e.shot_result == 'point' ? '+1' : '0'}</TableCell>
//                   <TableCell className="capitalize">{e.possession_id ? e.possession_id : '—'}</TableCell>
//                   <TableCell className="capitalize">
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <EllipsisVertical className="h-4 w-4 hover:cursor-pointer" />
//                       </PopoverTrigger>
//                       <PopoverContent className="flex flex-col w-[200px] p-0">
//                         <div className="flex items-center gap-3 hover:cursor-pointer hover:bg-gray-100 w-full h-full p-3">
//                           <Pencil className="h-3 w-3" />
//                           <div className="text-xs">Edit time</div>
//                         </div>
//                         <Separator className='' />
//                         <div className="flex items-center gap-3  hover:cursor-pointer p-3 hover:bg-gray-100 w-full h-full">
//                           <Clock className="h-3 w-3" />
//                           <div className="text-xs">Jump clock to 00:00</div>
//                         </div>
//                       </PopoverContent>
//                     </Popover>
//                   </TableCell>
//                 </TableRow>
//               )
//             })}
//             {rows.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
//                   No events yet.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   )
// })

// function TypeChip({ event }) {
//   const t = event.type
//   const label =
//     t === "shot"
//       ? "Shot"
//       : t === "free"
//         ? "Free"
//         : t === "kickout"
//           ? "Kick-out"
//           : t === "puckout"
//             ? "Puck-out"
//             : t === "turnover"
//               ? "Turnover"
//               : t
//   return (
//     <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900">
//       {label}
//     </span>
//   )
// }




import { useMemo, useState } from "react"
import { secondsToHHMMSS } from "./LiveUtils"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { EllipsisVertical, Pencil, Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Separator } from "../ui/separator"
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
export const EventFeed = observer(function EventFeed() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore

  // const { id } = useParams();
  
const location = useLocation();
console.log("URL:", location.pathname);
const segments = location.pathname.split("/");
const id = segments[2]; 

console.log("Extracted ID:", id);

 useEffect(() => {
    store.fetchEvents(id);
  
  }, [id]);

  // 🧭 Filter control
  const [filter, setFilter] = useState("all")

  // 🕓 Sort newest first + apply filter
  const rows = useMemo(() => {
  console.log("useMemo RUNNING")
  const sorted = [...store.events].sort((a, b) => b.ts - a.ts);
  if (filter === "all") return sorted;
  return sorted.filter((e) => e.event_type === filter);

}, [store.events.slice(), filter]);



  // 🎯 Format details based on event type
  const details = (e) => {
    if (e.event_type === "throw_in") {
      return `Throw-in • Won by ${e.throw_in_won_by_team_id}`
    } else if (e.event_type === "free") {
      return `${e.free_type || "Free"} • ${e.awarded_team_id || "-"}`
    } else if (e.event_type === "card") {
      return `${e.card_type || ""} card • ${e.card_player_id || ""}`
    } else if (e.event_type === "note") {
      return `Note • ...`
    } else if (e.event_type === "shot") {
      return `${e.shot_result || "Attempt"}`
    } else if (e.event_type === "turnover") {
      return `Turnover • Won by ${e.won_by_player_id || "?"}`
    }
    return e.event_type
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Event Feed</CardTitle>

        {/* 🧩 Filter + Undo Toolbar */}
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v)}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Filter events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="shot">Shots</SelectItem>
              <SelectItem value="free">Frees</SelectItem>
              <SelectItem value="turnover">Turnovers</SelectItem>
              <SelectItem value="foul">Fouls</SelectItem>
              <SelectItem value="card">Cards</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => store.undo()}>
            Undo Last
          </Button>
        </div>
      </CardHeader>

      <CardContent className="h-auto max-h-[60vh] overflow-y-scroll p-0">
        <Table>
          <TableHeader>
            <TableRow className="sticky top-0 bg-background">
              <TableHead>Time</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Chain / POS ID</TableHead>
              <TableHead>Tools</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((e) => (
              <TableRow
                key={e.id}
                className={`text-sm ${
                  e.event_type === "shot"
                    ? "bg-green-50"
                    : e.event_type === "foul"
                    ? "bg-red-50"
                    : e.event_type === "turnover"
                    ? "bg-yellow-50"
                    : ""
                }`}
              >
                <TableCell className="tabular-nums">{e.period
                  }
                </TableCell>
                
                <TableCell className="capitalize">
                  {e.team_id }
                </TableCell>
                <TableCell>
                  <TypeChip event={e} />
                </TableCell>
                <TableCell>{details(e)}</TableCell>
                <TableCell className="uppercase">
                  {e.shot_result === "goal"
                    ? "+3"
                    : e.shot_result === "point"
                    ? "+1"
                    : "—"}
                </TableCell>
                <TableCell className="capitalize">
                  {e.chain_id || e.possession_id || "—"}
                </TableCell>

                <TableCell className="capitalize">
                  <Popover>
                    <PopoverTrigger asChild>
                      <EllipsisVertical className="h-4 w-4 hover:cursor-pointer" />
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col w-[200px] p-0">
                      <div className="flex items-center gap-3 hover:cursor-pointer hover:bg-gray-100 w-full h-full p-3">
                        <Pencil className="h-3 w-3" />
                        <div className="text-xs">Edit time</div>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3 hover:cursor-pointer hover:bg-gray-100 p-3 w-full h-full">
                        <Clock className="h-3 w-3" />
                        <div className="text-xs">Jump clock to 00:00</div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-sm text-muted-foreground py-4"
                >
                  No events yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
})

function TypeChip({ event }) {
  const t = event.event_type
  const color =
    t === "shot"
      ? "bg-green-100 text-green-800"
      : t === "turnover"
      ? "bg-yellow-100 text-yellow-800"
      : t === "foul"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-700"
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      {t || "event"}
    </span>
  )
}
