export function clamp(x, lo, hi) {
  return Math.min(hi, Math.max(lo, x))
}
export function harmonicMean(a, b) {
  return (2 * a * b) / (a + b)
}

function basePoss(A, B) {
  return harmonicMean(A.poss60, B.poss60)
}

export function assemblePossessions(A, B, venue, ref, scenario) {
  const base = basePoss(A, B)
  const refPace = clamp(ref.pacePoss ?? 0, -2, 2)
  const addedTime = ref.addedTimePoss ?? 0
  const latency = ref.latencyPoss ?? 0
  const venueDelta = venue.bipDeltaPoss ?? 0
  const override = clamp(scenario.paceOverride ?? 0, -5, 5)

  let poss = base + venueDelta + refPace + addedTime + latency + override
  const netAdj = poss - base
  const clampedNet = clamp(netAdj, -5, 5)
  if (clampedNet !== netAdj) {
    poss = base + clampedNet
  }
  return {
    base,
    total: poss,
    refPace,
    addedTime,
    latency,
    venueDelta,
    override: scenario.paceOverride ?? 0,
  }
}

function applyDefense(base, againstDelta) {
  return base * (1 + (againstDelta ?? 0))
}

function applyVenueRef(componentName, value, venue, ref, env, filters) {
  let v = value
  if (componentName === "fromPlay") {
    v += clamp(venue.vsiFromPlay ?? 0, -1.5, 1.5)
    v += clamp(ref.advQualityPp100 ?? 0, -1.0, 1.0)
  }
  if (componentName === "frees21_35") {
    v += venue.freeCurve2135pp ?? 0
  }
  if (filters.code === "FB" && componentName === "twoPt") {
    v *= 1 + (ref.twoPtChanceMult ?? 0)
    // venue sector adjustment as small pp100 tweak
    v += venue.twoPtSectorAdj ?? 0
  }
  // light environment nudges
  if (env?.wind === "tail" && (componentName === "twoPt" || componentName.startsWith("frees"))) v *= 1.01
  if (env?.wind === "head" && (componentName === "twoPt" || componentName.startsWith("frees"))) v *= 0.99
  return v
}

function componentList(filters) {
  const base = [
    "fromPlay",
    "frees0_20",
    "frees21_35",
    "frees36_55",
    "frees56p",
    "pens",
    "restarts",
    "transition",
    "misc",
  ]
  if (filters.code === "FB") base.splice(6, 0, "twoPt") // insert before restarts
  return base
}

function applyScenarioComponent(name, comp, params, side) {
  let { attemptsPer100, conv, value } = comp
  if (name === "twoPt" && typeof params[`twoPtDelta${side}`] === "number") {
    attemptsPer100 *= 1 + params[`twoPtDelta${side}`] / 100
  }
  if (name === "frees21_35" && typeof params[`freeConvAdj2135${side}`] === "number") {
    conv = clamp(conv + params[`freeConvAdj2135${side}`] / 100, 0, 1)
  }
  if (name === "restarts" && params[`koMix${side}`]) {
    const mix = params[`koMix${side}`]
    // simplistic mapping of S/M/L to shot quality
    const qual = (mix.s * 1.02 + mix.m * 1.0 + mix.l * 0.98) / 100
    conv *= qual
  }
  if (name === "transition" && typeof params.pressIntensity === "number") {
    // nudge TO→Shot ≤15s by small factor
    const mult = 1 + params.pressIntensity * 0.01
    attemptsPer100 *= clamp(mult, 0.8, 1.2)
  }
  return { attemptsPer100, conv, value }
}

function compToPp100(c) {
  return c.attemptsPer100 * c.conv * c.value
}

export function assembleTeamsORtg(A, B, venue, ref, opts) {
  const filters = opts.filters
  const env = opts.environment || {}
  const comps = componentList(filters)

  const build = (forTeam, opp, sideLetter) => {
    const rows = []
    comps.forEach((name) => {
      const base = forTeam.components[name] || { attemptsPer100: 0, conv: 0, value: 1 }
      // baseline pp100 (form)
      let pp100 = compToPp100(base)
      // defense matchup
      const defDelta = opp.defenseAgainst[name] ?? 0
      pp100 = applyDefense(pp100, defDelta)
      // venue/ref drivers
      pp100 = applyVenueRef(name, pp100, venue, ref, env, filters)
      // scenario sliders
      const scen = applyScenarioComponent(
        name,
        base,
        {
          twoPtDeltaA: opts.twoPtDeltaA,
          twoPtDeltaB: opts.twoPtDeltaB,
          freeConvAdj2135A: opts.freeConvAdj2135A,
          freeConvAdj2135B: opts.freeConvAdj2135B,
          koMixA: opts.koMixA,
          koMixB: opts.koMixB,
          pressIntensity: opts.pressIntensity,
        },
        sideLetter,
      )
      const finalPp100 = compToPp100(scen)
      // Mix: blend pp100 scale effect with scenario-rescaled attempts; keep demonstration simple by averaging
      const blended = (pp100 + finalPp100) / 2
      rows.push({
        name,
        attempts: scen.attemptsPer100,
        conv: scen.conv,
        value: scen.value,
        pp100: blended,
        // simple deltas for drivers report (vs pure baseline)
        baseline: compToPp100(base),
        afterDefense: applyDefense(compToPp100(base), defDelta),
        afterVenueRef: applyVenueRef(name, applyDefense(compToPp100(base), defDelta), venue, ref, env, filters),
        afterScenario: blended,
      })
    })
    const ortg = rows.reduce((s, r) => s + r.pp100, 0)
    return { rows, ortg }
  }

  const a = build(A, B, "A")
  const b = build(B, A, "B")
  return { a, b, filters }
}

export function computeOutputs(possessions, ortg) {
  const ptsA = (possessions.total * ortg.a.ortg) / 100
  const ptsB = (possessions.total * ortg.b.ortg) / 100
  const total = ptsA + ptsB
  const margin = ptsA - ptsB
  // logistic win prob with sigma ~ 10 for demo (tunable per competition)
  const sigma = 10
  const winProbA = 1 / (1 + Math.exp(-margin / sigma))
  const winProbB = 1 - winProbA
  const fairPriceA = winProbA > 0 ? 1 / winProbA : null
  const fairPriceB = winProbB > 0 ? 1 / winProbB : null
  const fairHandicapA = margin
  return { ptsA, ptsB, total, margin, winProbA, winProbB, fairPriceA, fairPriceB, fairHandicapA }
}

export function computeDrivers(ortg, possessions) {
  const mk = (name, a, b) => ({ name, a, b })
  const rows = []

  // Using stage deltas from rows' snapshots
  const sumDelta = (rows, keyFrom, keyTo) => rows.reduce((s, r) => s + (r[keyTo] - r[keyFrom]), 0)

  rows.push(
    mk(
      "From-play form (last N)",
      sumDelta(ortg.a.rows, "baseline", "baseline"),
      sumDelta(ortg.b.rows, "baseline", "baseline"),
    ),
  )
  rows.push(
    mk(
      "Defense matchup",
      sumDelta(ortg.a.rows, "baseline", "afterDefense"),
      sumDelta(ortg.b.rows, "baseline", "afterDefense"),
    ),
  )
  rows.push(
    mk(
      "Venue: VSI (to from-play)",
      sumDelta(ortg.a.rows, "afterDefense", "afterVenueRef"),
      sumDelta(ortg.b.rows, "afterDefense", "afterVenueRef"),
    ),
  )
  rows.push(mk("Ref & venue frees/2-pt effects", 0, 0)) // grouped in above for demo
  rows.push(
    mk(
      "Scenario sliders",
      sumDelta(ortg.a.rows, "afterVenueRef", "afterScenario"),
      sumDelta(ortg.b.rows, "afterVenueRef", "afterScenario"),
    ),
  )

  const totalA = sumDelta(ortg.a.rows, "baseline", "afterScenario")
  const totalB = sumDelta(ortg.b.rows, "baseline", "afterScenario")

  return { rows, total: { a: totalA, b: totalB }, possessions: possessions.total }
}

export function computeLedger(ortg) {
  const toLedger = (rows) =>
    rows.map((r) => ({
      name: r.name,
      attempts: r.attempts,
      conv: r.conv,
      value: r.value,
      pp100: r.pp100,
    }))
  return { a: toLedger(ortg.a.rows), b: toLedger(ortg.b.rows) }
}

export function computeSensitivity(A, B, v, r, opts) {
  // ±1 possession ≈ (ortgA+ortgB)/100
  const ortgTmp = assembleTeamsORtg(A, B, v, r, opts)
  const dTotalPerPoss = (ortgTmp.a.ortg + ortgTmp.b.ortg) / 100

  const bump = (keyA, keyB, dv) => {
    const next = { ...opts, [keyA]: (opts[keyA] ?? 0) + dv, [keyB]: (opts[keyB] ?? 0) + dv }
    const o = assembleTeamsORtg(A, B, v, r, next)
    const o2 = computeOutputs(
      { total: 50, base: 50, refPace: 0, addedTime: 0, latency: 0, venueDelta: 0, override: 0 },
      o,
    )
    return {
      a: o2.ptsA - (computeOutputs({ total: 50 }, ortgTmp).ptsA || 0),
      b: o2.ptsB - (computeOutputs({ total: 50 }, ortgTmp).ptsB || 0),
    }
  }

  const dPtsPerTwoPt5pct = bump("twoPtDeltaA", "twoPtDeltaB", +5)
  const dPtsPerFree2135pp5 = bump("freeConvAdj2135A", "freeConvAdj2135B", +5)

  return { dTotalPerPoss, dPtsPerTwoPt5pct, dPtsPerFree2135pp5 }
}

function quantiles(arr) {
  const a = [...arr].sort((x, y) => x - y)
  const q = (p) => {
    const idx = (a.length - 1) * p
    const lo = Math.floor(idx),
      hi = Math.ceil(idx)
    if (lo === hi) return a[lo]
    return a[lo] + (idx - lo) * (a[hi] - a[lo])
  }
  return { p5: q(0.05), p25: q(0.25), median: q(0.5), p75: q(0.75), p95: q(0.95) }
}

export function runMonteCarlo(A, B, v, r, opts) {
  const samples = Math.max(200, Math.min(20000, opts.samples || 2000))
  const poss = assemblePossessions(A, B, v, r, { paceOverride: opts.paceOverride || 0 })

  const pointsA = []
  const pointsB = []
  for (let i = 0; i < samples; i++) {
    // Shared pace shock (normal-ish via CLT)
    const shock = randn() * 0.5
    const possShock = clamp(poss.total + shock, poss.total - 3, poss.total + 3)
    const o = assembleTeamsORtg(A, B, v, r, opts)
    // Component randomness: small normal noise on ortg
    const ortgA = o.a.ortg * (1 + randn() * 0.03)
    const ortgB = o.b.ortg * (1 + randn() * 0.03)
    const pa = (possShock * ortgA) / 100
    const pb = (possShock * ortgB) / 100
    pointsA.push(pa)
    pointsB.push(pb)
  }

  const total = pointsA.map((x, i) => x + pointsB[i])
  const margin = pointsA.map((x, i) => x - pointsB[i])

  return {
    pointsA: quantiles(pointsA),
    pointsB: quantiles(pointsB),
    total: quantiles(total),
    margin: quantiles(margin),
  }
}

function randn() {
  // Box-Muller
  let u = 0,
    v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}
