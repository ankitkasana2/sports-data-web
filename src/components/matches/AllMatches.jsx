import { useMemo, useState, useEffect } from "react"
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
import { toJS } from "mobx"
import { autorun } from "mobx"

import MatchesFilterBar from "./MatchesFilterBar"
import MatchesTable from "./MatchesTable"


function currentYear() {
  return new Date().getFullYear()
}




// Create Match modal
function CreateMatchDialog({ onCreate }) {

  const { matchesStore, homeFilterbarStore, teamsStore } = useStores()

  useEffect(() => {
    console.log("hello", toJS(teamsStore.teams))
  }, [teamsStore.teams])


  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    date: "",
    time: "",
    teamA: "",
    teamB: "",
    competition: "",
    grade: "",
    season: currentYear(),
    round: "",
    venue: "",
    referee: "",
    status: "scheduled",
    lineupA: "",
    lineupB: "",
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function submit() {
    const id = crypto.randomUUID ? crypto.randomUUID() : `m_${Date.now()}`
    const dateTime =
      form.date && form.time ? new Date(`${form.date}T${form.time}`).toISOString() : new Date().toISOString()

    const newMatch = {
      id,
      dateTime,
      teamA: form.teamA.trim(),
      teamB: form.teamB.trim(),
      competition: form.competition.trim(),
      grade: form.grade.trim(),
      season: form.season.toString(),
      round: form.round.trim(),
      venue: form.venue.trim(),
      referee: form.referee.trim(),
      status: form.status,
      lineupA: form.lineupA
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      lineupB: form.lineupB
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    }

    onCreate(newMatch)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Match</Button>
      </DialogTrigger>
      <DialogContent className="min-w-3xl h-[80vh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Create Match</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="competition">Competition</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a competition" />
              </SelectTrigger>
              <SelectContent>
                {teamsStore.teams && teamsStore.teams.map((team) => { return <SelectItem key={team.team_id} value={team.team_name}>{team.team_name}</SelectItem> })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="round">Round</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Final'>Final</SelectItem> 
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" value={form.date} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="time">Time</Label>
            <Input id="time" name="time" type="time" value={form.time} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="teamB">Team A</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teamsStore.teams && teamsStore.teams.map((team) => { return <SelectItem key={team.team_id} value={team.team_name}>{team.team_name}</SelectItem> })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="teamB">Team B</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teamsStore.teams && teamsStore.teams.map((team) => { return <SelectItem key={team.team_id} value={team.team_name}>{team.team_name}</SelectItem> })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="grade">Grade</Label>
            <Input id="grade" name="grade" value={form.grade} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="season">Season</Label>
            <Input id="season" name="season" value={form.season} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="round">Round</Label>
            <Input id="round" name="round" value={form.round} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="venue">Venue</Label>
            <Input id="venue" name="venue" value={form.venue} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="referee">Referee</Label>
            <Input id="referee" name="referee" value={form.referee} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In-progress</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-1">
            <Label htmlFor="lineupA">Lineup A (one per line)</Label>
            <textarea
              id="lineupA"
              name="lineupA"
              value={form.lineupA}
              onChange={handleChange}
              className="min-h-28 rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-1">
            <Label htmlFor="lineupB">Lineup B (one per line)</Label>
            <textarea
              id="lineupB"
              name="lineupB"
              value={form.lineupB}
              onChange={handleChange}
              className="min-h-28 rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Import CSV modal (basic validation)
function ImportCsvDialog({ onImport }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")

  function parseCsv(text) {
    // Simplified CSV parser: header + comma-separated values (no quoted fields)
    const lines = text.split(/\r?\n/).filter(Boolean)
    if (lines.length < 2) return { error: "No rows found" }
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const required = [
      "id",
      "datetime",
      "teama",
      "teamb",
      "competition",
      "grade",
      "season",
      "round",
      "venue",
      "referee",
      "status",
    ]
    for (const r of required) {
      if (!header.includes(r)) return { error: `Missing column: ${r}` }
    }
    const rows = lines.slice(1).map((l) => {
      const values = l.split(",").map((v) => v.trim())
      const rec = {}
      header.forEach((h, i) => (rec[h] = values[i] ?? ""))
      return {
        id: rec.id || (crypto.randomUUID ? crypto.randomUUID() : `m_${Date.now()}`),
        dateTime: rec.datetime || new Date().toISOString(),
        teamA: rec.teama,
        teamB: rec.teamb,
        competition: rec.competition,
        grade: rec.grade,
        season: rec.season,
        round: rec.round,
        venue: rec.venue,
        referee: rec.referee,
        status: rec.status || "scheduled",
      }
    })
    return { rows }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const { rows, error: err } = parseCsv(text)
    if (err) {
      setError(err)
      return
    }
    setError("")
    onImport(rows)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Import Matches</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Matches from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Expected headers: id, dateTime, teamA, teamB, competition, grade, season, round, venue, referee, status
          </p>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Input type="file" accept=".csv,text/csv" onChange={handleFile} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ActionsBar({ onCreate, onImport }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <CreateMatchDialog onCreate={onCreate} />
        <ImportCsvDialog onImport={onImport} />
      </div>
    </div>
  )
}

// Table with checkbox selection and actions
// function MatchesTable({ rows, selected, setSelected }) {
//   const visibleIds = rows.map((r) => r.id)
//   const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
//   const someSelected = visibleIds.some((id) => selected.has(id)) && !allSelected
//   const headerChecked = allSelected ? true : someSelected ? "indeterminate" : false

//   function toggleSelectAll(nextChecked) {
//     const next = new Set(selected)
//     if (nextChecked) {
//       visibleIds.forEach((id) => next.add(id))
//     } else {
//       visibleIds.forEach((id) => next.delete(id))
//     }
//     setSelected(next)
//   }

//   function toggleRow(id, nextChecked) {
//     const next = new Set(selected)
//     if (nextChecked) next.add(id)
//     else next.delete(id)
//     setSelected(next)
//   }

//   return (
//     <div className="overflow-x-auto">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead className="w-10">
//               <Checkbox
//                 checked={headerChecked}
//                 onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
//                 aria-label="Select all visible matches"
//               />
//             </TableHead>
//             <TableHead>Date & Time</TableHead>
//             <TableHead>Teams (A vs B)</TableHead>
//             <TableHead>Competition & Round</TableHead>
//             <TableHead>Venue</TableHead>
//             <TableHead>Referee</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {rows.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
//                 No matches found.
//               </TableCell>
//             </TableRow>
//           ) : (
//             rows.map((m) => {
//               const isSelected = selected.has(m.id)
//               const isCompleted = m.status === "completed"
//               return (
//                 <TableRow
//                   key={m.id}
//                   className={isCompleted ? "cursor-pointer" : ""}
//                   onClick={() => {
//                     if (isCompleted) {
//                       window.location.href = `/matches/${m.id}`
//                     }
//                   }}
//                 >
//                   <TableCell onClick={(e) => e.stopPropagation()} className="w-10">
//                     <Checkbox
//                       checked={isSelected}
//                       onCheckedChange={(v) => toggleRow(m.id, Boolean(v))}
//                       aria-label={`Select match ${m.id}`}
//                     />
//                   </TableCell>
//                   <TableCell>{formatDateTime(m.dateTime)}</TableCell>
//                   <TableCell>
//                     <span className="font-medium">{m.teamA}</span> <span className="text-muted-foreground">vs</span>{" "}
//                     <span className="font-medium">{m.teamB}</span>
//                   </TableCell>
//                   <TableCell>
//                     <div className="flex flex-col">
//                       <span>{m.competition}</span>
//                       <span className="text-xs text-muted-foreground">{m.round}</span>
//                     </div>
//                   </TableCell>
//                   <TableCell>{m.venue}</TableCell>
//                   <TableCell>{m.referee}</TableCell>
//                   <TableCell className="capitalize">{m.status.replace("-", " ")}</TableCell>
//                   <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
//                     {m.status === "scheduled" || m.status === "in-progress" ? (
//                       <Button asChild size="sm">
//                         <Link to={`/live/${m.id}`}>{m.status === "scheduled" ? "Start" : "Resume"}</Link>
//                       </Button>
//                     ) : (
//                       <span className="text-sm text-muted-foreground">—</span>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               )
//             })
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }

function MatchesPage() {

  const { matchesStore, homeFilterbarStore } = useStores()


  // Data
  const [matches, setMatches] = useState([])

  const [allmatch, setallmatch] = useState([])

  // Filters
  const [search, setSearch] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [competition, setCompetition] = useState("all")
  const [grade, setGrade] = useState("all")
  const [season, setSeason] = useState(currentYear())
  const [team, setTeam] = useState("all")
  const [status, setStatus] = useState("all")

  // Selection
  const [selected, setSelected] = useState(new Set())


  useEffect(() => {
    // 1. Fetch matches from MobX store
    matchesStore.getAllMatchBySeason(new Date().getFullYear());

    // 2. Sync store.matches → local state
    // reaction will run whenever matchesStore.matches changes
    const disposer = autorun(() => {
      setMatches([...matchesStore.matches]);
    });

    // cleanup on unmount
    return () => disposer();
  }, []);


  useEffect(() => {
    console.log(toJS(allmatch))
  }, [allmatch])






  // Derived options
  const competitions = useMemo(() => Array.from(new Set(matches.map((m) => m.competition_name))).sort(), [matches])
  const grades = useMemo(() => Array.from(new Set(matches.map((m) => m.grade))).sort(), [matches])
  const currentYears = new Date().getFullYear();
  const seasons = Array.from({ length: currentYears - 2000 + 1 }, (_, i) => currentYears - i);

  const teams = useMemo(() => Array.from(new Set(matches.flatMap((m) => [m.team_a_id, m.team_b_id]))).sort(), [matches])

  // Filtering
  const filtered = useMemo(() => {
    return matches.filter((m) => {
      const text = `${m.team_a_id} ${m.team_b_id} ${m.competition_name} ${m.venue_name} ${m.referee_name}`.toLowerCase()
      const q = search.trim().toLowerCase()
      if (q && !text.includes(q)) return false

      if (fromDate) {
        const from = new Date(fromDate)
        if (new Date(m.kickoff_datetime) < from) return false
      }
      if (toDate) {
        const to = new Date(toDate)
        to.setHours(23, 59, 59, 999)
        if (new Date(m.kickoff_datetime) > to) return false
      }
      if (competition !== "all" && m.competition_name !== competition) return false
      if (grade !== "all" && m.grade !== grade) return false
      if (season && m.season.toString() !== season.toString()) return false
      if (team !== "all" && !(m.team_a_id === team || m.team_b_id === team)) return false
      if (status !== "all" && m.match_status !== status) return false

      return true
    })
  }, [matches, search, fromDate, toDate, competition, grade, season, team, status])

  function handleCreate(newMatch) {
    setMatches((prev) => [newMatch, ...prev])
  }

  function handleImport(rows) {
    setMatches((prev) => [...rows, ...prev])
  }

  return (
    <section className="space-y-4">
      <section >
        <MatchesFilterBar
          search={search}
          setSearch={setSearch}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          competition={competition}
          setCompetition={setCompetition}
          grade={grade}
          setGrade={setGrade}
          season={season}
          setSeason={setSeason}
          team={team}
          setTeam={setTeam}
          status={status}
          setStatus={setStatus}
          competitions={competitions}
          grades={grades}
          seasons={seasons}
          teams={teams}
        />
      </section>

      <section >
        <ActionsBar matches={matches} setMatches={setMatches} onCreate={handleCreate} onImport={handleImport} />
      </section>

      <section>
        <MatchesTable rows={filtered} selected={selected} setSelected={setSelected} />
      </section>
    </section>
  )
}


export default observer(MatchesPage)