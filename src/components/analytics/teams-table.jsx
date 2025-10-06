
import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowUpDown, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

function SortHeader({ id, label, sort, onSortChange }) {
    const current = sort.find((s) => s.id === id)
    const desc = current?.desc
    return (
        <button
            onClick={(e) => {
                const isMulti = e.shiftKey
                const nextDir = !current ? true : !desc
                const next = isMulti ? [...sort.filter((s) => s.id !== id), { id, desc: nextDir }] : [{ id, desc: nextDir }]
                onSortChange(next)
            }}
            className="inline-flex items-center gap-1"
        >
            <span className="text-sm font-medium">{label}</span>
            <ArrowUpDown className={cn("h-3.5 w-3.5 opacity-60", current && "opacity-100 rotate-90")} />
        </button>
    )
}

function PctCell({ value, attempts, minN = 10 }) {
    const gated = attempts < minN
    const content = `${(value * 100).toFixed(1)}%`
    if (!gated) return <span>{content}</span>
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                        <TriangleAlert className="h-3.5 w-3.5 text-muted-foreground" />
                        {content}
                    </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    Hidden by Min-N: {attempts} attempts <br />
                    Values shown with caution.
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export default function TeamsTable({
    rows,
    view,
    rateMode,
    opponentAdjusted,
    activeGroups,
    showDiff,
    showDelta,
    showPercentile,
    visibleColumns,
    sort,
    onSortChange,
    onRowClick,
}) {
    const cols = useMemo(() => {
        const enabled = (id) => visibleColumns.find((c) => c.id === id)?.enabled

        const base = []

        // Team meta
        if (enabled("team")) base.push({ id: "team", label: "Team", render: (r) => r.team })

        // Scoring & Ratings
        if (activeGroups.includes("Scoring & Ratings")) {
            if (enabled("poss_for") && view !== "Defending")
                base.push({ id: "poss_for", label: "Poss (For)", render: (r) => r.poss_for })
            if (enabled("poss_against") && view !== "Attacking")
                base.push({ id: "poss_against", label: "Poss (Against)", render: (r) => r.poss_against })
            if (enabled("pace")) base.push({ id: "pace", label: "Pace (poss/60)", render: (r) => r.pace })

            if (view === "Paired") {
                if (enabled("ortg_for"))
                    base.push({ id: "ortg_for", label: "ORtg (For)", render: (r) => r.ortg_for.toFixed(1) })
                if (enabled("drtg_against"))
                    base.push({ id: "drtg_against", label: "DRtg (Against)", render: (r) => r.drtg_against.toFixed(1) })
                if (showDiff && enabled("net"))
                    base.push({ id: "net_diff", label: "Net DIFF", render: (r) => (r.ortg_for - r.drtg_against).toFixed(1) })
            } else if (view === "Attacking") {
                if (enabled("ortg_for")) base.push({ id: "ortg_for", label: "ORtg", render: (r) => r.ortg_for.toFixed(1) })
                if (enabled("two_pt_share"))
                    base.push({
                        id: "two_pt_share",
                        label: "2-pt Share",
                        render: (r) => <PctCell value={r.two_pt_share} attempts={r.two_pt_attempts} />,
                    })
            } else {
                if (enabled("drtg_against"))
                    base.push({ id: "drtg_against", label: "DRtg", render: (r) => r.drtg_against.toFixed(1) })
                if (enabled("opp_two_pt_share"))
                    base.push({
                        id: "opp_two_pt_share",
                        label: "Opp 2-pt Share",
                        render: (r) => <PctCell value={r.opp_two_pt_share} attempts={r.opp_two_pt_attempts} />,
                    })
            }
        }

        // Restarts
        if (activeGroups.includes("Restarts")) {
            if (view !== "Defending" && enabled("ko_short_own"))
                base.push({
                    id: "ko_short_own",
                    label: "Own KO Short%",
                    render: (r) => <PctCell value={r.ko_short_own} attempts={r.ko_short_own_att} minN={8} />,
                })
            if (view !== "Attacking" && enabled("ko_short_opp"))
                base.push({
                    id: "ko_short_opp",
                    label: "Opp KO Short%",
                    render: (r) => <PctCell value={r.ko_short_opp} attempts={r.ko_short_opp_att} minN={8} />,
                })
            if (view === "Paired" && showDiff && enabled("ko_short_diff"))
                base.push({
                    id: "ko_short_diff",
                    label: "KO Short DIFF",
                    render: (r) => ((r.ko_short_own - r.ko_short_opp) * 100).toFixed(1) + "%",
                })
        }

        // Transition
        if (activeGroups.includes("Transition")) {
            if (view !== "Defending" && enabled("to_shot_15_for"))
                base.push({
                    id: "to_shot_15_for",
                    label: "TO→Shot ≤15s",
                    render: (r) => <PctCell value={r.to_shot_15_for} attempts={r.to_att_for} />,
                })
            if (view !== "Attacking" && enabled("to_shot_15_against"))
                base.push({
                    id: "to_shot_15_against",
                    label: "Opp TO→Shot ≤15s",
                    render: (r) => <PctCell value={r.to_shot_15_against} attempts={r.to_att_against} />,
                })
            if (view === "Paired" && showDiff && enabled("to_shot_15_diff"))
                base.push({
                    id: "to_shot_15_diff",
                    label: "TO→Shot DIFF",
                    render: (r) => ((r.to_shot_15_for - r.to_shot_15_against) * 100).toFixed(1) + "%",
                })
        }

        return base
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeGroups, visibleColumns, view, showDiff])

    const sortableIds = cols.map((c) => c.id)

    return (
        <div className="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {cols.map((c) => (
                            <TableHead key={c.id} className="whitespace-nowrap">
                                {sortableIds.includes(c.id) ? (
                                    <SortHeader id={c.id} label={c.label} sort={sort} onSortChange={onSortChange} />
                                ) : (
                                    <span className="text-sm font-medium">{c.label}</span>
                                )}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((r) => (
                        <TableRow key={r.team} className="cursor-pointer hover:bg-accent/30" onClick={() => onRowClick(r)}>
                            {cols.map((c) => (
                                <TableCell key={c.id} className="whitespace-nowrap">
                                    {c.render(r)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {opponentAdjusted && (
                <div className="p-2 text-xs text-muted-foreground">
                    Opponent-adjusted note: displayed values reflect schedule-strength overlay (visual only in this demo).
                </div>
            )}
            {(showDelta || showPercentile) && (
                <div className="p-2 text-xs text-muted-foreground">
                    Δ vs League and Percentile indicators are context-gated; shown when enabled in presets or column configs.
                </div>
            )}
        </div>
    )
}
