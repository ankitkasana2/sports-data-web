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
import { set, toJS } from "mobx"
import { autorun } from "mobx"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"

import MatchesFilterBar from "./MatchesFilterBar"
import MatchesTable from "./MatchesTable"


function currentYear() {
  return new Date().getFullYear()
}




// Create Match modal
function CreateMatchDialog({ onCreate }) {

  const { matchesStore, homeFilterbarStore, teamsStore, refereesStore, playersStore } = useStores()


  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [teamA, setTeamA] = useState([])
  const [teamB, setTeamB] = useState([])
  const [selectedTeamA, setSelectedTeamA] = useState([]);
  const [selectedTeamB, setSelectedTeamB] = useState([]);
  const [form, setForm] = useState({
    game_code: "",
    season: currentYear(),
    competition: "",
    round: "",
    venue_name: "",
    venue_type: "",
    date: "",
    time: "",
    teamA: "",
    teamB: "",
    referee: "",
    grade: "",
    half_length: "",
    videoSrc: "",
    neutral_flag: false,
    penalty_shootout_flag: false,
    extra_time: false,
    et_length: "",
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  useEffect(() => {
    console.log("form", form)
  }, [form])




  const handleTeamA = (val) => {
    setForm((f) => ({ ...f, teamA: val }))

    playersStore.getPlayerByTeam(teamsStore.allTeams.find(team => team.team_name == val).team_id)
    setTeamA(toJS(playersStore.players))
  }

  const handleTeamB = (val) => {
    setForm((f) => ({ ...f, teamB: val }))
    playersStore.getPlayerByTeam(teamsStore.allTeams.find(team => team.team_name == val).team_id)
    setTeamB(toJS(playersStore.players))
  }

  const handleCheckTeamA = (playerId) => {
    setSelectedTeamA((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId) // remove if already selected
        : setSelectedTeamA.length < 26 ? [...prev, playerId] : [...prev]                 // add if not selected
    );
  };


  const handleCheckTeamB = (playerId) => {
    setSelectedTeamB((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId) // remove if already selected
        : selectedTeamB.length < 26 ? [...prev, playerId] : [...prev]                  // add if not selected
    );
  };




  function submit() {
    // const id = crypto.randomUUID ? crypto.randomUUID() : `m_${Date.now()}`
    // const comp_season_id = ""

    // const newMatch = {
    //   id,
    //   comp_season_id,

      
   
    // }

    // matchesStore.createMatch(newMatch)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => { matchesStore.getAllCompetition(), teamsStore.getAllTeams(), refereesStore.getReferees() }}>Add Match</Button>
      </DialogTrigger>
      <DialogContent className="min-w-3xl h-[80vh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Create Match</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* code  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="game_code">Game Code</Label>
            <Select id='game_code' value={form.game_code} onValueChange={(val) => setForm((f) => ({ ...f, game_code: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select game code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='hurling'>Hurling</SelectItem>
                <SelectItem value='football'>Football</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* season  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="season">Season</Label>
            <Input id="season" name="season" value={form.season} disabled />
          </div>
          {/* competition  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="competition">Competition</Label>
            <Select value={form.competition} onValueChange={(val) => setForm((f) => ({ ...f, competition: val }))}  >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a competition" />
              </SelectTrigger>
              <SelectContent>
                {matchesStore.allCompetitions && matchesStore.allCompetitions.map((comp) => { return <SelectItem key={comp.id} value={comp.name}>{comp.name}</SelectItem> })}
              </SelectContent>
            </Select>
          </div>
          {/* round  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="round">Round</Label>
            <Select value={form.round} onValueChange={(val) => setForm((f) => ({ ...f, round: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='final'>Final</SelectItem>
                <SelectItem value='semi-final'>Semi Final</SelectItem>
                <SelectItem value='quarter-final'>Quarter Final</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* venue name  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="round">Venue Name</Label>
            <Select value={form.venue_name} onValueChange={(val) => setForm((f) => ({ ...f, venue_name: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a venue" />
              </SelectTrigger>
              <SelectContent>
                {matchesStore.allVenues && matchesStore.allVenues.map((venue) => { return <SelectItem key={venue.venue_id} value={venue.venue_name}>{venue.venue_name}</SelectItem> })}
              </SelectContent>
            </Select>
          </div>
          {/* venue type  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="round">Venue Type</Label>
            <Select value={form.venue_type} onValueChange={(val) => setForm((f) => ({ ...f, venue_type: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select venue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='grass'>Grass</SelectItem>
                <SelectItem value='artificial'>Artificial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* date  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" value={form.date} onChange={handleChange} />
          </div>
          {/* time  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="time">Time</Label>
            <Input id="time" name="time" type="time" value={form.time} onChange={handleChange} />
          </div>
          {/* team A  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="teamA">Team A</Label>
            <Select value={form.teamA} onValueChange={handleTeamA}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teamsStore.allTeams && teamsStore.allTeams.map((team) => { return team.active_flag == 'Y' && <SelectItem key={team.team_id} value={team.team_name}>{team.team_name}</SelectItem> })}
              </SelectContent>
            </Select>
          </div>
          {/* team b  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="teamB">Team B</Label>
            <Select value={form.teamB} onValueChange={handleTeamB}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teamsStore.allTeams && teamsStore.allTeams.map((team) => { return <SelectItem key={team.team_id} value={team.team_name}>{team.team_name}</SelectItem> })}
              </SelectContent>
            </Select>
          </div>
          {/* linup A  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="teamALineup">Lineup A</Label>
            <ScrollArea className="max-h-[30vh] h-auto rounded-md border">
              <div className="px-4 pt-2 text-sm top-0 sticky bg-background flex justify-between"><span>Players</span><span>{selectedTeamA.length}</span></div>
              <div className="p-4 pt-3 flex gap-3 flex-col ">
                {teamA?.map(player => (<div className="flex items-center gap-4">
                  <Checkbox
                    id={player.display_name}
                    checked={selectedTeamA.includes(player.player_id)}
                    onCheckedChange={() => handleCheckTeamA(player.player_id)} // ✅ toggle state
                  />
                  <Label htmlFor={player.display_name}>{player.display_name}</Label>
                </div>))}
              </div>
            </ScrollArea>
          </div>
          {/* linup B  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="teamBLineup">Lineup B</Label>
            <ScrollArea className="max-h-[30vh] h-auto rounded-md border">
              <div className="px-4 pt-2 text-sm top-0 sticky bg-background flex justify-between"><span>Players</span><span>{selectedTeamB.length}</span></div>
              <div className="p-4 pt-3 flex gap-3 flex-col ">
                {teamB?.map(player => (<div className="flex items-center gap-4">
                  <Checkbox
                    id={player.display_name}
                    checked={selectedTeamB.includes(player.player_id)}
                    onCheckedChange={() => handleCheckTeamB(player.player_id)} // ✅ toggle state
                  />
                  <Label htmlFor={player.display_name}>{player.display_name}</Label>
                </div>))}
              </div>
            </ScrollArea>
          </div>
          {/* referee  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="teamB">Referee Name</Label>
            <Select value={form.referee} onValueChange={(val) => setForm((f) => ({ ...f, referee: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a referee" />
              </SelectTrigger>
              <SelectContent>
                {refereesStore.allRefrees && refereesStore.allRefrees.map((referee) => { return referee.active_flag == 'Y' && <SelectItem key={referee.referee_id} value={referee.name}>{referee.name}</SelectItem> })}
              </SelectContent>
            </Select>
          </div>
          {/* grade  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="grade">Grade</Label>
            <Select value={form.grade} onValueChange={(val) => setForm((f) => ({ ...f, grade: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='senior'>Senior</SelectItem>
                <SelectItem value='intermediate'>Intermediate</SelectItem>
                <SelectItem value='junior'>Junior</SelectItem>
                <SelectItem value='minor'>Minor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* half-length  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="half-length">Half length (In minute)</Label>
            <Input id="half-length" name="half_length" value={form.half_length} onChange={handleChange} placeholder="Enter half length" />
          </div>
          {/* video source  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="video">Video Source</Label>
            <Input id="video" name="videoSrc" placeholder='Enter a video source' value={form.videoSrc} onChange={handleChange} />
          </div>
          {/* neutral  */}
          <div className="flex flex-col gap-2 justify-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="neutral"
                checked={form.neutral_flag}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, neutral_flag: checked }))
                }
              />
              <Label htmlFor="neutral">Neutral Flag</Label>
            </div>
          </div>
          {/* penalty shootout  */}
          <div className="flex flex-col gap-2 justify-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="penalty"
                checked={form.penalty_shootout_flag}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, penalty_shootout_flag: checked }))
                }
              />
              <Label htmlFor="penalty">Penalty Shootout</Label>
            </div>
          </div>
          {/* extra time  */}
          <div className="flex flex-col gap-2 justify-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="extra-time"
                checked={form.extra_time}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, extra_time: checked }))
                } />
              <Label htmlFor="extra-time">Extra Time</Label>
            </div>
            {form.extra_time == true && <div className="flex flex-col gap-2">
              <Label htmlFor="et-length">Extra Time Length (In minute)</Label>
              <Input id="et-length" name="et_length" value={form.et_length} onChange={handleChange} placeholder="Enter extra time length" />
            </div>}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={''}>Create</Button>
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