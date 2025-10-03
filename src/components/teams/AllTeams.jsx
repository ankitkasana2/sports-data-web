import { useMemo, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"
import { set, toJS } from "mobx"
import { autorun } from "mobx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { nanoid } from 'nanoid';
import { toast } from "sonner"
import { Check, Ban } from 'lucide-react';




// --- Helpers: CSV parsing and generation (simple; does not handle quoted commas) ---
function parseCSV(text) {
  const rows = text.replace(/\r/g, "").split("\n").filter(Boolean)
  if (rows.length === 0) return []
  const headers = rows[0].split(",").map((h) => h.trim())
  return rows.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = cols[i] ?? ""
    })
    return obj
  })
}

function generateCSV(teams) {
  const headers = ["name", "code", "season", "active", "playerCount", "matchesPlayedThisSeason"]
  const lines = [
    headers.join(","),
    ...teams.map((t) =>
      [
        t.name,
        t.code,
        String(t.season),
        t.active ? "true" : "false",
        String(t.playerCount),
        String(t.matchesPlayedThisSeason),
      ].join(","),
    ),
  ]
  return lines.join("\n")
}

function normalizeBool(v) {
  const s = String(v ?? "")
    .toLowerCase()
    .trim()
  return s === "true" || s === "yes" || s === "1"
}

function validateTeamRecord(rec) {
  const errors = []

  const id = `TEAM_${nanoid(6)}`;

  const name = (rec.name || "").trim()
  if (!name) errors.push("Missing name")

  const code = (rec.code || "").trim()
  if (!["Hurling", "Football"].includes(code)) {
    errors.push("Code must be 'Hurling' or 'Football'")
  }

  return {
    ok: errors.length === 0,
    errors,
    team: errors.length
      ? null
      : {
        id,
        name,
        code,
      },
  }
}

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_SEASONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 2 + i)


function TeamsPage() {

  const { matchesStore, homeFilterbarStore, teamsStore } = useStores()
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])

  


  // fetching team 
  useEffect(() => {

    // 1. Fetch teams from MobX store
    teamsStore.getAllTeams();

    const disposer = autorun(() => {
      const players = toJS(teamsStore.allTeams);

      // Group by team_id
      const grouped = players.reduce((acc, player) => {
        const { team_id, team_name, code, active_flag } = player;
        if (!acc[team_id]) {
          acc[team_id] = {
            team_id,
            team_name,
            count: 0,
            players: [],
            code,
            active_flag,
          };
        }
        acc[team_id].count++;
        acc[team_id].players.push(player);
        return acc;
      }, {});

      // Convert object -> array
      setTeams(players);
    });

    // cleanup on unmount
    return () => disposer();
  }, []);




  // UI state: search + filters
  const [search, setSearch] = useState("")
  const [codeFilter, setCodeFilter] = useState("all") // "", "Hurling", "Football"
  const [seasonFilter, setSeasonFilter] = useState(String(CURRENT_YEAR)) // default current
  const [activeFilter, setActiveFilter] = useState("all") // "", "active", "inactive"

  // Dialog states
  const [openAdd, setOpenAdd] = useState(false)
  const [openImport, setOpenImport] = useState(false)

  // Add form state
  const [addForm, setAddForm] = useState({
    name: "",
    code: "Hurling",
  })


  // Selection state and helpers for table checkboxes
  const [selectedIds, setSelectedIds] = useState(new Set())
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchesSearch = !search || t.team_name.toLowerCase().includes(search.trim().toLowerCase())

      const matchesCode = codeFilter === "all" || t.code === codeFilter
      const matchesActive = activeFilter === "all" || (activeFilter === "active" ? t.active_flag == 'active' : t.active_flag == 'inactive')

      return matchesSearch && matchesCode && matchesActive
    })
  }, [teams, search, codeFilter, seasonFilter, activeFilter])

  const filteredIds = useMemo(() => filteredTeams.map((t) => t.team_id), [filteredTeams])

  const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id))
  const someSelected = filteredIds.some((id) => selectedIds.has(id)) && !allSelected

  function toggleSelectAll(nextChecked) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (nextChecked) {
        filteredIds.forEach((id) => next.add(id))
      } else {
        filteredIds.forEach((id) => next.delete(id))
      }
      return next
    })
  }

  function toggleOne(id, nextChecked) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (nextChecked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  async function handleAddTeam(e) {
    e.preventDefault()

    const rec = {
      name: addForm.name,
      code: addForm.code,
    }
    const { ok, errors, team } = validateTeamRecord(rec)
    if (!ok || !team) {
      return
    }

    const created = await teamsStore.createTeam(team);

    if (created) {
      toast(<div className="flex gap-3">
        <Check className="text-green-800" /><span>Team has been created Successfully.</span>
      </div>)
      setOpenAdd(false)
      navigate(0);
    } else {
      toast(<div className="flex gap-3">
        <Ban className="text-red-700" /><span>Team not created.</span>
      </div>)
    }


    setAddForm({
      name: "",
      code: "Hurling",
    })
  }

  async function handleImportCSV(file) {
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (!rows.length) {
        alert("CSV empty") // Simple alert for empty CSV
        return
      }
      const results = rows.map(validateTeamRecord)
      const okRecs = results.filter((r) => r.ok && r.team).map((r) => r.team)
      const badRecs = results.filter((r) => !r.ok)

      setTeams((prev) => [...okRecs, ...prev])

      if (badRecs.length) {
        alert(`Import finished with errors: Imported ${okRecs.length}, ${badRecs.length} failed`) // Simple alert for import errors
      } else {
        alert(`Import successful: Imported ${okRecs.length} teams`) // Simple alert for successful import
      }
    } catch (err) {
      alert(`Import failed: ${String(err)}`) // Simple alert for import failure
    } finally {
      setOpenImport(false)
    }
  }

  function handleExportCSV() {
    const csv = generateCSV(filteredTeams)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `teams-export-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div className="flex items-center gap-2">
          {/* Add Team */}
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button>Add Team</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Team</DialogTitle>
                <DialogDescription>Create a new team record.</DialogDescription>
              </DialogHeader>

              <form className="grid gap-4" onSubmit={handleAddTeam}>
                <div className="grid gap-2">
                  <Label htmlFor="name">Team name</Label>
                  <Input
                    id="name"
                    value={addForm.name}
                    onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Ballymore"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Code</Label>
                  <Select value={addForm.code} onValueChange={(v) => setAddForm((f) => ({ ...f, code: v }))}>
                    <SelectTrigger aria-label="Code">
                      <SelectValue placeholder="Select code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hurling">Hurling</SelectItem>
                      <SelectItem value="Football">Football</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="gap-2">
                  <Button type="button" variant="secondary" onClick={() => setOpenAdd(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Import Teams */}
          <Dialog open={openImport} onOpenChange={setOpenImport}>
            <DialogTrigger asChild>
              <Button variant="outline">Import CSV</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Import Teams</DialogTitle>
                <DialogDescription>
                  CSV headers: name, code, season, active, playerCount, matchesPlayedThisSeason
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  aria-label="Upload teams CSV"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImportCSV(file)
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Example row: Ballymore,Hurling,${CURRENT_YEAR},true,28,12
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setOpenImport(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Export Teams */}
          <Button variant="outline" onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>
      </header>

      {/* Filters */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className=" col-span-1 md:col-span-2">
          <Label htmlFor="search" className="sr-only">
            Search teams
          </Label>
          <Input
            id="search"
            placeholder="Search teams by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <Label className="sr-only">Code</Label>
          <Select value={codeFilter} onValueChange={setCodeFilter}>
            <SelectTrigger aria-label="Filter by code">
              <SelectValue placeholder="All codes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All codes</SelectItem>
              <SelectItem value="hurling">Hurling</SelectItem>
              <SelectItem value="football">Football</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="sr-only">Season</Label>
          <Select value={seasonFilter} onValueChange={setSeasonFilter}>
            <SelectTrigger aria-label="Filter by season">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_SEASONS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="sr-only">Active status</Label>
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger aria-label="Filter by active status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Table: requested columns only */}
      <section className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-orange-50/50">
              {/* Header checkbox for select-all (current filtered page) */}
              <TableHead className="w-10">
                <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <Checkbox
                    aria-label="Select all teams on page"
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                  />
                </div>
              </TableHead>
              <TableHead>Team name</TableHead>
              <TableHead className="text-left">Code</TableHead>
              <TableHead className="text-left">Players</TableHead>
              <TableHead className="text-left">Matches (season)</TableHead>
              <TableHead className="text-left">Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.length === 0 ? (
              <TableRow>
                {/* Update colSpan to include checkbox column */}
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No teams match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredTeams.map((team) => (
                <TableRow
                  key={team.team_id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/teams/${team.team_id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/teams/${team.team_id}`)
                    }
                  }}
                >
                  {/* Row checkbox; stop propagation so it doesn't navigate */}
                  <TableCell className="w-10">
                    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <Checkbox
                        aria-label={`Select team ${team.team_name}`}
                        checked={selectedIds.has(team.team_id)}
                        onCheckedChange={(v) => toggleOne(team.team_id, Boolean(v))}
                      />
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">{team.team_name}</TableCell>
                  <TableCell className="text-left ">
                    <Badge variant="bg-emerald-600">{team.code}</Badge>
                  </TableCell>
                  <TableCell className="text-left">{team.player_count}</TableCell>
                  <TableCell className="text-left">{team.matchesPlayedThisSeason}</TableCell>
                  <TableCell className="text-left">
                    {team.active_flag == 'active' ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                        No
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </main>
  )
}


export default observer(TeamsPage)