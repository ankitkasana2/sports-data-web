import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"


function formatDateTime(iso) {
  const d = new Date(iso)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}


function MatchesTable({ rows, selected, setSelected }) {
    const visibleIds = rows.map((r) => r.match_id)
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
    const someSelected = visibleIds.some((id) => selected.has(id)) && !allSelected
    const headerChecked = allSelected ? true : someSelected ? "indeterminate" : false

    function toggleSelectAll(nextChecked) {
        const next = new Set(selected)
        if (nextChecked) {
            visibleIds.forEach((id) => next.add(id))
        } else {
            visibleIds.forEach((id) => next.delete(id))
        }
        setSelected(next)
    }

    function toggleRow(id, nextChecked) {
        const next = new Set(selected)
        if (nextChecked) next.add(id)
        else next.delete(id)
        setSelected(next)
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                            <Checkbox
                                checked={headerChecked}
                                onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                                aria-label="Select all visible matches"
                            />
                        </TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Teams (A vs B)</TableHead>
                        <TableHead>Competition & Round</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Referee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                                No matches found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((m) => {
                            const isSelected = selected.has(m.match_id)
                            const isCompleted = m.match_status === "completed"
                            return (
                                <TableRow
                                    key={m.match_id}
                                    className={isCompleted ? "cursor-pointer" : ""}
                                    onClick={() => {
                                        if (isCompleted) {
                                            window.location.href = `/matches/${m.match_id}`
                                        }
                                    }}
                                >
                                    <TableCell onClick={(e) => e.stopPropagation()} className="w-10">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={(v) => toggleRow(m.match_id, Boolean(v))}
                                            aria-label={`Select match ${m.match_id}`}
                                        />
                                    </TableCell>
                                    <TableCell>{formatDateTime(m.kickoff_datetime)}</TableCell>
                                    <TableCell>
                                        <span className="font-medium">{m.team_a}</span> <span className="text-muted-foreground">vs</span>{" "}
                                        <span className="font-medium">{m.team_b}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{m.competition_name}</span>
                                            <span className="text-xs text-muted-foreground">{m.round_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{m.venue_name}</TableCell>
                                    <TableCell>{m.referee_name}</TableCell>
                                    <TableCell className="capitalize">{m.match_status.replace("-", " ")}</TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        {m.match_status === "Scheduled" || m.match_status === "InProgress" ? (
                                            <Button asChild size="sm">
                                                <Link to={`/live/${m.match_id}`}>{m.match_status == "Scheduled" ? "Start" : "Resume"}</Link>
                                            </Button>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default observer(MatchesTable)