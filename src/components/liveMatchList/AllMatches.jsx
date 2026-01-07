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
  const competitions = useMemo(() => Array.from(new Set(matches.map((m) => m.round_code))).sort(), [matches])
  const grades = useMemo(() => Array.from(new Set(matches.map((m) => m.grade))).sort(), [matches])
  const currentYears = new Date().getFullYear();
  const seasons = Array.from({ length: currentYears - 2000 + 1 }, (_, i) => currentYears - i);

  const teams = useMemo(() => {
    const teamMap = new Map() // Use Map to avoid duplicates (key = id)

    matches.forEach((m) => {
      // Team A
      if (m.team_a_id && m.team_a) {
        teamMap.set(m.team_a_id, m.team_a) // or m.team_a_name if that's the field
      }
      // Team B
      if (m.team_b_id && m.team_b) {
        teamMap.set(m.team_b_id, m.team_b) // or m.team_b_name
      }
    })

    // Convert to sorted array of { id, name }
    return Array.from(teamMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [matches])
  // const teams = useMemo(() => Array.from(new Set(matches.flatMap((m) => [m.team_a_id, m.team_b_id]))).sort(), [matches])

  // Filtering
  const filtered = useMemo(() => {
    return matches.filter((m) => {
      const text = `${m.team_a} ${m.team_b} ${m.round_code} ${m.venue_id} ${m.referee_name}`.toLowerCase()
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
      if (competition !== "all" && m.round_code !== competition) return false
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

      <section>
        <MatchesTable rows={filtered} selected={selected} setSelected={setSelected} />
      </section>
    </section>
  )
}


export default observer(MatchesPage)