"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Separator } from "@/components/ui/separator"
import { ENTITY_TYPES } from "@/lib/comparison-data"

export default function TopControls({
  entityType,
  setEntityType,
  triToggle,
  setTriToggle,
  rateMode,
  setRateMode,
  oppAdjusted,
  setOppAdjusted,
  deltaVsLeague,
  setDeltaVsLeague,
  percentile,
  setPercentile,
  showDiffChip,
  setShowDiffChip,
  preset,
  setPreset,
  sampleWindow,
  setSampleWindow,
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sampleWindow} onValueChange={setSampleWindow}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sample Window" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="season">Season</SelectItem>
              <SelectItem value="l5">L5</SelectItem>
              <SelectItem value="l10">L10</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={preset} onValueChange={setPreset}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Preset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="shooting">Shooting Types</SelectItem>
              <SelectItem value="possession">Possessions & Chains</SelectItem>
              <SelectItem value="transition">Transition</SelectItem>
              <SelectItem value="discipline">Discipline</SelectItem>
              <SelectItem value="context">Context/Exposure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary">Columns</Button>
          <Button variant="secondary">Saved Views</Button>
          <Button variant="secondary">Export</Button>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mode</span>
            <ToggleGroup type="single" value={triToggle} onValueChange={(v) => v && setTriToggle(v)}>
              <ToggleGroupItem value="attacking" aria-label="Attacking">
                Attacking
              </ToggleGroupItem>
              <ToggleGroupItem value="defending" aria-label="Defending">
                Defending
              </ToggleGroupItem>
              <ToggleGroupItem value="paired" aria-label="Paired">
                Paired
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rate</span>
            <ToggleGroup type="single" value={rateMode} onValueChange={(v) => v && setRateMode(v)}>
              <ToggleGroupItem value="per-match">Per match</ToggleGroupItem>
              <ToggleGroupItem value="per-100">Per 100</ToggleGroupItem>
              <ToggleGroupItem value="per-60">Per 60</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ChipToggle label="Opponent-adjusted" active={oppAdjusted} onClick={() => setOppAdjusted(!oppAdjusted)} />
          <ChipToggle label="Δ vs League" active={deltaVsLeague} onClick={() => setDeltaVsLeague(!deltaVsLeague)} />
          <ChipToggle label="Percentile" active={percentile} onClick={() => setPercentile(!percentile)} />
          <ChipToggle label="DIFF (Paired)" active={showDiffChip} onClick={() => setShowDiffChip(!showDiffChip)} />
        </div>
      </div>
    </div>
  )
}

function ChipToggle({ label, active, onClick }) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className="cursor-pointer select-none"
      onClick={onClick}
      aria-pressed={active}
      role="button"
    >
      {label}
    </Badge>
  )
}
