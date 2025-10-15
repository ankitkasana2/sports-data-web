export const TEAMS = [
  {
    id: "A",
    name: "Team A",
    poss60: 52,
    components: {
      fromPlay: { attemptsPer100: 45, conv: 0.45, value: 1.0 },
      frees0_20: { attemptsPer100: 4, conv: 0.92, value: 1.0 },
      frees21_35: { attemptsPer100: 5, conv: 0.72, value: 1.0 },
      frees36_55: { attemptsPer100: 3, conv: 0.4, value: 1.0 },
      frees56p: { attemptsPer100: 1, conv: 0.2, value: 1.0 },
      pens: { attemptsPer100: 0.5, conv: 0.78, value: 1.0 },
      twoPt: { attemptsPer100: 6, conv: 0.3, value: 2.0 }, // FB only
      restarts: { attemptsPer100: 6, conv: 0.35, value: 1.0 },
      transition: { attemptsPer100: 5, conv: 0.4, value: 1.0 },
      misc: { attemptsPer100: 1, conv: 0.5, value: 1.0 },
    },
    defenseAgainst: {
      fromPlay: -0.03,
      frees0_20: 0.0,
      frees21_35: -0.02,
      frees36_55: 0.01,
      frees56p: 0.0,
      pens: 0.0,
      twoPt: -0.03,
      restarts: -0.01,
      transition: -0.02,
      misc: 0.0,
    },
  },
  {
    id: "B",
    name: "Team B",
    poss60: 50,
    components: {
      fromPlay: { attemptsPer100: 44, conv: 0.43, value: 1.0 },
      frees0_20: { attemptsPer100: 5, conv: 0.9, value: 1.0 },
      frees21_35: { attemptsPer100: 4, conv: 0.7, value: 1.0 },
      frees36_55: { attemptsPer100: 3, conv: 0.38, value: 1.0 },
      frees56p: { attemptsPer100: 1, conv: 0.18, value: 1.0 },
      pens: { attemptsPer100: 0.4, conv: 0.8, value: 1.0 },
      twoPt: { attemptsPer100: 5, conv: 0.28, value: 2.0 },
      restarts: { attemptsPer100: 6, conv: 0.34, value: 1.0 },
      transition: { attemptsPer100: 6, conv: 0.38, value: 1.0 },
      misc: { attemptsPer100: 1, conv: 0.5, value: 1.0 },
    },
    defenseAgainst: {
      fromPlay: -0.02,
      frees0_20: 0.0,
      frees21_35: -0.01,
      frees36_55: 0.0,
      frees56p: 0.0,
      pens: 0.0,
      twoPt: -0.02,
      restarts: -0.01,
      transition: -0.01,
      misc: 0.0,
    },
  },
]

export const VENUES = [
  {
    id: "scheduled",
    name: "Scheduled venue",
    vsiFromPlay: 0.3,
    freeCurve2135pp: 0,
    twoPtSectorAdj: 0,
    bipDeltaPoss: 0.4,
  },
  {
    id: "tight-pitch",
    name: "Tight pitch",
    vsiFromPlay: -0.6,
    freeCurve2135pp: +1,
    twoPtSectorAdj: -0.5,
    bipDeltaPoss: -0.8,
  },
  {
    id: "open-pitch",
    name: "Open pitch",
    vsiFromPlay: +1.0,
    freeCurve2135pp: -1,
    twoPtSectorAdj: +0.7,
    bipDeltaPoss: +0.8,
  },
]

export const REFS = [
  {
    id: "avg",
    name: "Average Ref",
    pacePoss: +0.8,
    addedTimePoss: +0.6,
    latencyPoss: -0.3,
    freesPer100Delta: +0.2,
    freeDistDriftMeters: +1,
    twoPtChanceMult: +0.02,
    advQualityPp100: +0.2,
  },
  {
    id: "tight",
    name: "Tight/Flow",
    pacePoss: -0.8,
    addedTimePoss: +0.4,
    latencyPoss: -0.2,
    freesPer100Delta: -0.3,
    freeDistDriftMeters: -1,
    twoPtChanceMult: -0.02,
    advQualityPp100: -0.1,
  },
]

export const DEFAULT_FILTERS = {
  season: "2025",
  competition: "League",
  grade: "Senior",
  stage: "Regular",
  code: "FB", // FB or Hur
  sampleWindow: "Season",
}
