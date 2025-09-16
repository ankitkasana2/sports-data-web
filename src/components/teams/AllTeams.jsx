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

  const name = (rec.name || "").trim()
  if (!name) errors.push("Missing name")

  const code = (rec.code || "").trim()
  if (!["Hurling", "Football"].includes(code)) {
    errors.push("Code must be 'Hurling' or 'Football'")
  }

  const season = Number(rec.season)
  if (!Number.isInteger(season)) errors.push("Season must be an integer")

  const active = normalizeBool(rec.active)

  const playerCount = Number(rec.playerCount)
  if (!Number.isInteger(playerCount) || playerCount < 0) {
    errors.push("playerCount must be a non-negative integer")
  }

  const matchesPlayedThisSeason = Number(rec.matchesPlayedThisSeason)
  if (!Number.isInteger(matchesPlayedThisSeason) || matchesPlayedThisSeason < 0) {
    errors.push("matchesPlayedThisSeason must be a non-negative integer")
  }

  return {
    ok: errors.length === 0,
    errors,
    team: errors.length
      ? null
      : {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        code,
        season,
        active,
        playerCount,
        matchesPlayedThisSeason,
      },
  }
}

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_SEASONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 2 + i)

const initialTeams = [
  {
    id: "t1",
    name: "Ballymore",
    code: "Hurling",
    season: CURRENT_YEAR,
    active: true,
    playerCount: 28,
    matchesPlayedThisSeason: 12,
  },
  {
    id: "t2",
    name: "St. Patrick's",
    code: "Football",
    season: CURRENT_YEAR,
    active: true,
    playerCount: 24,
    matchesPlayedThisSeason: 10,
  },
  {
    id: "t3",
    name: "Riverside",
    code: "Hurling",
    season: CURRENT_YEAR,
    active: false,
    playerCount: 21,
    matchesPlayedThisSeason: 8,
  },
]

function TeamsPage() {

  const { matchesStore, homeFilterbarStore, teamsStore } = useStores()
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])


  useEffect(() => {
    // 1. Fetch matches from MobX store
    teamsStore.getAllTeams()

    // 2. Sync store.matches → local state
    // reaction will run whenever matchesStore.matches changes
    const disposer = autorun(() => {
      setTeams([...toJS(teamsStore.allTeams)]); // create a new array to trigger re-render
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
    season: String(CURRENT_YEAR),
    active: true,
    playerCount: 0,
    matchesPlayedThisSeason: 0,
  })

  // Selection state and helpers for table checkboxes
  const [selectedIds, setSelectedIds] = useState(new Set())
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchesSearch = !search || t.name.toLowerCase().includes(search.trim().toLowerCase())

      const matchesCode = codeFilter === "all" || t.code === codeFilter
      const matchesSeason = !seasonFilter || String(t.season) === String(seasonFilter)
      const matchesActive = activeFilter === "all" || (activeFilter === "active" ? t.active : !t.active)

      return matchesSearch && matchesCode && matchesSeason && matchesActive
    })
  }, [teams, search, codeFilter, seasonFilter, activeFilter])

  const filteredIds = useMemo(() => filteredTeams.map((t) => t.id), [filteredTeams])

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

  function handleAddTeam(e) {
    e.preventDefault()
    const rec = {
      name: addForm.name,
      code: addForm.code,
      season: addForm.season,
      active: addForm.active,
      playerCount: addForm.playerCount,
      matchesPlayedThisSeason: addForm.matchesPlayedThisSeason,
    }
    const { ok, errors, team } = validateTeamRecord(rec)
    if (!ok || !team) {
      return
    }
    setTeams((prev) => [{ ...team }, ...prev])
    setOpenAdd(false)
    setAddForm({
      name: "",
      code: "Hurling",
      season: String(CURRENT_YEAR),
      active: true,
      playerCount: 0,
      matchesPlayedThisSeason: 0,
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

                <div className="grid gap-2">
                  <Label>Season</Label>
                  <Select value={addForm.season} onValueChange={(v) => setAddForm((f) => ({ ...f, season: v }))}>
                    <SelectTrigger aria-label="Season">
                      <SelectValue placeholder="Select season" />
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

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="active"
                    checked={addForm.active}
                    onCheckedChange={(v) => setAddForm((f) => ({ ...f, active: Boolean(v) }))}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="playerCount">Number of players</Label>
                  <Input
                    id="playerCount"
                    type="number"
                    min={0}
                    value={addForm.playerCount}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        playerCount: Number(e.target.value || 0),
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="matchesPlayedThisSeason">Matches played (this season)</Label>
                  <Input
                    id="matchesPlayedThisSeason"
                    type="number"
                    min={0}
                    value={addForm.matchesPlayedThisSeason}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        matchesPlayedThisSeason: Number(e.target.value || 0),
                      }))
                    }
                  />
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
        <div className="col-span-1 md:col-span-2">
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
              <SelectItem value="Hurling">Hurling</SelectItem>
              <SelectItem value="Football">Football</SelectItem>
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
                  key={team.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/teams/${team.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/teams/${team.id}`)
                    }
                  }}
                >
                  {/* Row checkbox; stop propagation so it doesn't navigate */}
                  <TableCell className="w-10">
                    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <Checkbox
                        aria-label={`Select team ${team.name}`}
                        checked={selectedIds.has(team.id)}
                        onCheckedChange={(v) => toggleOne(team.id, Boolean(v))}
                      />
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="text-left ">
                    <Badge variant="bg-emerald-600">{team.code}</Badge>
                  </TableCell>
                  <TableCell className="text-left">{team.playerCount}</TableCell>
                  <TableCell className="text-left">{team.matchesPlayedThisSeason}</TableCell>
                  <TableCell className="text-left">
                    {team.active ? (
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