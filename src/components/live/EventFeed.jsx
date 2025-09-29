import { useMemo } from "react"
import { secondsToHHMMSS } from "./LiveUtils"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { EllipsisVertical, Pencil, Clock } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Separator } from "../ui/separator"


export const EventFeed = observer(function EventFeed() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore

  const rows = useMemo(() => {
    const sorted = [...(store.events || [])].sort((a, b) => a.ts - b.ts)
    return sorted
  }, [store.events.length])

  const details = (e) => {
    if (e.type === "throw_in") {
      return `Throw-in • Won by ${e.won_team}`
    } else if (e.type === 'free') {
      return `${e.free_type} • ${e.won_team} • ${e.free_outcome}`
    } else if (e.type === 'card') {
      return `${e.type} • ${e.card_type} • ${e.card_player_id}`
    } else if (e.type === 'note') {
      return `${e.type} • ${e.note_text} `
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Feed</CardTitle>
      </CardHeader>
      <CardContent className="h-auto max-h-[50vh] overflow-y-scroll">
        <Table>
          <TableHeader >
            <TableRow className="sticky top-0">
              <TableHead>Time</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>POS id</TableHead>
              <TableHead>Tools</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e, idx) => {
              return (
                <TableRow key={e.id}>
                  <TableCell className="tabular-nums">{secondsToHHMMSS(store.clock.seconds)}</TableCell>
                  <TableCell className="capitalize">{e.won_team ? e.won_team : '—'}</TableCell>
                  <TableCell className="uppercase">{e.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 w-full">
                      <div className="text-green-800">{details(e)}</div>
                      {/* Simple inline edit: change a result from wide->point, etc. */}
                      {e.type === "shot" && (
                        <Select
                          onValueChange={() => { }}
                          defaultValue={e.result}
                        >
                          <SelectTrigger className="h-8 w-[90px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="goal">Goal</SelectItem>
                            <SelectItem value="point">Point</SelectItem>
                            <SelectItem value="wide">Wide</SelectItem>
                            <SelectItem value="saved">Saved</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="uppercase">{e.type == "shot" ? "+1" : "0"}</TableCell>
                  <TableCell className="capitalize">{e.possession_id ? e.possession_id : '—'}</TableCell>
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
                        <Separator className='' />
                        <div className="flex items-center gap-3  hover:cursor-pointer p-3 hover:bg-gray-100 w-full h-full">
                          <Clock className="h-3 w-3" />
                          <div className="text-xs">Jump clock to 00:00</div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              )
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
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
  const t = event.type
  const label =
    t === "shot"
      ? "Shot"
      : t === "free"
        ? "Free"
        : t === "kickout"
          ? "Kick-out"
          : t === "puckout"
            ? "Puck-out"
            : t === "turnover"
              ? "Turnover"
              : t
  return (
    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900">
      {label}
    </span>
  )
}
