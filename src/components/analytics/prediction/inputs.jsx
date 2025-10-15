"use client"

import { useCallback } from "react"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Slider } from "../../ui/slider"
import { Switch } from "../../ui/switch"
import { Separator } from "../../ui/separator"

function PercentSlider({ value, onChange }) {
  return <Slider value={[value]} min={0} max={100} step={1} onValueChange={(v) => onChange(v[0])} className="w-full" />
}

export default function Inputs(props) {
  const {
    teams,
    venues,
    refs,
    filters,
    onFilters,
    teamA,
    setTeamA,
    teamB,
    setTeamB,
    venue,
    setVenue,
    refId,
    setRefId,
    paceOverride,
    setPaceOverride,
    twoPtDeltaA,
    setTwoPtDeltaA,
    twoPtDeltaB,
    setTwoPtDeltaB,
    freeConvAdj2135A,
    setFreeConvAdj2135A,
    freeConvAdj2135B,
    setFreeConvAdj2135B,
    koMixA,
    setKoMixA,
    koMixB,
    setKoMixB,
    pressIntensity,
    setPressIntensity,
    environment,
    setEnvironment,
    enableMC,
    setEnableMC,
    mcSamples,
    setMcSamples,
  } = props

  const setMix = useCallback(
    (side, key, val) => {
      const cur = side === "A" ? koMixA : koMixB
      const next = { ...cur, [key]: val }
      const sum = Math.max(1, next.s + next.m + next.l)
      const norm = {
        s: Math.round((next.s / sum) * 100),
        m: Math.round((next.m / sum) * 100),
        l: Math.round((next.l / sum) * 100),
      }
      if (side === "A") setKoMixA(norm)
      else setKoMixB(norm)
    },
    [koMixA, koMixB, setKoMixA, setKoMixB],
  )

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>Team A</Label>
          <Select value={teamA} onValueChange={setTeamA}>
            <SelectTrigger>
              <SelectValue placeholder="Choose Team A" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Team B</Label>
          <Select value={teamB} onValueChange={setTeamB}>
            <SelectTrigger>
              <SelectValue placeholder="Choose Team B" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Venue</Label>
          <Select value={venue} onValueChange={setVenue}>
            <SelectTrigger>
              <SelectValue placeholder="Venue" />
            </SelectTrigger>
            <SelectContent>
              {venues.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Referee</Label>
          <Select value={refId} onValueChange={setRefId}>
            <SelectTrigger>
              <SelectValue placeholder="Average ref" />
            </SelectTrigger>
            <SelectContent>
              {refs.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Code</Label>
          <Select value={filters.code} onValueChange={(v) => onFilters({ ...filters, code: v })}>
            <SelectTrigger>
              <SelectValue placeholder="FB/Hur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FB">Football</SelectItem>
              <SelectItem value="Hur">Hurling</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Season</Label>
          <Input
            value={filters.season}
            onChange={(e) => onFilters({ ...filters, season: e.target.value })}
            placeholder="2025"
          />
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-3">
          <Label>Pace override (−5…+5 possessions)</Label>
          <Slider value={[paceOverride]} min={-5} max={5} step={1} onValueChange={(v) => setPaceOverride(v[0])} />
          <div className="text-sm text-muted-foreground">
            Current: {paceOverride > 0 ? "+" : ""}
            {paceOverride}
          </div>
        </div>

        <div className="grid gap-3">
          <Label>Press intensity (−5…+5)</Label>
          <Slider value={[pressIntensity]} min={-5} max={5} step={1} onValueChange={(v) => setPressIntensity(v[0])} />
          <div className="text-sm text-muted-foreground">
            Current: {pressIntensity > 0 ? "+" : ""}
            {pressIntensity}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-3">
          <Label>(FB) 2-pt attempts Δ (Team A) %</Label>
          <Slider value={[twoPtDeltaA]} min={-20} max={20} step={1} onValueChange={(v) => setTwoPtDeltaA(v[0])} />
          <div className="text-sm text-muted-foreground">
            {twoPtDeltaA > 0 ? "+" : ""}
            {twoPtDeltaA}%
          </div>
        </div>
        <div className="grid gap-3">
          <Label>(FB) 2-pt attempts Δ (Team B) %</Label>
          <Slider value={[twoPtDeltaB]} min={-20} max={20} step={1} onValueChange={(v) => setTwoPtDeltaB(v[0])} />
          <div className="text-sm text-muted-foreground">
            {twoPtDeltaB > 0 ? "+" : ""}
            {twoPtDeltaB}%
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-3">
          <Label>Free conv adj (21–35m) pp — Team A</Label>
          <Slider
            value={[freeConvAdj2135A]}
            min={-10}
            max={10}
            step={1}
            onValueChange={(v) => setFreeConvAdj2135A(v[0])}
          />
          <div className="text-sm text-muted-foreground">
            {freeConvAdj2135A > 0 ? "+" : ""}
            {freeConvAdj2135A} pp
          </div>
        </div>
        <div className="grid gap-3">
          <Label>Free conv adj (21–35m) pp — Team B</Label>
          <Slider
            value={[freeConvAdj2135B]}
            min={-10}
            max={10}
            step={1}
            onValueChange={(v) => setFreeConvAdj2135B(v[0])}
          />
          <div className="text-sm text-muted-foreground">
            {freeConvAdj2135B > 0 ? "+" : ""}
            {freeConvAdj2135B} pp
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label>KO/PO mix — Team A (S/M/L)</Label>
          <div className="grid gap-2 mt-2">
            <div className="flex items-center gap-3">
              <span className="w-8 text-sm">S</span>
              <PercentSlider value={koMixA.s} onChange={(v) => setMix("A", "s", v)} />
              <span className="w-10 text-right text-sm">{koMixA.s}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 text-sm">M</span>
              <PercentSlider value={koMixA.m} onChange={(v) => setMix("A", "m", v)} />
              <span className="w-10 text-right text-sm">{koMixA.m}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 text-sm">L</span>
              <PercentSlider value={koMixA.l} onChange={(v) => setMix("A", "l", v)} />
              <span className="w-10 text-right text-sm">{koMixA.l}%</span>
            </div>
          </div>
        </div>
        <div>
          <Label>KO/PO mix — Team B (S/M/L)</Label>
          <div className="grid gap-2 mt-2">
            <div className="flex items-center gap-3">
              <span className="w-8 text-sm">S</span>
              <PercentSlider value={koMixB.s} onChange={(v) => setMix("B", "s", v)} />
              <span className="w-10 text-right text-sm">{koMixB.s}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 text-sm">M</span>
              <PercentSlider value={koMixB.m} onChange={(v) => setMix("B", "m", v)} />
              <span className="w-10 text-right text-sm">{koMixB.m}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 text-sm">L</span>
              <PercentSlider value={koMixB.l} onChange={(v) => setMix("B", "l", v)} />
              <span className="w-10 text-right text-sm">{koMixB.l}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="grid gap-2">
          <Label>Wind</Label>
          <Select value={environment.wind} onValueChange={(v) => setEnvironment({ ...environment, wind: v })}>
            <SelectTrigger>
              <SelectValue placeholder="neutral" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tail">Tail</SelectItem>
              <SelectItem value="head">Head</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Surface</Label>
          <Select value={environment.surface} onValueChange={(v) => setEnvironment({ ...environment, surface: v })}>
            <SelectTrigger>
              <SelectValue placeholder="standard" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="soft">Soft</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Time</Label>
          <Select value={environment.dayNight} onValueChange={(v) => setEnvironment({ ...environment, dayNight: v })}>
            <SelectTrigger>
              <SelectValue placeholder="day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="night">Night</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch checked={enableMC} onCheckedChange={setEnableMC} id="enableMC" />
          <Label htmlFor="enableMC">Enable Monte Carlo</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label>Samples</Label>
          <Input
            type="number"
            min={200}
            max={20000}
            step={100}
            value={mcSamples}
            onChange={(e) => setMcSamples(Number(e.target.value || 2000))}
            className="w-28"
          />
        </div>
      </div>
    </div>
  )
}
