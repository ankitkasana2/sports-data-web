"use client"
import { useMemo, useState } from "react"
import PlayerProfilePanel from "./player-profile-panel"
import { ratePer, fmtNumber, fmtPercent, gateMinN, exportToCSV, textIncludes } from "../../../lib/players-utils"

function HeaderCell({ children, onClick, sortable, sortDir }) {
  return (
    <th scope="col" className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wide border-b border-border">
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:underline"
        onClick={sortable ? onClick : undefined}
        aria-sort={sortDir === "asc" ? "ascending" : sortDir === "desc" ? "descending" : "none"}
      >
        <span>{children}</span>
        {sortable && (
          <span className="text-[10px] opacity-60">{sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : ""}</span>
        )}
      </button>
    </th>
  )
}

function Cell({ children }) {
  return <td className="px-2 py-2 text-sm border-b border-border">{children}</td>
}

export default function PlayersTable({ data }) {
  const [search, setSearch] = useState("")
  const [code, setCode] = useState("FB") // FB or HUR
  const [view, setView] = useState("Attacking") // Attacking | Defending | Paired
  const [rateMode, setRateMode] = useState("per60") // per60 | perMatch
  const [sorts, setSorts] = useState([]) // [{id, dir}]
  const [selected, setSelected] = useState(null)

  const columns = useMemo(() => {
    const base = [
      { id: "player", header: "Player", accessor: (r) => r.name, sortable: true },
      { id: "team", header: "Team", accessor: (r) => r.team, sortable: true },
      { id: "gp", header: "GP", accessor: (r) => r.gp, sortable: true },
      { id: "min_total", header: "Min (Tot)", accessor: (r) => fmtNumber(r.min_total, 0), sortable: true },
      { id: "min_avg", header: "Min (Avg)", accessor: (r) => fmtNumber(r.min_avg, 1), sortable: true },
      { id: "starts", header: "Starts", accessor: (r) => r.starts ?? "—", sortable: true },
      { id: "subs", header: "Subs", accessor: (r) => r.subs ?? "—", sortable: true },
      {
        id: "on_pitch_pct",
        header: "On-pitch %",
        accessor: (r) => (r.on_pitch_pct != null ? fmtPercent(r.on_pitch_pct, 1) : "—"),
        sortable: true,
      },
    ]

    const scoring = [
      { id: "goals", header: "Goals", accessor: (r) => r.goals ?? 0, sortable: true },
      { id: "points", header: "Points", accessor: (r) => r.points ?? 0, sortable: true },
      { id: "total_points", header: "Total pts", accessor: (r) => (r.goals ?? 0) + (r.points ?? 0), sortable: true },
      {
        id: "share_scoring",
        header: "% team scoring (on)",
        accessor: (r) => (r.share_scoring != null ? fmtPercent(r.share_scoring, 1) : "—"),
        sortable: true,
      },
    ]

    const shootingTypesCommon = [
      {
        id: "from_play_att",
        header: "FP Att",
        accessor: (r) => r.from_play?.att ?? 0,
        sortable: true,
      },
      {
        id: "from_play_sc",
        header: "FP Sc",
        accessor: (r) => r.from_play?.sc ?? 0,
        sortable: true,
      },
      {
        id: "from_play_pct",
        header: "FP %",
        accessor: (r) => {
          const att = r.from_play?.att ?? 0
          const v = gateMinN({ attempts: att, minN: 5, value: r.from_play?.pct })
          return v != null ? fmtPercent(v, 1) : "—"
        },
        sortable: true,
      },
      {
        id: "frees_att",
        header: "Frees Att",
        accessor: (r) => r.frees?.att ?? 0,
        sortable: true,
      },
      {
        id: "frees_sc",
        header: "Frees Sc",
        accessor: (r) => r.frees?.sc ?? 0,
        sortable: true,
      },
      {
        id: "frees_pct",
        header: "Frees %",
        accessor: (r) => {
          const att = r.frees?.att ?? 0
          const v = gateMinN({ attempts: att, minN: 5, value: r.frees?.pct })
          return v != null ? fmtPercent(v, 1) : "—"
        },
        sortable: true,
      },
    ]

    const shootingFB = [
      { id: "f45_att", header: "45 Att", accessor: (r) => r.f45?.att ?? 0, sortable: true },
      { id: "f45_sc", header: "45 Sc", accessor: (r) => r.f45?.sc ?? 0, sortable: true },
      {
        id: "f45_pct",
        header: "45 %",
        accessor: (r) => {
          const att = r.f45?.att ?? 0
          const v = gateMinN({ attempts: att, minN: 5, value: r.f45?.pct })
          return v != null ? fmtPercent(v, 1) : "—"
        },
        sortable: true,
      },
      { id: "pen_att", header: "Pen Att", accessor: (r) => r.pen?.att ?? 0, sortable: true },
      { id: "pen_sc", header: "Pen Sc", accessor: (r) => r.pen?.sc ?? 0, sortable: true },
      {
        id: "pen_pct",
        header: "Pen %",
        accessor: (r) => {
          const att = r.pen?.att ?? 0
          const v = gateMinN({ attempts: att, minN: 5, value: r.pen?.pct })
          return v != null ? fmtPercent(v, 1) : "—"
        },
        sortable: true,
      },
      {
        id: "two_pt_rate",
        header: "2-pt Att rate",
        accessor: (r) => (r.two_pt?.rate != null ? fmtPercent(r.two_pt.rate, 1) : "—"),
        sortable: true,
      },
      {
        id: "two_pt_pct",
        header: "2-pt %",
        accessor: (r) => {
          const att = r.two_pt?.att ?? 0
          const v = gateMinN({ attempts: att, minN: 10, value: r.two_pt?.pct })
          return v != null ? fmtPercent(v, 1) : "—"
        },
        sortable: true,
      },
      {
        id: "two_pt_pts_per_game",
        header: "2-pt pts/game",
        accessor: (r) => fmtNumber(r.two_pt?.pts_game ?? 0, 1),
        sortable: true,
      },
    ]

    const shootingHur = [
      { id: "h65_att", header: "65 Att", accessor: (r) => r.h65?.att ?? 0, sortable: true },
      { id: "h65_sc", header: "65 Sc", accessor: (r) => r.h65?.sc ?? 0, sortable: true },
      {
        id: "h65_pct",
        header: "65 %",
        accessor: (r) => {
          const att = r.h65?.att ?? 0
          const v = gateMinN({ attempts: att, minN: 5, value: r.h65?.pct })
          return v != null ? fmtPercent(v, 1) : "—"
        },
        sortable: true,
      },
      { id: "sideline_att", header: "Sideline Att", accessor: (r) => r.sideline?.att ?? 0, sortable: true },
      { id: "sideline_sc", header: "Sideline Sc", accessor: (r) => r.sideline?.sc ?? 0, sortable: true },
      {
        id: "sideline_pct",
        header: "Sideline %",
        accessor: (r) => {
          const att = r.sideline?.att ?? 0
          const v = gateMinN({ attempts: att, minN: 5, value: r.sideline?.pct })
          return v != null ? fmtPercent(v, 1) : "—"
        },
        sortable: true,
      },
      { id: "pen_att_h", header: "Pen Att", accessor: (r) => r.pen?.att ?? 0, sortable: true },
      { id: "pen_sc_h", header: "Pen Sc", accessor: (r) => r.pen?.sc ?? 0, sortable: true },
      {
        id: "pen_pct_h",
        header: "Pen %",
        accessor: (r) => {
          const att = r.pen?.att ?? 0
          const v = gateMinN({ attempts: att, minN: 5, value: r.pen?.pct })
          return v != null ? fmtPercent(v, 1) : "—"
        },
        sortable: true,
      },
    ]

    const turnovers = [
      {
        id: "tos_won_per",
        header: "TO won/60",
        accessor: (r) => fmtNumber(ratePer(r.to_won ?? 0, r.min_on ?? r.min_total, "per60"), 1),
        sortable: true,
      },
      {
        id: "tos_conc_per",
        header: "TO conc/60",
        accessor: (r) => fmtNumber(ratePer(r.to_conc ?? 0, r.min_on ?? r.min_total, "per60"), 1),
        sortable: true,
      },
      {
        id: "to_to_shot_15",
        header: "TO→Shot ≤15s %",
        accessor: (r) => (r.to_to_shot_15 != null ? fmtPercent(r.to_to_shot_15, 1) : "—"),
        sortable: true,
      },
    ]

    const restartsCommon = [
      { id: "receipts", header: "Receipts", accessor: (r) => r.receipts ?? 0, sortable: true },
      {
        id: "receipt_share",
        header: "Receipt share",
        accessor: (r) => (r.receipt_share != null ? fmtPercent(r.receipt_share, 1) : "—"),
        sortable: true,
      },
      {
        id: "receipts_to_shots_15",
        header: "Receipts→Shots ≤15s/game",
        accessor: (r) => fmtNumber(r.receipts_to_shots_15 ?? 0, 1),
        sortable: true,
      },
    ]

    const gkFB = [
      { id: "ko_taken", header: "KOs taken", accessor: (r) => r.ko?.taken ?? 0, sortable: true },
      {
        id: "ko_short",
        header: "Own KO Short%",
        accessor: (r) => (r.ko?.short_pct != null ? fmtPercent(r.ko.short_pct, 1) : "—"),
        sortable: true,
      },
      {
        id: "ko_med",
        header: "Own KO Med%",
        accessor: (r) => (r.ko?.med_pct != null ? fmtPercent(r.ko.med_pct, 1) : "—"),
        sortable: true,
      },
      {
        id: "ko_long",
        header: "Own KO Long%",
        accessor: (r) => (r.ko?.long_pct != null ? fmtPercent(r.ko.long_pct, 1) : "—"),
        sortable: true,
      },
      {
        id: "crossed_40",
        header: "Crossed-40%",
        accessor: (r) => (r.ko?.crossed_40_pct != null ? fmtPercent(r.ko.crossed_40_pct, 1) : "—"),
        sortable: true,
      },
      {
        id: "marks_conc",
        header: "Marks conc/game",
        accessor: (r) => fmtNumber(r.ko?.marks_conceded_per_game ?? 0, 1),
        sortable: true,
      },
    ]

    const onPitch = [
      { id: "ortg_on", header: "ORtg_on", accessor: (r) => fmtNumber(r.ortg_on, 1), sortable: true },
      { id: "drtg_on", header: "DRtg_on", accessor: (r) => fmtNumber(r.drtg_on, 1), sortable: true },
      { id: "net_on", header: "Net_on", accessor: (r) => fmtNumber(r.net_on, 1), sortable: true },
      { id: "pace_on", header: "Pace_on", accessor: (r) => fmtNumber(r.pace_on, 1), sortable: true },
      { id: "+/-/60", header: "+/-/60", accessor: (r) => fmtNumber(r.plus_minus_per60, 1), sortable: true },
    ]

    const discipline = [
      {
        id: "fouls_won",
        header: "Fouls won/60",
        accessor: (r) => fmtNumber(ratePer(r.fouls_won ?? 0, r.min_on ?? r.min_total, "per60"), 1),
        sortable: true,
      },
      {
        id: "fouls_conc",
        header: "Fouls conc/60",
        accessor: (r) => fmtNumber(ratePer(r.fouls_conc ?? 0, r.min_on ?? r.min_total, "per60"), 1),
        sortable: true,
      },
      {
        id: "cards_100",
        header: "Cards/100",
        accessor: (r) => fmtNumber(ratePer(r.cards ?? 0, r.min_on ?? r.min_total, "per60") * (100 / 60), 1),
        sortable: true,
      },
    ]

    // Compose by code and role
    const shooting = code === "FB" ? [...shootingTypesCommon, ...shootingFB] : [...shootingTypesCommon, ...shootingHur]

    // GK columns visible if is_gk true; otherwise outfield restarts
    const restarts = (r) => (r.is_gk && code === "FB" ? gkFB : restartsCommon)

    // Final columns order (subset for MVP)
    return { base, scoring, shooting, turnovers, restarts, onPitch, discipline }
  }, [code])

  const allColumnsFlat = useMemo(() => {
    // flatten groups; for restarts we need a representative row to choose GK vs not for headers
    // We'll show outfield headers by default; GK-specific headers appear when a GK row renders (cells still align)
    const restartsHeaders = [
      { id: "receipts", header: "Receipts", accessor: (r) => r.receipts ?? 0, sortable: true },
      {
        id: "receipt_share",
        header: "Receipt share",
        accessor: (r) => (r.receipt_share != null ? fmtPercent(r.receipt_share, 1) : "—"),
        sortable: true,
      },
      {
        id: "receipts_to_shots_15",
        header: "Receipts→Shots ≤15s/game",
        accessor: (r) => fmtNumber(r.receipts_to_shots_15 ?? 0, 1),
        sortable: true,
      },
    ]
    return [
      ...columns.base,
      ...columns.scoring,
      ...columns.shooting,
      ...restartsHeaders,
      ...columns.onPitch,
      ...columns.discipline,
    ]
  }, [columns])

  const sortDirFor = (id) => sorts.find((s) => s.id === id)?.dir
  const onHeaderClick = (id) => {
    setSorts((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      if (idx === -1) return [{ id, dir: "desc" }]
      const current = prev[idx]
      const nextDir = current.dir === "desc" ? "asc" : current.dir === "asc" ? null : "desc"
      if (!nextDir) {
        // remove
        return prev.filter((s) => s.id !== id)
      } else {
        const copy = [...prev]
        copy[idx] = { id, dir: nextDir }
        return copy
      }
    })
  }

  const filtered = useMemo(() => {
    return (data || []).filter((r) => {
      const hay = `${r.name || ""} ${r.team || ""}`
      return textIncludes(hay, search)
    })
  }, [data, search])

  const sorted = useMemo(() => {
    if (!sorts.length) return filtered
    const copy = [...filtered]
    copy.sort((a, b) => {
      for (const s of sorts) {
        const col = allColumnsFlat.find((c) => c.id === s.id)
        const va = typeof col?.accessor === "function" ? col.accessor(a) : a[col?.accessor]
        const vb = typeof col?.accessor === "function" ? col.accessor(b) : b[col?.accessor]
        const na = typeof va === "string" ? va.toString() : Number(va ?? 0)
        const nb = typeof vb === "string" ? vb.toString() : Number(vb ?? 0)
        if (na < nb) return s.dir === "asc" ? -1 : 1
        if (na > nb) return s.dir === "asc" ? 1 : -1
      }
      return 0
    })
    return copy
  }, [filtered, sorts, allColumnsFlat])

  return (
    <div className="w-full">
      {/* Top bar controls
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b border-border">
        <div className="flex flex-wrap items-center gap-2 p-3">
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-70">Code</label>
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            >
              <option value="FB">Football</option>
              <option value="HUR">Hurling</option>
            </select>
          </div>

          <div className="flex items-center gap-1 rounded-md border border-border">
            {["Attacking", "Defending", "Paired"].map((v) => (
              <button
                key={v}
                className={`px-2 py-1 text-sm ${view === v ? "bg-accent text-accent-foreground" : ""}`}
                onClick={() => setView(v)}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-md border border-border">
            {[
              { id: "per60", label: "Per-60" },
              { id: "perMatch", label: "Per-match" },
            ].map((m) => (
              <button
                key={m.id}
                className={`px-2 py-1 text-sm ${rateMode === m.id ? "bg-accent text-accent-foreground" : ""}`}
                onClick={() => setRateMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <input
              type="search"
              placeholder="Search player/team"
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="rounded-md border border-border px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => exportToCSV({ rows: sorted, columns: allColumnsFlat, filename: "players.csv" })}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div> */}

      {/* Table */}
      <div className="overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-muted/50">
            <tr>
              {allColumnsFlat.map((c) => (
                <HeaderCell
                  key={c.id}
                  sortable={!!c.sortable}
                  onClick={() => onHeaderClick(c.id)}
                  sortDir={sortDirFor(c.id)}
                >
                  {c.header}
                </HeaderCell>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, idx) => (
              <tr
                key={r.id ?? `${r.name}-${idx}`}
                className="hover:bg-accent/30 cursor-pointer"
                onClick={() => setSelected(r)}
              >
                {allColumnsFlat.map((c) => {
                  const val = typeof c.accessor === "function" ? c.accessor(r) : r[c.accessor]
                  return <Cell key={c.id}>{val != null && val !== "" ? val : "—"}</Cell>
                })}
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={allColumnsFlat.length} className="px-2 py-6 text-center text-sm opacity-70">
                  No players match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Right profile panel */}
      {selected && <PlayerProfilePanel player={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
