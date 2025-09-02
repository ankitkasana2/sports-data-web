import { useMemo, useState } from "react"
import { useLive } from "./LiveContext"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"

function TeamPanelEditor({ label, value, onChange }) {
  const add = () => onChange([...value, { jersey: (value[value.length - 1]?.jersey ?? 0) + 1, name: "" }])
  const set = (idx, patch) => onChange(value.map((p, i) => (i === idx ? { ...p, ...patch } : p)))
  const remove = (idx) => onChange(value.filter((_, i) => i !== idx))
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{label} Panel (1–26)</h4>
        <Button size="sm" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
      <div className="grid grid-cols-12 gap-2">
        {value.map((p, i) => (
          <div key={i} className="col-span-12 grid grid-cols-12 gap-2 items-center">
            <Input
              className="col-span-3"
              type="number"
              min={1}
              max={99}
              value={p.jersey}
              onChange={(e) => set(i, { jersey: Number(e.target.value) || 0 })}
              placeholder="#"
            />
            <Input
              className="col-span-7"
              value={p.name}
              onChange={(e) => set(i, { name: e.target.value })}
              placeholder="Player name"
            />
            <div className="col-span-1 flex items-center justify-center">
              <Switch checked={!!p.starting} onCheckedChange={(v) => set(i, { starting: v })} />
            </div>
            <div className="col-span-1 flex items-center justify-end">
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
                ✕
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">Toggle to flag a starter.</div>
    </div>
  )
}

export function PreMatchDialog() {
  const { state, dispatch } = useLive()

  // Open if user hasn't saved pre-match yet or if explicitly reopened
  const open = !!(state.ui.preMatchOpen || !state.preMatch)

  const [competition, setCompetition] = useState(state.preMatch?.competition ?? "")
  const [round, setRound] = useState(state.preMatch?.round ?? "")
  const [season, setSeason] = useState(state.preMatch?.season ?? new Date().getFullYear())
  const [date, setDate] = useState(state.preMatch?.date ?? new Date().toISOString().slice(0, 10))
  const [throwInLocal, setThrowInLocal] = useState(state.preMatch?.throwInLocal ?? "15:00")

  const [venueName, setVenueName] = useState(state.preMatch?.venue?.name ?? "")
  const [refName, setRefName] = useState(state.preMatch?.referee?.name ?? "")

  const [wind, setWind] = useState(state.preMatch?.weather?.wind ?? "light")
  const [rain, setRain] = useState(state.preMatch?.weather?.rain ?? "none")
  const [teamAEnd1H1, setTeamAEnd1H1] = useState(state.preMatch?.windOrientationTeamAAttacksEnd1H1 ?? true)

  // Rules
  const [twoPointArc, setTwoPointArc] = useState(state.preMatch?.rules?.twoPointArc ?? true)
  const [officialStopClock, setOfficialStopClock] = useState(state.preMatch?.rules?.officialStopClock ?? true)
  const [advancedMark, setAdvancedMark] = useState(state.preMatch?.rules?.advancedMark ?? true)
  const [tapAndGo, setTapAndGo] = useState(state.preMatch?.rules?.tapAndGo ?? true)
  const [gkBackPass, setGkBackPass] = useState(state.preMatch?.rules?.gkBackPassRestriction ?? true)
  const [extraTime, setExtraTime] = useState(state.preMatch?.rules?.extraTime ?? false)
  const [penalties, setPenalties] = useState(state.preMatch?.rules?.penalties ?? false)

  // Panels – light implementation; user can add up to 26
  const [panelA, setPanelA] = useState(
    state.preMatch?.panels?.teamA ?? Array.from({ length: 3 }).map((_, i) => ({ jersey: i + 1, name: "" })), // start short; add more as needed
  )
  const [panelB, setPanelB] = useState(
    state.preMatch?.panels?.teamB ?? Array.from({ length: 3 }).map((_, i) => ({ jersey: i + 1, name: "" })),
  )

  const canStart = useMemo(() => !!competition && !!date, [competition, date])

  const onStart = () => {
    console.log(!canStart)
    if (!canStart) return
    dispatch({
      type: "SAVE_PREMATCH",
      data: {
        competition,
        round,
        season,
        date,
        throwInLocal,
        venue: { name: venueName },
        referee: { name: refName },
        weather: { wind, rain },
        windOrientationTeamAAttacksEnd1H1: teamAEnd1H1,
        rules: {
          rulePackLabel: "2025_Football",
          twoPointArc,
          officialStopClock,
          advancedMark,
          tapAndGo,
          gkBackPassRestriction: gkBackPass,
          kickoutBeyond40Info: true,
          extraTime,
          penalties,
          pitchPreset: "football",
          xyGrid: "0-100",
        },
        panels: {
          teamA: panelA.slice(0, 26),
          teamB: panelB.slice(0, 26),
        },
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => dispatch({ type: "OPEN_PREMATCH", open: o })} >
      <DialogContent className="min-w-[80vw] max-h-[80vh]">
        <DialogHeader className="top-0 sticky bg-background">
          <DialogTitle>Pre-Match Checklist</DialogTitle>
        </DialogHeader>
        <div className="h-[60vh] overflow-y-scroll">
        {/* Competition & Context */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Competition & Context</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <Label>Competition</Label>
              <Input value={competition} onChange={(e) => setCompetition(e.target.value)} placeholder="Competition" />
            </div>
            <div className="grid gap-1">
              <Label>Round</Label>
              <Input value={round} onChange={(e) => setRound(e.target.value)} placeholder="Round" />
            </div>
            <div className="grid gap-1">
              <Label>Season (YYYY)</Label>
              <Input
                type="number"
                value={season ?? ""}
                onChange={(e) => setSeason(Number(e.target.value) || undefined)}
                placeholder="2025"
              />
            </div>
            <div className="grid gap-1">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Throw-in time (local)</Label>
              <Input type="time" value={throwInLocal} onChange={(e) => setThrowInLocal(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Venue (name)</Label>
              <Input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Venue" />
            </div>
            <div className="grid gap-1">
              <Label>Referee (name)</Label>
              <Input value={refName} onChange={(e) => setRefName(e.target.value)} placeholder="Referee" />
            </div>

            <div className="grid gap-1">
              <Label>Wind</Label>
              <Select value={wind} onValueChange={(v) => setWind(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="med">Medium</SelectItem>
                  <SelectItem value="strong">Strong</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Rain</Label>
              <Select value={rain} onValueChange={(v) => setRain(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="drizzle">Drizzle</SelectItem>
                  <SelectItem value="showers">Showers</SelectItem>
                  <SelectItem value="heavy">Heavy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-2">
            <Label>Wind orientation: Team A attacks End 1 in H1</Label>
            <Switch checked={teamAEnd1H1} onCheckedChange={setTeamAEnd1H1} />
          </div>
        </section>

        {/* Teams & Panels */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Teams & Panels</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <TeamPanelEditor label={`${state.teamA.name}`} value={panelA} onChange={setPanelA} />
            <TeamPanelEditor label={`${state.teamB.name}`} value={panelB} onChange={setPanelB} />
          </div>
        </section>

        {/* Rules & Field Markings */}
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Rules & Field Markings</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <ToggleRow label="Two-point arc enabled" checked={twoPointArc} onChange={setTwoPointArc} />
            <ToggleRow
              label="Official stop-clock / hooter"
              checked={officialStopClock}
              onChange={setOfficialStopClock}
            />
            <ToggleRow label="Advanced mark enabled" checked={advancedMark} onChange={setAdvancedMark} />
            <ToggleRow label="Tap-and-Go (Solo & Go)" checked={tapAndGo} onChange={setTapAndGo} />
            <ToggleRow label="GK back-pass restriction" checked={gkBackPass} onChange={setGkBackPass} />
            <ToggleRow label="Extra time available?" checked={extraTime} onChange={setExtraTime} />
            <ToggleRow label="Penalties?" checked={penalties} onChange={setPenalties} />
          </div>
          <p className="text-xs text-muted-foreground">
            Kick-out must travel beyond 40m arc: informational (enforced via violation tag). Pitch geometry preset:
            football; XY grid stored 0–100.
          </p>
        </section>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => dispatch({ type: "OPEN_PREMATCH", open: false })}>
            Cancel
          </Button>
          <Button onClick={onStart} disabled={!canStart}>
            Start Match → H1 00:00
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-2">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export default PreMatchDialog
