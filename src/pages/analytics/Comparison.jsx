
import { useMemo, useState, useCallback, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom";
import ComparisonTable from "../../components/analytics/comparison/comparison-table"

const DEFAULT_FILTERS = {
    season: "2025",
    competition: "League",
    grade: "Senior",
    stage: "Regular",
    venue: "Any",
    gameState: "Any",
    sampleWindow: "Last 10",
    rateMode: "perMatch",
}

const METRIC_KEYS = ["attack", "defense", "shooting", "transitions", "discipline", "context"]

export default function ComparisonPage() {
    const router = useNavigate()
    const search = useSearchParams()
    const [filters, setFilters] = useState(DEFAULT_FILTERS)

    // hydrate from URL query
    // useEffect(() => {
    //     const next = { ...DEFAULT_FILTERS }
    //     for (const k of Object.keys(DEFAULT_FILTERS)) {
    //         const v = search.get(k)
    //         if (v != null) next[k] = v
    //     }
    //     setFilters(next)
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [])

    const pushFiltersToUrl = useCallback(
        (f) => {
            const params = new URLSearchParams()
            Object.entries(f).forEach(([k, v]) => params.set(k, String(v)))
            router.replace(`/comparison?${params.toString()}`)
        },
        [router],
    )

    const onFiltersChange = (f) => {
        setFilters(f)
        pushFiltersToUrl(f)
    }

    // Mock league averages (per metric For/Against)
    const leagueAverages = useMemo(
        () => ({
            attack: { for: 1.2, against: 1.2 },
            defense: { for: 0.9, against: 0.9 },
            shooting: { for: 0.48, against: 0.48 },
            transitions: { for: 0.6, against: 0.6 },
            discipline: { for: -0.2, against: -0.2 },
            context: { for: 0.0, against: 0.0 },
        }),
        [],
    )

    // Mock entities (teams/players) with paired For/Against values and sample size n per metric
    const entities = useMemo(
        () => [
            {
                id: "A",
                name: "Team A",
                samples: 42,
                metrics: {
                    attack: { for: 1.35, against: 1.1, n: 42 },
                    defense: { for: 0.92, against: 0.85, n: 42 },
                    shooting: { for: 0.52, against: 0.49, n: 40 },
                    transitions: { for: 0.67, against: 0.58, n: 35 },
                    discipline: { for: -0.1, against: -0.15, n: 42 },
                    context: { for: 0.02, against: -0.01, n: 42 },
                },
            },
            {
                id: "B",
                name: "Team B",
                samples: 37,
                metrics: {
                    attack: { for: 1.22, against: 1.18, n: 37 },
                    defense: { for: 0.97, against: 0.95, n: 37 },
                    shooting: { for: 0.49, against: 0.5, n: 30 },
                    transitions: { for: 0.61, against: 0.62, n: 28 },
                    discipline: { for: -0.18, against: -0.25, n: 37 },
                    context: { for: -0.03, against: 0.01, n: 37 },
                },
            },
            {
                id: "C",
                name: "Team C",
                samples: 18, // low sample to demo Min-N greying
                metrics: {
                    attack: { for: 1.1, against: 1.25, n: 18 },
                    defense: { for: 1.05, against: 1.12, n: 18 },
                    shooting: { for: 0.45, against: 0.51, n: 15 },
                    transitions: { for: 0.55, against: 0.66, n: 16 },
                    discipline: { for: -0.3, against: -0.4, n: 18 },
                    context: { for: -0.05, against: 0.06, n: 18 },
                },
            },
        ],
        [],
    )

    const [selected, setSelected] = useState(null) // entity for profile panel
    const [cellDrill, setCellDrill] = useState(null)

    return (
        <main className="min-h-dvh bg-background text-foreground">

            <div className="mx-auto max-w-6xl px-4 py-6 grid gap-6">
                <div className="rounded-lg border bg-card p-4">
                    <h2 className="text-lg font-semibold">Comparison</h2>
                    <p className="text-sm text-muted-foreground">
                        Compare teams/players side-by-side. Click headers to sort, shift-click for multi-sort. Toggle columns with
                        the chips.
                    </p>
                </div>

                <ComparisonTable
                    entities={entities}
                    columns={METRIC_KEYS}
                    leagueAverages={leagueAverages}
                    showDiff
                    showDeltaLeague
                    showPercentiles
                    minN={30}
                    onRowDrill={(e) => setSelected(e)}
                    onCellDrill={(info) => setCellDrill(info)}
                />

                {(selected || cellDrill) && (
                    <section className="rounded-lg border bg-card p-4">
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="text-base font-semibold">Profile Panel</h3>
                            <button
                                className="rounded-md border px-3 py-1 text-sm"
                                onClick={() => {
                                    setSelected(null)
                                    setCellDrill(null)
                                }}
                            >
                                Close
                            </button>
                        </div>

                        {selected && (
                            <div className="mt-3 grid gap-2">
                                <div className="text-sm text-muted-foreground">Row Drill</div>
                                <div className="rounded-md border p-3">
                                    <div className="font-medium">{selected.name}</div>
                                    <div className="text-sm text-muted-foreground">Samples: {selected.samples}</div>
                                    <div className="mt-2 text-sm">
                                        Use this area to show sub-tables: set pieces, restarts, transitions detail, etc.
                                    </div>
                                </div>
                            </div>
                        )}

                        {cellDrill && (
                            <div className="mt-4 grid gap-2">
                                <div className="text-sm text-muted-foreground">Cell Drill</div>
                                <div className="rounded-md border p-3">
                                    <div className="font-medium">
                                        {cellDrill.entity.name} • {cellDrill.metricKey} • {cellDrill.facet}
                                    </div>
                                    <div className="mt-2 text-sm">
                                        Pre-filtered panel for this metric. Add charts or deeper splits here.
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </main>
    )
}
