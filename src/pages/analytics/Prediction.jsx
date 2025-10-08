
import { useEffect, useMemo, useState, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom";
import PredictionOutput from "../../components/analytics/prediction/prediction-output"
import MarketCompare from "../../components/analytics/prediction/market-compare"

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

export default function PredictionPage() {
    const router = useNavigate()
    const search = useSearchParams()
    const [filters, setFilters] = useState(DEFAULT_FILTERS)

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
            router.replace(`/prediction?${params.toString()}`)
        },
        [router],
    )

    const onFiltersChange = (f) => {
        setFilters(f)
        pushFiltersToUrl(f)
    }

    // Mock predicted output (could come from server action/SWR)
    const teamA = "Team A"
    const teamB = "Team B"

    const prediction = useMemo(() => {
        // Simple illustration using filters to nudge values
        const isPer100 = filters.rateMode === "per100"
        const factor = isPer100 ? 1.2 : 1.0

        const scoreA = 1.18 * factor
        const scoreB = 1.15 * factor

        // Normalize win prob to sum to ~1
        let pA = 0.6
        let pB = 0.4
        if (filters.venue === "Home") pA += 0.03
        if (filters.venue === "Away") pA -= 0.03
        pA = Math.min(Math.max(pA, 0.05), 0.95)
        pB = 1 - pA

        const drivers = [
            { label: "Transition Efficiency", impact: +0.12, note: "Faster TO→Shot sequences within 15s" },
            { label: "Set-piece Accuracy", impact: +0.06, note: "Better conversion on restarts and set plays" },
            { label: "Kick-out Retention", impact: +0.04, note: "Superior short/medium restart security" },
            { label: "Shot Quality Allowed", impact: -0.03, note: "Concedes moderate quality looks" },
        ]

        return {
            scoreline: { a: scoreA, b: scoreB },
            winProb: { a: pA, b: pB },
            drivers,
        }
    }, [filters])

    // Mock market odds for compare
    const odds = { a: 1.9, b: 2.1 }

    return (
        <main className="min-h-dvh bg-background text-foreground">
            <div className="mx-auto max-w-6xl px-4 py-6 grid gap-6">
                <div className="rounded-lg border bg-card p-4">
                    <h2 className="text-lg font-semibold">Prediction</h2>
                    <p className="text-sm text-muted-foreground">
                        Inherits filters from Comparison/Teams. Shows projected scoreline, win probabilities, and key drivers.
                    </p>
                </div>

                <PredictionOutput
                    teamA={teamA}
                    teamB={teamB}
                    scoreline={prediction.scoreline}
                    winProb={prediction.winProb}
                    drivers={prediction.drivers}
                />

                <MarketCompare teamA={teamA} teamB={teamB} predicted={prediction.winProb} odds={odds} />
            </div>
        </main>
    )
}
