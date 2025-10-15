"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import TopControls from "../../components/analytics/comparison/top-controls"
import EntityTray from "../../components/analytics/comparison/entity-tray"
import ModeTabs from "../../components/analytics/comparison/mode-tabs"
import AutoEdges from "../../components/analytics/comparison/auto-edges"
import H2HFilters from "../../components/analytics/comparison/h2h-filters"
import MetricsTable from "../../components/analytics/comparison/metrics-table"
import DiffTable from "../../components/analytics/comparison/diff-table"
import ExportButton from "../../components/analytics/comparison/export-button"
import {
  SAMPLE_ENTITIES,
  SAMPLE_METRICS,
  PRACTICAL_THRESHOLDS,
  DEFAULT_STATE,
  computeDiffs,
  computeAutoEdges,
  applyTriToggleMask,
} from "@/lib/comparison-data"

export default function ComparisonPage() {
  // URL state
  const [searchParams, setSearchParams] = useSearchParams()
  const router = useNavigate()
  const pathname = useLocation()

  const [entityType, setEntityType] = useState(searchParams.get("type") || DEFAULT_STATE.entityType)
  const [entities, setEntities] = useState(() => {
    const ids = (searchParams.get("ids") || "").split(",").filter(Boolean)
    const library = SAMPLE_ENTITIES[entityType] || []
    return ids
      .map((id) => library.find((e) => e.id === id))
      .filter(Boolean)
      .slice(0, 4)
  })
  const [mode, setMode] = useState(searchParams.get("mode") || "side-by-side")
  const [baselineIndex, setBaselineIndex] = useState(() => {
    const idx = Number(searchParams.get("baseline") || 0)
    return Number.isFinite(idx) ? Math.max(0, Math.min(idx, 3)) : 0
  })

  // Top controls state (chips, filters, etc.)
  const [triToggle, setTriToggle] = useState(searchParams.get("tri") || "attacking") // attacking | defending | paired
  const [rateMode, setRateMode] = useState(searchParams.get("rate") || "per-match") // "per-match" | "per-100" | "per-60"
  const [oppAdjusted, setOppAdjusted] = useState(searchParams.get("adj") === "1")
  const [deltaVsLeague, setDeltaVsLeague] = useState(searchParams.get("dvl") === "1")
  const [percentile, setPercentile] = useState(searchParams.get("pct") === "1")
  const [showDiffChip, setShowDiffChip] = useState(searchParams.get("diffchip") === "1")
  const [normalizeExposure, setNormalizeExposure] = useState(searchParams.get("norm") === "1")
  const [preset, setPreset] = useState(searchParams.get("preset") || "overview")
  const [sampleWindow, setSampleWindow] = useState(searchParams.get("window") || "season")

  // Head-to-Head
  const [h2hEnabled, setH2hEnabled] = useState(searchParams.get("h2h") === "1")
  const [h2hFilters, setH2hFilters] = useState({
    venues: [],
    refs: [],
    homeNeutral: "any", // any | home | neutral
    phase: "any", // any | league | ko
  })

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("type", entityType)
    params.set("ids", entities.map((e) => e.id).join(","))
    params.set("mode", mode)
    params.set("baseline", String(baselineIndex))
    params.set("tri", triToggle)
    params.set("rate", rateMode)
    params.set("adj", oppAdjusted ? "1" : "0")
    params.set("dvl", deltaVsLeague ? "1" : "0")
    params.set("pct", percentile ? "1" : "0")
    params.set("diffchip", showDiffChip ? "1" : "0")
    params.set("norm", normalizeExposure ? "1" : "0")
    params.set("preset", preset)
    params.set("window", sampleWindow)
    params.set("h2h", h2hEnabled ? "1" : "0")
   router(`${pathname.pathname}?${params.toString()}`, { replace: true })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    entityType,
    entities,
    mode,
    baselineIndex,
    triToggle,
    rateMode,
    oppAdjusted,
    deltaVsLeague,
    percentile,
    showDiffChip,
    normalizeExposure,
    preset,
    sampleWindow,
    h2hEnabled,
  ])

  useEffect(() => {
    function onKeyDown(e) {
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = Number(e.key) - 1
        if (idx < entities.length) setBaselineIndex(idx)
      }
      if (e.key === "Enter") {
        // Enter toggles Head-to-Head
        setH2hEnabled((v) => !v)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [entities.length])

  const metrics = useMemo(() => {
    const raw = SAMPLE_METRICS(entityType, preset, sampleWindow)
    return applyTriToggleMask(raw, triToggle, showDiffChip)
  }, [entityType, preset, sampleWindow, triToggle, showDiffChip])

  const diffs = useMemo(() => {
    return computeDiffs(metrics, entities, baselineIndex, {
      thresholds: PRACTICAL_THRESHOLDS,
      normalizeExposure,
      rateMode,
    })
  }, [metrics, entities, baselineIndex, normalizeExposure, rateMode])

  const autoEdges = useMemo(() => {
    return computeAutoEdges(metrics, entities, {
      thresholds: PRACTICAL_THRESHOLDS,
      normalizeExposure,
      rateMode,
    }).slice(0, 3)
  }, [metrics, entities, normalizeExposure, rateMode])

  const onReset = useCallback(() => {
    setEntityType(DEFAULT_STATE.entityType)
    setEntities([])
    setMode("side-by-side")
    setBaselineIndex(0)
    setTriToggle("attacking")
    setRateMode("per-match")
    setOppAdjusted(false)
    setDeltaVsLeague(false)
    setPercentile(false)
    setShowDiffChip(false)
    setNormalizeExposure(false)
    setPreset("overview")
    setSampleWindow("season")
    setH2hEnabled(false)
    setH2hFilters({ venues: [], refs: [], homeNeutral: "any", phase: "any" })
  }, [])

  const isFootballOnlyHidden = entityType !== "teams" && entityType !== "players"
  const isHurlingOnlyHidden = entityType !== "teams" // just illustrative

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-semibold text-pretty">Analytics · Comparison</h1>
        <div className="flex items-center gap-2">
          <ExportButton
            mode={mode}
            entityType={entityType}
            entities={entities}
            metrics={metrics}
            diffs={diffs}
            sampleWindow={sampleWindow}
            oppAdjusted={oppAdjusted}
            deltaVsLeague={deltaVsLeague}
            percentile={percentile}
            normalizeExposure={normalizeExposure}
            triToggle={triToggle}
            baselineIndex={baselineIndex}
          />
          <Button variant="secondary" onClick={onReset} aria-label="Reset all settings">
            Reset
          </Button>
        </div>
      </div>

      <Card className="bg-card">
        <div className="p-3 md:p-4 sticky top-0 z-10 bg-card">
          <TopControls
            entityType={entityType}
            setEntityType={(t) => {
              setEntityType(t)
              setEntities([]) // clear mixed types
              setBaselineIndex(0)
            }}
            triToggle={triToggle}
            setTriToggle={setTriToggle}
            rateMode={rateMode}
            setRateMode={setRateMode}
            oppAdjusted={oppAdjusted}
            setOppAdjusted={setOppAdjusted}
            deltaVsLeague={deltaVsLeague}
            setDeltaVsLeague={setDeltaVsLeague}
            percentile={percentile}
            setPercentile={setPercentile}
            showDiffChip={showDiffChip}
            setShowDiffChip={setShowDiffChip}
            preset={preset}
            setPreset={setPreset}
            sampleWindow={sampleWindow}
            setSampleWindow={setSampleWindow}
          />
        </div>

        <Separator />

        <div className="p-3 md:p-4 grid gap-3 md:gap-4">
          <EntityTray
            entityType={entityType}
            entities={entities}
            setEntities={setEntities}
            library={SAMPLE_ENTITIES[entityType] || []}
          />

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <ModeTabs mode={mode} setMode={setMode} />
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Head-to-Head</label>
              <Button
                variant={h2hEnabled ? "default" : "secondary"}
                onClick={() => setH2hEnabled((v) => !v)}
                aria-pressed={h2hEnabled}
              >
                {h2hEnabled ? "On" : "Off"}
              </Button>
            </div>
          </div>

          {h2hEnabled && (
            <H2HFilters filters={h2hFilters} setFilters={setH2hFilters} disableVenues={entityType === "venues"} />
          )}

          <AutoEdges edges={autoEdges} />

          <Tabs value={mode} className="mt-1">
            <TabsList className="sr-only">
              <TabsTrigger value="side-by-side">Side-by-Side</TabsTrigger>
              <TabsTrigger value="diff">Diff</TabsTrigger>
            </TabsList>

            <TabsContent value="side-by-side" className="mt-0">
              <MetricsTable
                entityType={entityType}
                entities={entities}
                metrics={metrics}
                thresholds={PRACTICAL_THRESHOLDS}
                rateMode={rateMode}
                triToggle={triToggle}
                percentile={percentile}
                deltaVsLeague={deltaVsLeague}
                oppAdjusted={oppAdjusted}
                normalizeExposure={normalizeExposure}
                // Illustrative code-awareness flags
                hideFootballOnly={isFootballOnlyHidden}
                hideHurlingOnly={isHurlingOnlyHidden}
              />
            </TabsContent>

            <TabsContent value="diff" className="mt-0">
              <DiffTable
                entities={entities}
                metrics={metrics}
                diffs={diffs}
                baselineIndex={baselineIndex}
                setBaselineIndex={setBaselineIndex}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </main>
  )
}
