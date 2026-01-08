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
  const [teamA, setTeamA] = useState({
    starter: [],
    bench: [],
  })
  const [teamB, setTeamB] = useState({
    starter: [],
    bench: [],
  })
  const [selectedTeamA, setSelectedTeamA] = useState({
    starter: [],
    bench: []
  });
  const [selectedTeamB, setSelectedTeamB] = useState({
    starter: [],
    bench: []
  });
  const [form, setForm] = useState({
    game_code: "",
    season: currentYear(),
    competition: "",
    round: "",
    venue_name: "",
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

  useEffect(() => {
    console.log("team", teamA)
  }, [teamA])





  const handleTeamA = (val) => {
    setForm((f) => ({ ...f, teamA: val }))

    playersStore.getPlayerByTeam(teamsStore.allTeams.find(team => team.team_name == val).team_id)
    setTeamA({
      starter: toJS(playersStore.players),
      bench: toJS(playersStore.players)
    })
  }

  const handleTeamB = (val) => {
    setForm((f) => ({ ...f, teamB: val }))
    playersStore.getPlayerByTeam(teamsStore.allTeams.find(team => team.team_name == val).team_id)
    setTeamB({
      starter: toJS(playersStore.players),
      bench: toJS(playersStore.players)
    })

  }

  const handleCheckTeamA = (playerId, type, checked) => {
    setTeamA((prev) => {
      // get master list snapshot
      const master = typeof playersStore !== "undefined" ? toJS(playersStore.players) : [];

      // helper to safely find a player object
      const findPlayer = () =>
        master.find((p) => p.player_id === playerId) ||
        prev.starter.find((p) => p.player_id === playerId) ||
        prev.bench.find((p) => p.player_id === playerId);

      if (type === "starter") {

        if (checked) {
          if (selectedTeamA.starter.length <= 15) {
            // remove from bench only
            return {
              ...prev,
              bench: prev.bench.filter((p) => p.player_id !== playerId),
            };
          }
        } else {
          // add back to bench only if we can find the player object
          const playerObj = findPlayer();
          if (!playerObj) {
            console.warn(`Player ${playerId} not found — skipping add back to bench.`);
            return prev;
          }
          // avoid duplicate
          if (prev.bench.some((p) => p.player_id === playerId)) return prev;
          return {
            ...prev,
            bench: [...prev.bench, playerObj],
          };
        }

      }

      if (type === "bench") {
        if (checked) {
          if (selectedTeamA.bench.length <= 11) {
            // remove from starter only
            return {
              ...prev,
              starter: prev.starter.filter((p) => p.player_id !== playerId),
            };
          }
        } else {
          // add back to starter only if we can find the player object
          const playerObj = findPlayer();
          if (!playerObj) {
            console.warn(`Player ${playerId} not found — skipping add back to starter.`);
            return prev;
          }
          if (prev.starter.some((p) => p.player_id === playerId)) return prev;
          return {
            ...prev,
            starter: [...prev.starter, playerObj],
          };
        }
      }

      return prev;
    });


    setSelectedTeamA((prev) => {
      const list = prev[type]; // pick starter or bench

      return {
        ...prev,
        [type]: list.includes(playerId)
          ? list.filter((id) => id !== playerId) // remove if already selected
          : list.length < (type === "starter" ? 15 : 11) // limit example
            ? [...list, playerId] // add if under limit
            : [...list], // keep as is if limit exceeded
      };
    });
  };



  const handleCheckTeamB = (playerId, type, checked) => {

    setTeamB((prev) => {
      // get master list snapshot
      const master = typeof playersStore !== "undefined" ? toJS(playersStore.players) : [];

      // helper to safely find a player object
      const findPlayer = () =>
        master.find((p) => p.player_id === playerId) ||
        prev.starter.find((p) => p.player_id === playerId) ||
        prev.bench.find((p) => p.player_id === playerId);

      if (type === "starter") {

        if (checked) {
          if (selectedTeamB.starter.length <= 15) {
            // remove from bench only
            return {
              ...prev,
              bench: prev.bench.filter((p) => p.player_id !== playerId),
            };
          }
        } else {
          // add back to bench only if we can find the player object
          const playerObj = findPlayer();
          if (!playerObj) {
            console.warn(`Player ${playerId} not found — skipping add back to bench.`);
            return prev;
          }
          // avoid duplicate
          if (prev.bench.some((p) => p.player_id === playerId)) return prev;
          return {
            ...prev,
            bench: [...prev.bench, playerObj],
          };
        }

      }

      if (type === "bench") {
        if (checked) {
          if (selectedTeamB.bench.length <= 11) {
            // remove from starter only
            return {
              ...prev,
              starter: prev.starter.filter((p) => p.player_id !== playerId),
            };
          }
        } else {
          // add back to starter only if we can find the player object
          const playerObj = findPlayer();
          if (!playerObj) {
            console.warn(`Player ${playerId} not found — skipping add back to starter.`);
            return prev;
          }
          if (prev.starter.some((p) => p.player_id === playerId)) return prev;
          return {
            ...prev,
            starter: [...prev.starter, playerObj],
          };
        }
      }

      return prev;
    });



    setSelectedTeamB((prev) => {
      const list = prev[type]; // pick starter or bench

      return {
        ...prev,
        [type]: list.includes(playerId)
          ? list.filter((id) => id !== playerId) // remove if already selected
          : list.length < (type === "starter" ? 15 : 11) // limit example
            ? [...list, playerId] // add if under limit
            : [...list], // keep as is if limit exceeded
      };
    });
  };




  function submit() {
    const id = crypto.randomUUID ? crypto.randomUUID() : `m_${Date.now()}`
    const comp_season_id = matchesStore.allCompetitions.find(comp => comp.name == form.competition && comp.season == form.season).comp_season_id

    let kickoff_datetime = null

    if (form.date && form.time) {
      const dt = new Date(`${form.date}T${form.time}`)
      if (!isNaN(dt)) {
        kickoff_datetime = dt.toISOString()
      } else {
        console.error("Invalid date/time:", form.date, form.time)
      }
    } else {
      console.error("Date or time missing:", form.date, form.time)
    }

    console.log('seb')



    // ===================== DEBUG LOGS ======================


console.log("form.venue_name:", form.venue_name);
console.log("form.venue_type:", form.surface_type );


// ===================== FIND OPERATIONS ======================
console.log("============== FIND RESULTS ==============");

const venueObj = matchesStore.allVenues.find(
  v => v.venue_name === form.venue_name && v.surface_type === form.surface_type
);




console.log("venueObj:", venueObj);
const refereeObj = refereesStore.allRefrees.find(
  r => r.name === form.referee
);

const teamAObj = teamsStore.allTeams.find(
  t => t.team_name === form.teamA
);

const teamBObj = teamsStore.allTeams.find(
  t => t.team_name === form.teamB
);

// ===================== FINAL MATCH OBJECT ======================
const newMatch = {
  match_id: id,                  // Laravel expects match_id
  round_id: form.round,          // use your round value
  comp_season_id: comp_season_id,
  group_stage_id: form.group_stage_id ?? null,  

  round_name: form.round,
  round_code: form.round,        // same as round (Laravel expects this)

  season: form.season,
  kickoff_datetime,              // already created timestamp
  match_status: "scheduled",

  venue_id: form.venue_id,
  referee_id: refereeObj?.referee_id ?? null,

  game_code: form.game_code,
  grade: form.grade,

  ruleset: form.ruleset ?? "default", // Laravel requires ruleset field

  half_length_sec: Number(form.half_length || 0),
  et_half_length_sec: Number(form.et_length || 0),

  extra_time_possible: form.extra_time ? 1 : 0,
  penalty_shootout_possible: form.penalty_shootout_flag ? 1 : 0,
  neutral_flag: form.neutral_flag ? 1 : 0,

  team_a_id: teamAObj?.team_id ?? null,
  team_b_id: teamBObj?.team_id ?? null,

  video_source: form.videoSrc,
};

console.log("============== FINAL newMatch OBJECT ==============");
console.log(newMatch);

matchesStore.createMatch(newMatch);
setOpen(false);
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
         <Select
  value={form.venue_id}
  onValueChange={(val) => setForm((f) => ({ ...f, venue_id: val }))}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select a venue" />
  </SelectTrigger>

  <SelectContent>
    {matchesStore.allVenues.map(v => (
      <SelectItem key={v.venue_id} value={v.venue_id}>
        {v.venue_name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


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
                {teamsStore.allTeams &&
                  teamsStore.allTeams
                    .filter((team) => team.active_flag === "active" && team.team_name !== form.teamB) // exclude Team B
                    .map((team) => (
                      <SelectItem key={team.team_id} value={team.team_name}>
                        {team.team_name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          {/* team B  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="teamB">Team B</Label>
            <Select value={form.teamB} onValueChange={handleTeamB}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teamsStore.allTeams &&
                  teamsStore.allTeams
                    .filter((team) => team.team_name !== form.teamA) // exclude Team A
                    .map((team) => (
                      <SelectItem key={team.team_id} value={team.team_name}>
                        {team.team_name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          {/* linup A  */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="teamALineup">Lineup A</Label>
            <div className=" h-auto rounded-md border">
              <div className="px-4 pt-1 text-sm flex justify-between"><span>Players</span><span>{selectedTeamA.starter.length + selectedTeamA.bench.length}</span></div>
              <div className="p-4 pt-3 grid grid-cols-2 gap-2">
                <ScrollArea className="max-h-[30vh] h-auto rounded-md border p-3">
                  <div className="flex flex-col gap-3">
                    <div className="text-sm flex justify-between sticky top-0 bg-background"><span>Starter</span><span>{selectedTeamA.starter.length}</span></div>
                    {teamA.starter?.map(player => (<div className="flex items-center gap-3">
                      <Checkbox
                        id={player.display_name}
                        checked={selectedTeamA.starter.includes(player.player_id)}
                        onCheckedChange={(checked) => handleCheckTeamA(player.player_id, 'starter', checked)} // ✅ toggle state
                      />
                      <div className="flex w-full justify-between">
                        <Label htmlFor={player.display_name}>{player.display_name}</Label>
                        <Label htmlFor={player.display_name}>{player.preferred_position}</Label>
                      </div>
                    </div>))}
                  </div>
                </ScrollArea>

                <ScrollArea className="max-h-[30vh] h-auto rounded-md border p-3">
                  <div className="flex flex-col gap-3">
                    <div className="text-sm flex justify-between sticky top-0 bg-background"><span>Bench</span><span>{selectedTeamA.bench.length}</span></div>
                    {teamA.bench?.map(player => (<div className="flex items-center gap-3">
                      <Checkbox
                        id={player.display_name}
                        checked={selectedTeamA.bench.includes(player.player_id)}
                        onCheckedChange={(checked) => handleCheckTeamA(player.player_id, 'bench', checked)} // ✅ toggle state
                      />
                      <div className="flex w-full justify-between">
                        <Label htmlFor={player.display_name}>{player.display_name}</Label>
                        <Label htmlFor={player.display_name}>{player.preferred_position}</Label>
                      </div>
                    </div>))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
          {/* linup B  */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="teamALineup">Lineup B</Label>
            <div className=" h-auto rounded-md border">
              <div className="px-4 pt-1 text-sm flex justify-between"><span>Players</span><span>{selectedTeamB.starter.length + selectedTeamB.bench.length}</span></div>
              <div className="p-4 pt-3 grid grid-cols-2 gap-2">
                <ScrollArea className="max-h-[30vh] h-auto rounded-md border p-3">
                  <div className="flex flex-col gap-3">
                    <div className="text-sm flex justify-between sticky top-0 bg-background"><span>Starter</span><span>{selectedTeamB.starter.length}</span></div>
                    {teamB.starter?.map(player => (<div className="flex items-center gap-3">
                      <Checkbox
                        id={player.display_name}
                        checked={selectedTeamB.starter.includes(player.player_id)}
                        onCheckedChange={(checked) => handleCheckTeamB(player.player_id, 'starter', checked)} // ✅ toggle state
                      />
                      <div className="flex w-full justify-between">
                        <Label htmlFor={player.display_name}>{player.display_name}</Label>
                        <Label htmlFor={player.display_name}>{player.preferred_position}</Label>
                      </div>
                    </div>))}
                  </div>
                </ScrollArea>

                <ScrollArea className="max-h-[30vh] h-auto rounded-md border p-3">
                  <div className="flex flex-col gap-3">
                    <div className="text-sm flex justify-between sticky top-0 bg-background"><span>Bench</span><span>{selectedTeamB.bench.length}</span></div>
                    {teamB.bench?.map(player => (<div className="flex items-center gap-3">
                      <Checkbox
                        id={player.display_name}
                        checked={selectedTeamB.bench.includes(player.player_id)}
                        onCheckedChange={(checked) => handleCheckTeamB(player.player_id, 'bench', checked)} // ✅ toggle state
                      />
                      <div className="flex w-full justify-between">
                        <Label htmlFor={player.display_name}>{player.display_name}</Label>
                        <Label htmlFor={player.display_name}>{player.preferred_position}</Label>
                      </div>
                    </div>))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
          {/* referee  */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="teamB">Referee Name</Label>
            <Select value={form.referee} onValueChange={(val) => setForm((f) => ({ ...f, referee: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a referee" />
              </SelectTrigger>
              <SelectContent>
                {refereesStore.allRefrees && refereesStore.allRefrees.map((referee) => { return referee.active_flag == 'active' && <SelectItem key={referee.referee_id} value={referee.name}>{referee.name}</SelectItem> })}
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
  <Label htmlFor="et-length">Extra Time Half Length (In minute)</Label>
  <Input
    id="et-length"
    name="et_length"
    type="number"
    value={form.et_length}
    onChange={handleChange}
    placeholder="Enter ET half length"
  />
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


  // useEffect(() => {
  //   // 1. Fetch matches from MobX store
  //   matchesStore.getAllMatchBySeason(new Date().getFullYear());

  //   // 2. Sync store.matches → local state
  //   // reaction will run whenever matchesStore.matches changes
  //   const disposer = autorun(() => {
  //     setMatches([...matchesStore.matches]);
  //   });

  //   // cleanup on unmount
  //   return () => disposer();
  // }, []);

  useEffect(() => {
    if (!season) return
    matchesStore.getAllMatchBySeason(season)

    const disposer = autorun(() => {
      setMatches([...matchesStore.matches]);
    });

    // cleanup on unmount
    return () => disposer();

  }, [season])




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