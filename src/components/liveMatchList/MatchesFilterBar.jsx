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

function MatchesFiltersBar({
  search,
  setSearch,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  competition,
  setCompetition,
  grade,
  setGrade,
  season,
  setSeason,
  team,
  setTeam,
  status,
  setStatus,
  competitions,
  grades,
  seasons,
  teams,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2 w-[60%]">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by teams, competition, venue, referee"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* date range  */}
        <div className="flex flex-col gap-2">
          <Label>Date range</Label>
          <div className="flex items-center gap-2">
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} aria-label="From date" />
            <span className="text-sm text-muted-foreground">to</span>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} aria-label="To date" />
          </div>
        </div>
      </div>

      <div className="flex  gap-5">
        <div className="flex flex-col gap-2">
          <Label>Competition</Label>
          <Select value={competition} onValueChange={setCompetition}>
            <SelectTrigger>
              <SelectValue placeholder="All competitions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {competitions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Grade</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger>
              <SelectValue placeholder="All grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {grades.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Season</Label>
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger>
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Team</Label>
          <Select value={team} onValueChange={setTeam}>
            <SelectTrigger>
              <SelectValue placeholder="All teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In-progress</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default observer(MatchesFiltersBar)