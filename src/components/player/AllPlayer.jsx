import { useMemo, useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"
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
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"
import { set, toJS } from "mobx"
import { autorun } from "mobx"




function validatePlayerRecord(rec) {
  const errors = []

  const id = `PLAYER_${nanoid(6)}`;

  const name = (rec.name || "").trim()
  if (!name) errors.push("Missing name")

  const team = (rec.team || "").trim()
  if (!team) errors.push("Missing team")

  const position = (rec.position || "").trim()
  if (!position) errors.push("Missing player position")

  const dominant_side = (rec.dominant_side || "").trim()
  if (!dominant_side) errors.push("Missing dominant-side")


  return {
    ok: errors.length === 0,
    errors,
    player: errors.length
      ? null
      : {
        id,
        name,
        team,
        position,
        dominant_side,
      },
  }
}

function PlayersPage() {
  const { matchesStore, homeFilterbarStore, teamsStore, playersStore } = useStores()
  // Filters & search
  const [query, setQuery] = useState("")
  const [team, setTeam] = useState("all")
  const [active, setActive] = useState("all") // All | Active | Inactive
  const [code, setCode] = useState("all") // All | Hurling | Football

  // Data and selection
  const [players, setPlayers] = useState([])
  const [selected, setSelected] = useState(new Set()) // selected ids for bulk actions

  // Dialog states
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showMerge, setShowMerge] = useState(false)
  const [showDeactivate, setShowDeactivate] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '',
    team: { name: '', id: '' },
    position: '',
    dominant_side: '',
  })


  // fetching players 
  useEffect(() => {

    // 1. Fetch teams from MobX store
    playersStore.getAllPlayers();

    const disposer = autorun(() => {
      const allPlayers = toJS(playersStore.allPlayers);


      // Convert object -> array
      setPlayers(allPlayers);
    });

    // cleanup on unmount
    return () => disposer();
  }, []);



  // Derived values
  const teams = useMemo(() => {
    teamsStore.getAllTeams()
    const name = teamsStore.allTeams.map(team => { return team.team_name })
    return name
  }, [players])

  const filtered = useMemo(() => {
    let data = players
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      data = data.filter((p) => p.display_name.toLowerCase().includes(q))
    }
    if (team !== "all") {
      data = data.filter((p) => p.team_name === team)
    }
    if (active !== "all") {

      data = data.filter((p) => p.active_flag === active)
    }
    if (code !== "all") {
      data = data.filter((p) => p.code === code)
    }
    return data
  }, [players, query, team, active, code])

  const allVisibleSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.player_id))
  const someVisibleSelected = filtered.some((p) => selected.has(p.player_id))

  function toggleAllVisible() {
    const next = new Set(selected)
    if (allVisibleSelected) {
      filtered.forEach((p) => next.delete(p.player_id))
    } else {
      filtered.forEach((p) => next.add(p.player_id))
    }
    setSelected(next)
  }

  function toggleOne(id) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  // Action handlers
  async function handleAddPlayer(e) {
    e.preventDefault()

    const rec = {
      name: addForm.name,
      team: addForm.team.id,
      position: addForm.position,
      dominant_side: addForm.dominant_side,
    }
    const { ok, errors, player } = validatePlayerRecord(rec)
    if (!ok || !team) {
      return
    }


    const created = await playersStore.createPlayer(player);

    if (created) {
      toast(<div className="flex gap-3">
        <Check className="text-green-800" /><span>Player has been created Successfully.</span>
      </div>)

      setAddForm({
        name: '',
        team: { name: '', id: '' },
        position: '',
        dominant_side: '',
      })
      
      setShowAdd(false)
      playersStore.getAllPlayers();
      // navigate(0)
    } else {
      toast(<div className="flex gap-3">
        <Ban className="text-red-700" /><span>Player not created.</span>
      </div>)
    }
  }

  function handleImportPlayers(newPlayers) {
    setPlayers((prev) => [...newPlayers.map((np) => ({ ...np, id: cryptoRandom() })), ...prev])
    setShowImport(false)
  }

  function handleMerge(keepId, dropId) {
    if (keepId === dropId) return
    setPlayers((prev) => {
      const keep = prev.find((p) => p.id === keepId)
      const drop = prev.find((p) => p.id === dropId)
      if (!keep || !drop) return prev
      const merged = {
        ...keep,
        // Merge strategy: keep identity fields from "keep", sum season stats
        matchesPlayedSeason: (keep.matchesPlayedSeason || 0) + (drop.matchesPlayedSeason || 0),
        minutesPlayedSeason: (keep.minutesPlayedSeason || 0) + (drop.minutesPlayedSeason || 0),
      }
      const rest = prev.filter((p) => p.id !== dropId).map((p) => (p.id === keepId ? merged : p))
      return rest
    })
    // Clean selection
    setSelected(new Set())
    setShowMerge(false)
  }

  function handleDeactivateSelected() {
    setPlayers((prev) => prev.map((p) => (selected.has(p.id) ? { ...p, active: false } : p)))
    setSelected(new Set())
    setShowDeactivate(false)
  }

  const selectedIds = Array.from(selected)
  const canMerge = selectedIds.length === 2
  const canDeactivate = selectedIds.length >= 1

  return (
    <section className="space-y-4">
      <ActionsBar
        onAdd={() => setShowAdd(true)}
        onImport={() => setShowImport(true)}
        onMerge={() => setShowMerge(true)}
        onDeactivate={() => setShowDeactivate(true)}
        canMerge={canMerge}
        canDeactivate={canDeactivate}
        selectedCount={selected.size}
      />

      <SearchAndFilters
        query={query}
        setQuery={setQuery}
        team={team}
        setTeam={setTeam}
        teams={teams}
        active={active}
        setActive={setActive}
        code={code}
        setCode={setCode}
      />

      <PlayerTable
        players={filtered}
        selected={selected}
        onToggleOne={toggleOne}
        onToggleAll={toggleAllVisible}
        allVisibleSelected={allVisibleSelected}
        someVisibleSelected={someVisibleSelected}
      />


      {/* add players dialog  */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Player</DialogTitle>
            <DialogDescription>Create a new player record.</DialogDescription>
          </DialogHeader>

          <form className="grid grid-cols-2 gap-4" onSubmit={handleAddPlayer}>
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="name">Player name</Label>
              <Input
                id="name"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Ballymore"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Select Team</Label>
              <Select value={addForm.team.name} onValueChange={(v) =>
                setAddForm((f) => ({
                  ...f,
                  team: { ...f.team, name: v, id: teamsStore.allTeams.find(team => team.team_name == v).team_id }
                }))
              }>
                <SelectTrigger className='mt-1 w-full' aria-label="team">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teamsStore.allTeams.map(team => (<SelectItem key={team.team_id} value={team.team_name}>{team.team_name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Preferred position</Label>
              <Select value={addForm.position} onValueChange={(v) => setAddForm((f) => ({ ...f, position: v }))}>
                <SelectTrigger className='mt-1 w-full' aria-label="">
                  <SelectValue placeholder="Select player position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                  <SelectItem value="Right Corner Back">Right Corner Back</SelectItem>
                  <SelectItem value="Full Back">Full Back</SelectItem>
                  <SelectItem value="Left Corner Back">Left Corner Back</SelectItem>
                  <SelectItem value="Right Half Back">Right Half Back</SelectItem>
                  <SelectItem value="Centre Back">Centre Back</SelectItem>
                  <SelectItem value="Left Half Back">Left Half Back</SelectItem>
                  <SelectItem value="Midfielders">Midfielders</SelectItem>
                  <SelectItem value="Right Half Forward">Right Half Forward</SelectItem>
                  <SelectItem value="Centre Half Forward">Centre Half Forward</SelectItem>
                  <SelectItem value="Left Half Forward">Left Half Forward</SelectItem>
                  <SelectItem value="Right Corner Forward">Right Corner Forward</SelectItem>
                  <SelectItem value="Full Forward">Full Forward</SelectItem>
                  <SelectItem value="Left Corner Forward">Left Corner Forward</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Dominant side</Label>
              <Select value={addForm.dominant_side} onValueChange={(v) => setAddForm((f) => ({ ...f, dominant_side: v }))}>
                <SelectTrigger className='mt-1 w-full' aria-label="dominant_side">
                  <SelectValue placeholder="Select dominant side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Left">Left</SelectItem>
                  <SelectItem value="Right">Right</SelectItem>
                  <SelectItem value="Ambiguous">Ambiguous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2 col-span-2">
              <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showImport && <ImportCsvDialog onClose={() => setShowImport(false)} onImport={handleImportPlayers} />}
      {showMerge && canMerge && (
        <MergeDialog
          onClose={() => setShowMerge(false)}
          players={players.filter((p) => selected.has(p.id))}
          onMerge={handleMerge}
        />
      )}
      {showDeactivate && (
        <DeactivateDialog
          onClose={() => setShowDeactivate(false)}
          count={selected.size}
          onConfirm={handleDeactivateSelected}
        />
      )}
    </section>
  )
}


export default observer(PlayersPage);

function SearchAndFilters({ query, setQuery, team, setTeam, teams, active, setActive, code, setCode }) {
  return (
    <div className="rounded-lg  ">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <label htmlFor="player-search" className="block text-sm font-medium text-slate-700">
            Search by player name
          </label>
          <Input
            id="player-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Aidan..."
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 placeholder:text-slate-700/60 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 md:pl-4 md:basis-[520px]">
          <div className="overflow-hidden">
            <Label htmlFor="team-filter" className="block text-sm font-medium text-slate-700">
              Team
            </Label>
            <Select value={team} onValueChange={(v) => setTeam(v)}>
              <SelectTrigger className='mt-1 w-full' aria-label="team-filter" >
                <SelectValue className='' placeholder='Filter by team' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                {teams.map(team => (<SelectItem key={team} value={team}>{team}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="active-filter" className="block text-sm font-medium text-slate-700">
              Status
            </Label>
            <Select value={active} onValueChange={(v) => setActive(v)}>
              <SelectTrigger className='mt-1 w-full' aria-label="team-filter" >
                <SelectValue className='' placeholder='Filter by team' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>In-Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="code-filter" className="block text-sm font-medium text-slate-700">
              Code
            </Label>
            <Select value={code} onValueChange={(v) => setCode(v)}>
              <SelectTrigger className='mt-1 w-full' aria-label="team-filter" >
                <SelectValue className='' placeholder='Filter by code' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='Hurling'>Hurling</SelectItem>
                <SelectItem value='Football'>Football</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionsBar({ onAdd, onImport, onMerge, onDeactivate, canMerge, canDeactivate, selectedCount }) {
  return (
    <div className="flex items-start ">
      {/* <div className="text-sm text-slate-700">{selectedCount > 0 ? `${selectedCount} selected` : "No selection"}</div> */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onAdd} className="hover:cursor-pointer">
          Add Player
        </Button>
        <Button onClick={onImport} variant="outline" className="hover:cursor-pointer">
          Import CSV
        </Button>
        <Button
          onClick={onMerge}
          disabled={!canMerge}
          variant="secondary"
          className="hover:cursor-pointer"
        >
          Merge Duplicates
        </Button>
        <Button
          onClick={onDeactivate}
          disabled={!canDeactivate}
          variant="secondary"
          className="hover:cursor-pointer"
        >
          Deactivate
        </Button>
      </div>
    </div>
  )
}

function PlayerTable({ players, selected, onToggleOne, onToggleAll, allVisibleSelected, someVisibleSelected }) {
  const selectAllRef = useRef(null)
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = !allVisibleSelected && someVisibleSelected
    }
  }, [allVisibleSelected, someVisibleSelected])

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-orange-50/50 text-slate-700">
          <tr>
            <th scope="col" className="px-3 py-2">
              <input
                aria-label="Select all visible"
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={onToggleAll}
                className="accent-black"
              />
            </th>
            <Th>Name</Th>
            <Th>Team</Th>
            <Th>Active</Th>
            <Th>Preferred position</Th>
            <Th>Dominant side</Th>
            <Th>Matches played</Th>
            <Th>Minutes played</Th>
          </tr>
        </thead>
        <tbody>
          {players.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-6 text-center text-slate-700">
                No players found.
              </td>
            </tr>
          ) : (
            players.map((p) => (
              <tr key={p.player_id} className="border-b border-slate-200 last:border-b-0">
                <td className="px-3 py-2 align-middle">
                  <input
                    aria-label={`Select ${p.display_name}`}
                    type="checkbox"
                    checked={selected.has(p.player_id)}
                    onChange={() => onToggleOne(p.player_id)}
                    className="accent-black"
                  />
                </td>
                <td className="px-3 py-2 align-middle">
                  <Link
                    to={`/players/${encodeURIComponent(p.player_id)}`}
                    className="font-medium text-black underline-offset-2 hover:underline"
                  >
                    {p.display_name}
                  </Link>
                </td>
                <td className="px-3 py-2 align-middle">{p.team_name}</td>
                <td className="px-3 py-2 align-middle">
                  {p.active_flag == 'active' ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                      No
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 align-middle">{p.preferred_position}</td>
                <td className="px-3 py-2 align-middle">{p.dominant_side}</td>
                <td className="px-3 py-2 align-middle">{p.matchesPlayedSeason ?? 0}</td>
                <td className="px-3 py-2 align-middle">{p.minutesPlayedSeason ?? 0}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }) {
  return (
    <th scope="col" className="px-3 py-2 font-medium">
      {children}
    </th>
  )
}

function ImportCsvDialog({ onClose, onImport }) {
  const [error, setError] = useState("")
  const fileRef = useRef(null)

  function parseCsvText(text) {
    // Minimal CSV parser: handles simple commas and new lines (no complex quotes)
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
    if (lines.length === 0) return []
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const required = [
      "name",
      "team",
      "active",
      "code",
      "preferredposition",
      "dominantside",
      "matchesplayed",
      "minutesplayed",
    ]
    const missing = required.filter((r) => !headers.includes(r))
    if (missing.length) {
      throw new Error(`Missing columns: ${missing.join(", ")}`)
    }
    const idx = Object.fromEntries(headers.map((h, i) => [h, i]))
    const rows = lines.slice(1).map((line) => line.split(","))
    const mapped = rows
      .filter((cols) => cols.filter(Boolean).length > 0)
      .map((cols) => ({
        name: cols[idx["name"]]?.trim() || "",
        team: cols[idx["team"]]?.trim() || "",
        active:
          (cols[idx["active"]] || "").toLowerCase().startsWith("t") ||
          (cols[idx["active"]] || "").toLowerCase() === "yes",
        code: (cols[idx["code"]] || "").trim() || "Hurling",
        preferredPosition: cols[idx["preferredposition"]]?.trim() || "",
        dominantSide: (cols[idx["dominantside"]] || "").trim() || "R",
        matchesPlayedSeason: Number(cols[idx["matchesplayed"]] || 0) || 0,
        minutesPlayedSeason: Number(cols[idx["minutesplayed"]] || 0) || 0,
      }))
    return mapped
  }

  function onFileChange(e) {
    setError("")
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result || "")
        const imported = parseCsvText(text)
        if (imported.length === 0) {
          setError("No data found in CSV.")
          return
        }
        onImport(imported)
      } catch (err) {
        setError(err.message || "Failed to parse CSV.")
      }
    }
    reader.onerror = () => setError("Could not read the file.")
    reader.readAsText(file)
  }

  return (
    <Modal title="Import Players (CSV)" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-slate-700">
          Upload a CSV with columns: name, team, active, code, preferredPosition, dominantSide, matchesPlayed,
          minutesPlayed.
        </p>
        <input
          type="file"
          ref={fileRef}
          accept=".csv,text/csv"
          onChange={onFileChange}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {error ? <p className="text-sm font-medium text-slate-700">{error}</p> : null}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/40 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

function MergeDialog({ onClose, players, onMerge }) {
  const [keepId, setKeepId] = useState(players[0]?.id || "")
  const otherId = players.find((p) => p.id !== keepId)?.id || ""

  function submit(e) {
    e.preventDefault()
    if (!keepId || !otherId) return
    onMerge(keepId, otherId)
  }

  return (
    <Modal title="Merge Duplicates" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-sm text-slate-700">
          Select which player to keep. Season stats will be summed; matches and history should be reconciled in your
          backend.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {players.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white p-3"
            >
              <input type="radio" name="keep" checked={keepId === p.id} onChange={() => setKeepId(p.id)} />
              <div>
                <div className="font-medium text-slate-700">{p.name}</div>
                <div className="text-sm text-slate-700/80">
                  {p.team} • {p.code}
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/40 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Merge
          </button>
        </div>
      </form>
    </Modal>
  )
}

function DeactivateDialog({ onClose, count, onConfirm }) {
  return (
    <Modal title="Deactivate Players" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-slate-700">
          Deactivate {count} {count === 1 ? "player" : "players"}? This preserves history but hides them from active
          rosters.
        </p>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/40 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Deactivate
          </button>
        </div>
      </div>
    </Modal>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-slate-700/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-700">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200/40 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function cryptoRandom() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return "id-" + Math.random().toString(36).slice(2)
}
