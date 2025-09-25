import React, { useMemo, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Lock, Unlock, Users, Replace, Search, Wind, Goal, Flag, Ruler, MapPin } from "lucide-react"
import { nanoid } from 'nanoid';



const FOOTBALL = "football"
const HURLING = "hurling"

const DEFAULT_RULESETS = [
    { id: "football_2025_frc_v2", label: "Football 2025 FRC v2", code: FOOTBALL },
    { id: "football_2024_comp_v1", label: "Football 2024 Competition v1", code: FOOTBALL },
    { id: "hurling_2025_v1", label: "Hurling 2025 v1", code: HURLING },
]

// Helpers
function MiniLabel({ children }) {
    return <p className="text-xs text-muted-foreground">{children}</p>
}

function FieldRow({ children }) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
}

function SectionTitle({ icon, title, desc }) {
    return (
        <div className="flex items-start gap-2">
            {icon || null}
            <div>
                <h3 className="text-sm font-medium text-balance">{title}</h3>
                {desc ? <p className="text-xs text-muted-foreground">{desc}</p> : null}
            </div>
        </div>
    )
}

function TeamPanel({ label, team, onSwap, allowSaveAsDefault, onToggleSaveDefault }) {
    const [searchOpen, setSearchOpen] = useState(null)
    const [query, setQuery] = useState("")

    const filteredBench = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return team.bench
        return team.bench.filter((p) => p.name.toLowerCase().includes(q) || String(p.jersey || "").includes(q))
    }, [team.bench, query])

    return (
        <div className="rounded-md border p-3">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold">{label}</h4>
                    <Badge variant="secondary" className="ml-1">
                        {team.name}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={`${team.id}-save-default`}
                        checked={allowSaveAsDefault}
                        onCheckedChange={(v) => onToggleSaveDefault(!!v)}
                    />
                    <Label htmlFor={`${team.id}-save-default`} className="text-xs text-muted-foreground">
                        Save as default panel
                    </Label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <MiniLabel>Starters (1–15)</MiniLabel>
                    <ScrollArea className="mt-2 h-40 rounded border">
                        <ul className="divide-y">
                            {team.starters.map((p) => (
                                <li key={p.id} className="flex items-center justify-between p-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="w-8 justify-center">
                                            {p.jersey ?? "—"}
                                        </Badge>
                                        <span className="text-sm">{p.name}</span>
                                    </div>

                                    <Popover open={searchOpen === p.id} onOpenChange={(open) => setSearchOpen(open ? p.id : null)}>
                                        <PopoverTrigger asChild>
                                            <Button size="sm" variant="outline" className="h-8 px-2 bg-transparent">
                                                <Replace className="mr-2 h-3.5 w-3.5" />
                                                Swap with bench
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0 w-72" align="end">
                                            <Command shouldFilter={false}>
                                                <CommandInput
                                                    placeholder="Search bench..."
                                                    value={query}
                                                    onValueChange={setQuery}
                                                    icon={<Search className="h-4 w-4" />}
                                                />
                                                <CommandList>
                                                    <CommandEmpty>No bench players found.</CommandEmpty>
                                                    <CommandGroup heading="Bench">
                                                        {filteredBench.map((b) => (
                                                            <CommandItem
                                                                key={b.id}
                                                                value={b.name}
                                                                onSelect={() => {
                                                                    onSwap(p.id, b.id)
                                                                    setQuery("")
                                                                    setSearchOpen(null)
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline" className="w-8 justify-center">
                                                                        {b.jersey ?? "—"}
                                                                    </Badge>
                                                                    <span>{b.name}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                </div>

                <div>
                    <MiniLabel>Bench</MiniLabel>
                    <ScrollArea className="mt-2 h-40 rounded border">
                        <ul className="divide-y">
                            {team.bench.map((p) => (
                                <li key={p.id} className="flex items-center justify-between p-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="w-8 justify-center">
                                            {p.jersey ?? "—"}
                                        </Badge>
                                        <span className="text-sm">{p.name}</span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">
                                        Off
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                    <MiniLabel>Tip: Type a name in the swap popover to replace a starter.</MiniLabel>
                </div>
            </div>
        </div>
    )
}

export default function PreMatchChecklistDialog({ open, onOpenChange, initialMatch, onSave }) {
    const [locked, setLocked] = useState(true)
    const [season, setSeason] = useState(initialMatch?.season || "2025")
    const [competition, setCompetition] = useState(initialMatch?.competition || "Senior League")
    const [round, setRound] = useState(initialMatch?.round || "Round 1")
    const [dateTime, setDateTime] = useState(initialMatch?.dateTime || new Date().toISOString().slice(0, 16))
    const [venue, setVenue] = useState(initialMatch?.venue || "Main Pitch")
    const [referee, setReferee] = useState(initialMatch?.referee || "Referee Name")
    const [code, setCode] = useState(initialMatch?.code || FOOTBALL)
    const [rulesetId, setRulesetId] = useState(initialMatch?.rulesetId || DEFAULT_RULESETS[0].id)
    const [venueType, setVenueType] = useState(initialMatch?.venueType || "neutral")

    const [footballToggles, setFootballToggles] = useState({
        twoPointArc: true,
        advancedMark: true,
        gkBackPassRestrict: true,
        tapAndGo: false,
        officialStopClock: false,
    })
    const [hurlingToggles, setHurlingToggles] = useState({
        sixtyFives: true,
    })

    const [endA_H1, setEndA_H1] = useState("left")
    const [windStrength, setWindStrength] = useState("none")
    const [windDirection, setWindDirection] = useState("l2r")

    const [teamA, setTeamA] = useState(
        initialMatch?.teamA || {
            id: "team-a",
            name: "Team A",
            starters: Array.from({ length: 15 }).map((_, i) => ({ id: `a-s-${i + 1}`, name: `A Player ${i + 1}`, jersey: i + 1 })),
            bench: Array.from({ length: 10 }).map((_, i) => ({ id: `a-b-${i + 1}`, name: `A Bench ${i + 1}`, jersey: i + 16 })),
        }
    )
    const [teamB, setTeamB] = useState(
        initialMatch?.teamB || {
            id: "team-b",
            name: "Team B",
            starters: Array.from({ length: 15 }).map((_, i) => ({ id: `b-s-${i + 1}`, name: `B Player ${i + 1}`, jersey: i + 1 })),
            bench: Array.from({ length: 10 }).map((_, i) => ({ id: `b-b-${i + 1}`, name: `B Bench ${i + 1}`, jersey: i + 16 })),
        }
    )
    const [saveAdefault, setSaveAdefault] = useState(false)
    const [saveBdefault, setSaveBdefault] = useState(false)

    function swapPlayer(team, starterId, benchId) {
        const cur = team === "A" ? teamA : teamB
        const starter = cur.starters.find((p) => p.id === starterId)
        const bench = cur.bench.find((p) => p.id === benchId)
        if (!starter || !bench) return

        const newStarters = cur.starters.map((p) => (p.id === starterId ? bench : p))
        const newBench = cur.bench.map((p) => (p.id === benchId ? starter : p))
        const nextTeam = { ...cur, starters: newStarters, bench: newBench }

        team === "A" ? setTeamA(nextTeam) : setTeamB(nextTeam)
    }

    const rulesetOptions = useMemo(() => DEFAULT_RULESETS.filter((r) => r.code === code), [code])

    function handleSave() {
        const match_context = {
            context_id : `Context_${nanoid(6)}`,
            match_id: '',
            season : '',
            competition_season_id : '',
            round_id : '',
            match_date_time : '',
            venue_id : '',
            referee_id: '',
            code : '',
            ruleset_version: '',
            periods_json: '',
            environment_json : '',
            ends_json: '',
            teamA_json: '',
            teamB_json: '',
            status: '',
            locked: false,
            locked_by: '',
            created_by: '',
            updated_by: '',
        }

        onSave?.(match_context)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[70vw]">

                <DialogHeader>
                    <DialogTitle className="text-balance">Pre‑Match Checklist</DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-3">
                    <div className="space-y-6">
                        {/* Metadata */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <SectionTitle
                                    icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                                    title="Match metadata"
                                    desc="Season, competition, date/time, venue, referee, code, ruleset"
                                />
                                <Button variant="ghost" size="sm" onClick={() => setLocked((v) => !v)}>
                                    {locked ? <Lock className="mr-2 h-4 w-4" /> : <Unlock className="mr-2 h-4 w-4" />}
                                    {locked ? "Locked" : "Editable"}
                                </Button>
                            </div>
                            <FieldRow>
                                <div className="space-y-2">
                                    <Label htmlFor="season">Season</Label>
                                    <Input id="season" value={season} onChange={(e) => setSeason(e.target.value)} disabled={locked} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="competition">Competition</Label>
                                    <Input
                                        id="competition"
                                        value={competition}
                                        onChange={(e) => setCompetition(e.target.value)}
                                        disabled={locked}
                                    />
                                </div>
                            </FieldRow>
                            <FieldRow>
                                <div className="space-y-2">
                                    <Label htmlFor="round">Round</Label>
                                    <Input id="round" value={round} onChange={(e) => setRound(e.target.value)} disabled={locked} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateTime">Date & time</Label>
                                    <Input
                                        id="dateTime"
                                        type="datetime-local"
                                        value={dateTime}
                                        onChange={(e) => setDateTime(e.target.value)}
                                        disabled={locked}
                                    />
                                </div>
                            </FieldRow>
                            <FieldRow>
                                <div className="space-y-2">
                                    <Label htmlFor="venue">Venue</Label>
                                    <Input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} disabled={locked} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="referee">Referee</Label>
                                    <Input id="referee" value={referee} onChange={(e) => setReferee(e.target.value)} disabled={locked} />
                                </div>
                            </FieldRow>

                            <FieldRow>
                                <div className="space-y-2">
                                    <Label>Code</Label>
                                    <RadioGroup
                                        className="grid grid-cols-2 gap-2"
                                        value={code}
                                        onValueChange={(v) => setCode(v)}
                                        disabled={locked}
                                    >
                                        <Label
                                            htmlFor="code-football"
                                            className={cn(
                                                "cursor-pointer rounded-md border px-3 py-2 text-sm",
                                                code === FOOTBALL && "border-primary",
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem id="code-football" value={FOOTBALL} />
                                                <Goal className="h-4 w-4" /> Football
                                            </div>
                                        </Label>
                                        <Label
                                            htmlFor="code-hurling"
                                            className={cn(
                                                "cursor-pointer rounded-md border px-3 py-2 text-sm",
                                                code === HURLING && "border-primary",
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem id="code-hurling" value={HURLING} />
                                                <Flag className="h-4 w-4" /> Hurling
                                            </div>
                                        </Label>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <Label>Ruleset version</Label>
                                    <Select value={rulesetId} onValueChange={setRulesetId} disabled={locked}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ruleset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DEFAULT_RULESETS.filter((r) => r.code === code).map((r) => (
                                                <SelectItem key={r.id} value={r.id}>
                                                    {r.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </FieldRow>

                            <div className="space-y-2">
                                <Label>Venue type</Label>
                                <RadioGroup
                                    className="grid grid-cols-3 gap-2"
                                    value={venueType}
                                    onValueChange={(v) => setVenueType(v)}
                                    disabled={locked}
                                >
                                    <Label
                                        htmlFor="venue-neutral"
                                        className={cn(
                                            "cursor-pointer rounded-md border px-3 py-2 text-sm",
                                            venueType === "neutral" && "border-primary",
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem id="venue-neutral" value="neutral" />
                                            Neutral
                                        </div>
                                    </Label>
                                    <Label
                                        htmlFor="venue-a"
                                        className={cn(
                                            "cursor-pointer rounded-md border px-3 py-2 text-sm",
                                            venueType === "a_home" && "border-primary",
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem id="venue-a" value="a_home" />
                                            Team A Home
                                        </div>
                                    </Label>
                                    <Label
                                        htmlFor="venue-b"
                                        className={cn(
                                            "cursor-pointer rounded-md border px-3 py-2 text-sm",
                                            venueType === "b_home" && "border-primary",
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem id="venue-b" value="b_home" />
                                            Team B Home
                                        </div>
                                    </Label>
                                </RadioGroup>
                            </div>
                        </div>

                        <Separator />

                        {/* Code-aware rules */}
                        <div className="space-y-3">
                            <SectionTitle
                                icon={<Ruler className="h-4 w-4 text-muted-foreground" />}
                                title="Rules toggles (code-aware)"
                                desc={code === FOOTBALL ? "Football-only toggles shown" : "Hurling-only toggles shown"}
                            />
                            {code === FOOTBALL ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="text-sm font-medium">Two-point arc</p>
                                            <MiniLabel>Football-only</MiniLabel>
                                        </div>
                                        <Switch
                                            checked={footballToggles.twoPointArc}
                                            onCheckedChange={(v) => setFootballToggles((s) => ({ ...s, twoPointArc: v }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="text-sm font-medium">Advanced mark</p>
                                            <MiniLabel>Football-only</MiniLabel>
                                        </div>
                                        <Switch
                                            checked={footballToggles.advancedMark}
                                            onCheckedChange={(v) => setFootballToggles((s) => ({ ...s, advancedMark: v }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="text-sm font-medium">Goalkeeper back-pass restriction</p>
                                            <MiniLabel>Football-only</MiniLabel>
                                        </div>
                                        <Switch
                                            checked={footballToggles.gkBackPassRestrict}
                                            onCheckedChange={(v) => setFootballToggles((s) => ({ ...s, gkBackPassRestrict: v }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="text-sm font-medium">Tap-and-Go (Solo & Go)</p>
                                            <MiniLabel>Football-only</MiniLabel>
                                        </div>
                                        <Switch
                                            checked={footballToggles.tapAndGo}
                                            onCheckedChange={(v) => setFootballToggles((s) => ({ ...s, tapAndGo: v }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="text-sm font-medium">Official stop-clock / hooter</p>
                                            <MiniLabel>Football-only</MiniLabel>
                                        </div>
                                        <Switch
                                            checked={footballToggles.officialStopClock}
                                            onCheckedChange={(v) => setFootballToggles((s) => ({ ...s, officialStopClock: v }))}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="text-sm font-medium">65s exist</p>
                                            <MiniLabel>Hurling-only</MiniLabel>
                                        </div>
                                        <Switch
                                            checked={hurlingToggles.sixtyFives}
                                            onCheckedChange={(v) => setHurlingToggles((s) => ({ ...s, sixtyFives: v }))}
                                        />
                                    </div>
                                    <div className="rounded-md border p-3">
                                        <p className="text-sm font-medium">Two-point arc does not apply</p>
                                        <MiniLabel>Hurling-only (informational)</MiniLabel>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Ends & wind */}
                        <div className="space-y-3">
                            <SectionTitle
                                icon={<Wind className="h-4 w-4 text-muted-foreground" />}
                                title="Field ends & wind"
                                desc="Capture ends for H1 (H2 flips) and wind direction by half"
                            />

                            <div className="space-y-2">
                                <Label className="text-sm">{"Team A attacks: Left ▾ / Right ▾ in H1"}</Label>
                                <RadioGroup
                                    className="grid grid-cols-2 gap-2"
                                    value={endA_H1}
                                    onValueChange={(v) => setEndA_H1(v)}
                                >
                                    <Label
                                        htmlFor="end-left"
                                        className={cn(
                                            "cursor-pointer rounded-md border px-3 py-2 text-sm",
                                            endA_H1 === "left" && "border-primary",
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem id="end-left" value="left" />
                                            Left in H1
                                        </div>
                                    </Label>
                                    <Label
                                        htmlFor="end-right"
                                        className={cn(
                                            "cursor-pointer rounded-md border px-3 py-2 text-sm",
                                            endA_H1 === "right" && "border-primary",
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem id="end-right" value="right" />
                                            Right in H1
                                        </div>
                                    </Label>
                                </RadioGroup>
                                <MiniLabel>Team B automatically attacks the opposite end. H2 flips automatically.</MiniLabel>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Wind strength</Label>
                                    <Select value={windStrength} onValueChange={(v) => setWindStrength(v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select strength" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="strong">Strong</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <Label>Wind direction (relative to mini-pitch)</Label>
                                    <RadioGroup
                                        className="grid grid-cols-2 gap-2"
                                        value={windDirection}
                                        onValueChange={(v) => setWindDirection(v)}
                                        disabled={windStrength === "none"}
                                    >
                                        <Label
                                            htmlFor="wind-l2r"
                                            className={cn(
                                                "cursor-pointer rounded-md border px-3 py-2 text-sm",
                                                windDirection === "l2r" && windStrength !== "none" && "border-primary",
                                                windStrength === "none" && "opacity-50",
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem id="wind-l2r" value="l2r" />
                                                {"Left → Right"}
                                            </div>
                                        </Label>
                                        <Label
                                            htmlFor="wind-r2l"
                                            className={cn(
                                                "cursor-pointer rounded-md border px-3 py-2 text-sm",
                                                windDirection === "r2l" && windStrength !== "none" && "border-primary",
                                                windStrength === "none" && "opacity-50",
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem id="wind-r2l" value="r2l" />
                                                {"Right → Left"}
                                            </div>
                                        </Label>
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Teams */}
                        <div className="space-y-3">
                            <SectionTitle
                                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                                title="Team panels"
                                desc="Starters 1–15 pre-ticked; quick swaps; typeahead search"
                            />
                            <div className="grid grid-cols-1 gap-4">
                                <TeamPanel
                                    label="Team A"
                                    team={teamA}
                                    onSwap={(starterId, benchId) => swapPlayer("A", starterId, benchId)}
                                    allowSaveAsDefault={saveAdefault}
                                    onToggleSaveDefault={setSaveAdefault}
                                />
                                <TeamPanel
                                    label="Team B"
                                    team={teamB}
                                    onSwap={(starterId, benchId) => swapPlayer("B", starterId, benchId)}
                                    allowSaveAsDefault={saveBdefault}
                                    onToggleSaveDefault={setSaveBdefault}
                                />
                            </div>
                            <MiniLabel>On match start: Starters are On-field at H1 00:00; bench is Off until substituted.</MiniLabel>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save & Start Match</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
