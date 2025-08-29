import { useMemo, useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"

// Colors used (exactly 5 total):
// - Primary: blue-600
// - Accent: emerald-600
// - Neutrals: white, slate-700, slate-200

// Mock data (replace with real data later)
const initialPlayers = [
  {
    id: "p1",
    name: "Aidan Murphy",
    team: "Riverside",
    active: true,
    code: "Hurling",
    preferredPosition: "Midfield",
    dominantSide: "R",
    matchesPlayedSeason: 12,
    minutesPlayedSeason: 860,
  },
  {
    id: "p2",
    name: "Liam O'Connell",
    team: "Highfield",
    active: true,
    code: "Football",
    preferredPosition: "Forward",
    dominantSide: "L",
    matchesPlayedSeason: 8,
    minutesPlayedSeason: 540,
  },
  {
    id: "p3",
    name: "Sean Byrne",
    team: "Riverside",
    active: false,
    code: "Hurling",
    preferredPosition: "Back",
    dominantSide: "Ambi",
    matchesPlayedSeason: 3,
    minutesPlayedSeason: 110,
  },
]

export default function PlayersPage() {
  // Filters & search
  const [query, setQuery] = useState("")
  const [team, setTeam] = useState("All")
  const [active, setActive] = useState("All") // All | Active | Inactive
  const [code, setCode] = useState("All") // All | Hurling | Football

  // Data and selection
  const [players, setPlayers] = useState(initialPlayers)
  const [selected, setSelected] = useState(new Set()) // selected ids for bulk actions

  // Dialog states
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showMerge, setShowMerge] = useState(false)
  const [showDeactivate, setShowDeactivate] = useState(false)

  // Derived values
  const teams = useMemo(() => {
    const set = new Set(players.map((p) => p.team).filter(Boolean))
    return ["All", ...Array.from(set).sort()]
  }, [players])

  const filtered = useMemo(() => {
    let data = players
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      data = data.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (team !== "All") {
      data = data.filter((p) => p.team === team)
    }
    if (active !== "All") {
      const isActive = active === "Active"
      data = data.filter((p) => p.active === isActive)
    }
    if (code !== "All") {
      data = data.filter((p) => p.code === code)
    }
    return data
  }, [players, query, team, active, code])

  const allVisibleSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id))
  const someVisibleSelected = filtered.some((p) => selected.has(p.id))

  function toggleAllVisible() {
    const next = new Set(selected)
    if (allVisibleSelected) {
      filtered.forEach((p) => next.delete(p.id))
    } else {
      filtered.forEach((p) => next.add(p.id))
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
  function handleAddPlayer(newPlayer) {
    setPlayers((prev) => [
      { ...newPlayer, id: cryptoRandom(), matchesPlayedSeason: 0, minutesPlayedSeason: 0 },
      ...prev,
    ])
    setShowAdd(false)
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
      <ActionsBar
        onAdd={() => setShowAdd(true)}
        onImport={() => setShowImport(true)}
        onMerge={() => setShowMerge(true)}
        onDeactivate={() => setShowDeactivate(true)}
        canMerge={canMerge}
        canDeactivate={canDeactivate}
        selectedCount={selected.size}
      />
      <PlayerTable
        players={filtered}
        selected={selected}
        onToggleOne={toggleOne}
        onToggleAll={toggleAllVisible}
        allVisibleSelected={allVisibleSelected}
        someVisibleSelected={someVisibleSelected}
      />

      {showAdd && <AddPlayerDialog onClose={() => setShowAdd(false)} onSubmit={handleAddPlayer} />}
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

function SearchAndFilters({ query, setQuery, team, setTeam, teams, active, setActive, code, setCode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <label htmlFor="player-search" className="block text-sm font-medium text-slate-700">
            Search by player name
          </label>
          <input
            id="player-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Aidan..."
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 placeholder:text-slate-700/60 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 md:pl-4 md:basis-[520px]">
          <div>
            <label htmlFor="team-filter" className="block text-sm font-medium text-slate-700">
              Team
            </label>
            <select
              id="team-filter"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="active-filter" className="block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="active-filter"
              value={active}
              onChange={(e) => setActive(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {["All", "Active", "Inactive"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="code-filter" className="block text-sm font-medium text-slate-700">
              Code
            </label>
            <select
              id="code-filter"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {["All", "Hurling", "Football"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionsBar({ onAdd, onImport, onMerge, onDeactivate, canMerge, canDeactivate, selectedCount }) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 md:flex-row">
      <div className="text-sm text-slate-700">{selectedCount > 0 ? `${selectedCount} selected` : "No selection"}</div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onAdd}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          Add Player
        </button>
        <button
          onClick={onImport}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/40 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          Import CSV
        </button>
        <button
          onClick={onMerge}
          disabled={!canMerge}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/40 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Merge Duplicates
        </button>
        <button
          onClick={onDeactivate}
          disabled={!canDeactivate}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/40 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Deactivate
        </button>
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
        <thead className="border-b border-slate-200 bg-slate-200/40 text-slate-700">
          <tr>
            <th scope="col" className="px-3 py-2">
              <input
                aria-label="Select all visible"
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={onToggleAll}
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
              <tr key={p.id} className="border-b border-slate-200 last:border-b-0">
                <td className="px-3 py-2 align-middle">
                  <input
                    aria-label={`Select ${p.name}`}
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => onToggleOne(p.id)}
                  />
                </td>
                <td className="px-3 py-2 align-middle">
                  <Link
                    to={`/players/${encodeURIComponent(p.id)}`}
                    className="font-medium text-blue-600 underline-offset-2 hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-3 py-2 align-middle">{p.team}</td>
                <td className="px-3 py-2 align-middle">
                  {p.active ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                      No
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 align-middle">{p.preferredPosition}</td>
                <td className="px-3 py-2 align-middle">{p.dominantSide}</td>
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

function AddPlayerDialog({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    team: "",
    active: true,
    code: "Hurling",
    preferredPosition: "",
    dominantSide: "R",
  })
  const canSave = form.name.trim() && form.team.trim()

  function submit(e) {
    e.preventDefault()
    if (!canSave) return
    onSubmit({
      name: form.name.trim(),
      team: form.team.trim(),
      active: !!form.active,
      code: form.code,
      preferredPosition: form.preferredPosition.trim(),
      dominantSide: form.dominantSide,
    })
  }

  return (
    <Modal title="Add Player" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Name">
          <input
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Full name"
          />
        </Field>
        <Field label="Team">
          <input
            value={form.team}
            onChange={(e) => setForm((s) => ({ ...s, team: e.target.value }))}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Team name"
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Active">
            <select
              value={form.active ? "true" : "false"}
              onChange={(e) => setForm((s) => ({ ...s, active: e.target.value === "true" }))}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Field>
          <Field label="Code">
            <select
              value={form.code}
              onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option>Hurling</option>
              <option>Football</option>
            </select>
          </Field>
          <Field label="Dominant side">
            <select
              value={form.dominantSide}
              onChange={(e) => setForm((s) => ({ ...s, dominantSide: e.target.value }))}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option>R</option>
              <option>L</option>
              <option>Ambi</option>
            </select>
          </Field>
        </div>
        <Field label="Preferred position">
          <input
            value={form.preferredPosition}
            onChange={(e) => setForm((s) => ({ ...s, preferredPosition: e.target.value }))}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="e.g., Midfield"
          />
        </Field>
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
            disabled={!canSave}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

function cryptoRandom() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return "id-" + Math.random().toString(36).slice(2)
}
