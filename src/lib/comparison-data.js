export const ENTITY_TYPES = ["teams", "players", "venues", "refs"]

export const DEFAULT_STATE = {
  entityType: "teams",
}

export const SAMPLE_ENTITIES = {
  teams: [
    { id: "t1", name: "Team Alpha", subtitle: "League A" },
    { id: "t2", name: "Team Bravo", subtitle: "League A" },
    { id: "t3", name: "Team Charlie", subtitle: "League B" },
    { id: "t4", name: "Team Delta", subtitle: "League B" },
  ],
  players: [
    { id: "p1", name: "Player One", subtitle: "Team Alpha" },
    { id: "p2", name: "Player Two", subtitle: "Team Bravo" },
    { id: "p3", name: "Player Three", subtitle: "Team Charlie" },
  ],
  venues: [
    { id: "v1", name: "Stadium A", subtitle: "City X" },
    { id: "v2", name: "Stadium B", subtitle: "City Y" },
  ],
  refs: [
    { id: "r1", name: "Ref 1", subtitle: "Experience 8y" },
    { id: "r2", name: "Ref 2", subtitle: "Experience 5y" },
  ],
}

// Practical significance thresholds (illustrative mapping)
export const PRACTICAL_THRESHOLDS = {
  ortg: 3.0, // pp100
  drtg: 3.0, // pp100
  net: 3.0, // pp100
  pace: 2.0, // poss/60
  two_pt: 5.0, // percentage points
  ft_pct: 5.0, // percentage points
  vsi: 4.0, // pp100
}

// Factory to return sample metrics by entity type & preset
export function SAMPLE_METRICS(entityType, preset, sampleWindow) {
  // Base demo set (keep small for preview)
  const base = [
    {
      key: "ortg",
      label: "Offensive Rating (ORtg)",
      unit: "pp100",
      values: valueMap(entityType, { t1: 108.2, t2: 112.5, t3: 105.1, t4: 110.3, p1: 2.1, p2: 1.7, p3: 1.2 }),
    },
    {
      key: "drtg",
      label: "Defensive Rating (DRtg)",
      unit: "pp100",
      values: valueMap(entityType, { t1: 104.4, t2: 107.2, t3: 101.3, t4: 109.2, p1: -1.0, p2: -0.6, p3: -0.9 }),
    },
    {
      key: "net",
      label: "Net Rating",
      unit: "pp100",
      values: valueMap(entityType, { t1: 3.8, t2: 5.3, t3: 3.8, t4: 1.1 }),
      footballOnly: true, // example code-awareness flag
    },
    {
      key: "pace",
      label: "Pace",
      unit: "poss/60",
      values: valueMap(entityType, { t1: 67.2, t2: 65.8, t3: 63.5, t4: 69.1 }),
    },
    {
      key: "two_pt",
      label: "2-pt %",
      unit: "%",
      isPercent: true,
      values: valueMap(entityType, { t1: 48.2, t2: 53.4, t3: 51.9, t4: 49.1, p1: 52.1, p2: 49.7 }),
      lowSample: { t4: true }, // greying example
      badge: { t2: "+6" }, // inline badge example
    },
    {
      key: "ft_pct",
      label: "Free %",
      unit: "%",
      isPercent: true,
      values: valueMap(entityType, { t1: 77.2, t2: 81.5, t3: 73.0, t4: 76.1 }),
      hurlingOnly: true, // example code-awareness flag
    },
  ]

  // Return same set for all presets in demo; in real app, switch on preset
  return base
}

function valueMap(entityType, dict) {
  // Normalize shape: { id: { value, per100?, per60? } }
  const ids = Object.keys(dict)
  const map = {}
  ids.forEach((id) => {
    const v = dict[id]
    map[id] = { value: v }
    // Demo: provide alternative rate variants for some metrics
    if (typeof v === "number") {
      map[id].per100 = v
      map[id].per60 = v
    }
  })
  return map
}

export function computeDiffs(metrics, entities, baselineIndex, { thresholds }) {
  const baseline = entities[baselineIndex]
  const out = {}
  metrics.forEach((m) => {
    const baseVal = m.values[baseline?.id]?.value
    if (!Number.isFinite(baseVal)) {
      out[m.key] = { maxGap: null, isSignificant: false }
      return
    }
    let maxGap = 0
    entities.forEach((e) => {
      const v = m.values[e.id]?.value
      if (Number.isFinite(v)) {
        const gap = v - baseVal
        if (Math.abs(gap) > Math.abs(maxGap)) maxGap = gap
      }
    })
    const thr = thresholds[m.key] || 0
    out[m.key] = { maxGap, isSignificant: Math.abs(maxGap) >= thr }
  })
  return out
}

export function computeAutoEdges(metrics, entities, { thresholds }) {
  const edges = []
  metrics.forEach((m) => {
    let best = null
    let worst = null
    entities.forEach((e) => {
      const v = m.values[e.id]?.value
      if (!Number.isFinite(v)) return
      if (best === null || v > best.value) best = { id: e.id, name: e.name, value: v }
      if (worst === null || v < worst.value) worst = { id: e.id, name: e.name, value: v }
    })
    if (best && worst) {
      const delta = best.value - worst.value
      const thr = thresholds[m.key] || Number.POSITIVE_INFINITY
      if (Math.abs(delta) >= thr) {
        edges.push({
          metricKey: m.key,
          metricLabel: m.label,
          leading: best,
          trailing: worst,
          delta,
          symbol: delta >= 0 ? "+" : "−",
        })
      }
    }
  })
  // Sort by absolute delta descending
  edges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
  return edges
}

export function applyTriToggleMask(metrics, triToggle, showDiffChip) {
  // For demo, this function passes through; in real app it would mask For/Against and DIFF sets.
  return metrics.map((m) => {
    const copy = { ...m }
    if (triToggle !== "paired") {
      // pretend to hide DIFF columns when not paired
      copy.showDiff = false
    } else {
      copy.showDiff = showDiffChip
    }
    return copy
  })
}
