import { useMemo } from "react"
import { useLive } from "./LiveContext"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { EllipsisVertical, Pencil, Clock  } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Separator } from "../ui/separator"

export function EventFeed() {
  const { state } = useLive()

  const rows = useMemo(() => {
    const sorted = [...state.events].sort((a, b) => {
      const porder = (p) =>
        p === "H1" ? 1 : p === "HT" ? 2 : p === "H2" ? 3 : p === "FT" ? 4 : p === "ET1" ? 5 : 6
      if (porder(a.period) !== porder(b.period)) return porder(a.period) - porder(b.period)
      return a.time_sec - b.time_sec
    })
    return sorted
  }, [state.events])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Feed</CardTitle>
      </CardHeader>
      <CardContent className="h-auto max-h-[45vh] overflow-y-scroll">
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
                  <TableCell className="tabular-nums">{e.period} {e.hhmmss}</TableCell>
                  <TableCell className="capitalize">{"team A"}</TableCell>
                  <TableCell className="uppercase">{e.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code>{e.result} • {"From Play"} </code>
                      {/* Simple inline edit: change a result from wide->point, etc. */}
                      {e.type === "shot" && (
                        <Select
                          onValueChange={()=>{}}
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
                  <TableCell className="capitalize">101</TableCell>
                  <TableCell className="capitalize">
                    <Popover>
                      <PopoverTrigger asChild>
                        <EllipsisVertical className="h-4 w-4 hover:cursor-pointer" />
                      </PopoverTrigger>
                      <PopoverContent className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 hover:cursor-pointer">
                          <Pencil className="h-4 w-4" />
                          <div className="text-sm">Edit time</div>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-3  hover:cursor-pointer">
                          <Clock className="h-4 w-4" />
                          <div className="text-sm">Jump clock to 00:00</div>
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
}

function TypeChip({ event }) {
  const label =
    event.type === "shot"
      ? `Shot • ${event.result}`
      : event.type === "free"
        ? "Free"
        : event.type === "kickout"
          ? "Kick-out"
          : event.type === "puckout"
            ? "Puck-out"
            : event.type === "turnover"
              ? "Turnover"
              : event.type

  return (
    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900">
      {label}
    </span>
  )
}
