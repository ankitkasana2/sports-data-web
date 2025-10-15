"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Inputs from "../prediction/inputs"
import Scorecard from "../prediction/scorecard"
import DriversTable from "../prediction/drivers-table"
import ComponentLedger from "../prediction/component-ledger"
import SensitivityPanel from "../prediction/sensitivity"
import UncertaintyPanel from "../prediction/uncertainty"
import ExportControls from "../prediction/export-controls"
import { TEAMS, VENUES, REFS, DEFAULT_FILTERS } from "@/lib/prediction/mock-data"
import {
  assemblePossessions,
  assembleTeamsORtg,
  computeOutputs,
  computeDrivers,
  computeLedger,
  computeSensitivity,
  runMonteCarlo,
} from "@/lib/prediction/calc"

export default function PredictionApp() {
  // Inputs & Filters
  const [teamA, setTeamA] = useState(TEAMS[0].id)
  const [teamB, setTeamB] = useState(TEAMS[1].id)
  const [venue, setVenue] = useState(VENUES[0].id)
  const [ref, setRef] = useState(REFS[0].id)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  // Scenario sliders
  const [paceOverride, setPaceOverride] = useState(0) // clamp ±5
  const [twoPtDeltaA, setTwoPtDeltaA] = useState(0) // ±20 attempts basis points (demo)
  const [twoPtDeltaB, setTwoPtDeltaB] = useState(0)
  const [freeConvAdj2135A, setFreeConvAdj2135A] = useState(0) // ±10 pp
  const [freeConvAdj2135B, setFreeConvAdj2135B] = useState(0)
  const [koMixA, setKoMixA] = useState({ s: 34, m: 33, l: 33 }) // sum ~100
  const [koMixB, setKoMixB] = useState({ s: 34, m: 33, l: 33 })
  const [pressIntensity, setPressIntensity] = useState(0) // -5 .. +5
  const [environment, setEnvironment] = useState({ wind: "neutral", surface: "standard", dayNight: "day" })
  const [enableMC, setEnableMC] = useState(false)
  const [mcSamples, setMcSamples] = useState(2000)

  // Value compare (optional)
  const [market, setMarket] = useState({ spreadA: 0, total: 40.5, priceA: 2.0, priceB: 1.9 })

  // Derived team/venue/ref objects
  const selected = useMemo(() => {
    const A = TEAMS.find((t) => t.id === teamA)
    const B = TEAMS.find((t) => t.id === teamB)
    const v = VENUES.find((vv) => vv.id === venue)
    const r = REFS.find((rr) => rr.id === ref)
    return { A, B, v, r }
  }, [teamA, teamB, venue, ref])

  // Possessions
  const possessions = useMemo(() => {
    return assemblePossessions(selected.A, selected.B, selected.v, selected.r, {
      paceOverride,
    })
  }, [selected, paceOverride])

  // ORtg by components for each team
  const ortg = useMemo(() => {
    return assembleTeamsORtg(selected.A, selected.B, selected.v, selected.r, {
      filters,
      twoPtDeltaA,
      twoPtDeltaB,
      freeConvAdj2135A,
      freeConvAdj2135B,
      koMixA,
      koMixB,
      pressIntensity,
      environment,
    })
  }, [
    selected,
    filters,
    twoPtDeltaA,
    twoPtDeltaB,
    freeConvAdj2135A,
    freeConvAdj2135B,
    koMixA,
    koMixB,
    pressIntensity,
    environment,
  ])

  // Final outputs
  const outputs = useMemo(() => {
    return computeOutputs(possessions, ortg)
  }, [possessions, ortg])

  // Drivers & Ledger tables
  const drivers = useMemo(() => {
    return computeDrivers(ortg, possessions)
  }, [ortg, possessions])

  const ledger = useMemo(() => {
    return computeLedger(ortg)
  }, [ortg])

  // Sensitivity
  const sensitivity = useMemo(() => {
    return computeSensitivity(selected.A, selected.B, selected.v, selected.r, {
      filters,
      twoPtDeltaA,
      twoPtDeltaB,
      freeConvAdj2135A,
      freeConvAdj2135B,
      koMixA,
      koMixB,
      pressIntensity,
      environment,
    })
  }, [
    selected,
    filters,
    twoPtDeltaA,
    twoPtDeltaB,
    freeConvAdj2135A,
    freeConvAdj2135B,
    koMixA,
    koMixB,
    pressIntensity,
    environment,
  ])

  // Monte Carlo (optional)
  const mc = useMemo(() => {
    if (!enableMC) return null
    return runMonteCarlo(selected.A, selected.B, selected.v, selected.r, {
      filters,
      twoPtDeltaA,
      twoPtDeltaB,
      freeConvAdj2135A,
      freeConvAdj2135B,
      koMixA,
      koMixB,
      pressIntensity,
      environment,
      paceOverride,
      samples: mcSamples,
    })
  }, [
    enableMC,
    selected,
    filters,
    twoPtDeltaA,
    twoPtDeltaB,
    freeConvAdj2135A,
    freeConvAdj2135B,
    koMixA,
    koMixB,
    pressIntensity,
    environment,
    paceOverride,
    mcSamples,
  ])

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inputs & Scenario</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Inputs
            teams={TEAMS}
            venues={VENUES}
            refs={REFS}
            filters={filters}
            onFilters={setFilters}
            teamA={teamA}
            setTeamA={setTeamA}
            teamB={teamB}
            setTeamB={setTeamB}
            venue={venue}
            setVenue={setVenue}
            refId={ref}
            setRefId={setRef}
            paceOverride={paceOverride}
            setPaceOverride={setPaceOverride}
            twoPtDeltaA={twoPtDeltaA}
            setTwoPtDeltaA={setTwoPtDeltaA}
            twoPtDeltaB={twoPtDeltaB}
            setTwoPtDeltaB={setTwoPtDeltaB}
            freeConvAdj2135A={freeConvAdj2135A}
            setFreeConvAdj2135A={setFreeConvAdj2135A}
            freeConvAdj2135B={freeConvAdj2135B}
            setFreeConvAdj2135B={setFreeConvAdj2135B}
            koMixA={koMixA}
            setKoMixA={setKoMixA}
            koMixB={koMixB}
            setKoMixB={setKoMixB}
            pressIntensity={pressIntensity}
            setPressIntensity={setPressIntensity}
            environment={environment}
            setEnvironment={setEnvironment}
            enableMC={enableMC}
            setEnableMC={setEnableMC}
            mcSamples={mcSamples}
            setMcSamples={setMcSamples}
          />
        </CardContent>
      </Card>

      <Scorecard
        A={selected.A}
        B={selected.B}
        possessions={possessions}
        outputs={outputs}
        market={market}
        onMarket={setMarket}
      />

      <DriversTable drivers={drivers} />

      <ComponentLedger ledger={ledger} />

      <SensitivityPanel sensitivity={sensitivity} />

      <UncertaintyPanel mc={mc} />

      <ExportControls
        A={selected.A}
        B={selected.B}
        possessions={possessions}
        outputs={outputs}
        drivers={drivers}
        ledger={ledger}
        mc={mc}
        filters={filters}
        scenario={{
          paceOverride,
          twoPtDeltaA,
          twoPtDeltaB,
          freeConvAdj2135A,
          freeConvAdj2135B,
          koMixA,
          koMixB,
          pressIntensity,
          environment,
        }}
        market={market}
      />
    </div>
  )
}
