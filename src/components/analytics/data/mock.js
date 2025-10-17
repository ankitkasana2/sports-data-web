export const TEAMS = [
  {
    team: "Dublin",
    poss_for: 58,
    poss_against: 52,
    pace: 65,
    points_for_pm: 20.5,
    points_against_pm: 16.2,
    ortg_for_pm: 95.0,
    drtg_against_pm: 82.0,
    two_pt_share: 0.62,
    two_pt_attempts: 120,
    opp_two_pt_share: 0.55,
    opp_two_pt_attempts: 110,
    ko_short_own: 0.76,
    ko_short_own_att: 34,
    ko_short_opp: 0.68,
    ko_short_opp_att: 31,
    to_shot_15_for: 0.33,
    to_att_for: 70,
    to_shot_15_against: 0.25,
    to_att_against: 64,
    shots_15_pm: 5.8,
  },
  {
    team: "Kerry",
    poss_for: 55,
    poss_against: 54,
    pace: 62,
    points_for_pm: 18.9,
    points_against_pm: 17.4,
    ortg_for_pm: 90.5,
    drtg_against_pm: 86.5,
    two_pt_share: 0.58,
    two_pt_attempts: 102,
    opp_two_pt_share: 0.59,
    opp_two_pt_attempts: 98,
    ko_short_own: 0.71,
    ko_short_own_att: 29,
    ko_short_opp: 0.69,
    ko_short_opp_att: 30,
    to_shot_15_for: 0.29,
    to_att_for: 66,
    to_shot_15_against: 0.28,
    to_att_against: 65,
    shots_15_pm: 4.9,
  },
  {
    team: "Mayo",
    poss_for: 60,
    poss_against: 57,
    pace: 68,
    points_for_pm: 19.8,
    points_against_pm: 18.9,
    ortg_for_pm: 92.2,
    drtg_against_pm: 90.1,
    two_pt_share: 0.6,
    two_pt_attempts: 97,
    opp_two_pt_share: 0.62,
    opp_two_pt_attempts: 120,
    ko_short_own: 0.69,
    ko_short_own_att: 26,
    ko_short_opp: 0.73,
    ko_short_opp_att: 33,
    to_shot_15_for: 0.31,
    to_att_for: 71,
    to_shot_15_against: 0.32,
    to_att_against: 72,
    shots_15_pm: 5.2,
  },
]

export const mockPlayers = [
  { id: "p1", name: "Aidan O'Connell", team: "Dublin", pos: "F", mins: 980, goals: 12, assists: 7 },
  { id: "p2", name: "Sean Murphy", team: "Kerry", pos: "M", mins: 1020, goals: 8, assists: 10 },
  { id: "p3", name: "Liam Walsh", team: "Galway", pos: "D", mins: 1100, goals: 2, assists: 5 },
  { id: "p4", name: "Colm Byrne", team: "Mayo", pos: "F", mins: 960, goals: 9, assists: 6 },
  { id: "p5", name: "Tom O'Leary", team: "Cork", pos: "M", mins: 1005, goals: 6, assists: 8 },
]

export const DEFAULT_VISIBLE_COLUMNS = [
  { id: "team", label: "Team", enabled: true },
  { id: "poss_for", label: "Poss (For)", enabled: true },
  { id: "poss_against", label: "Poss (Against)", enabled: true },
  { id: "pace", label: "Pace", enabled: true },
  { id: "ORtg", label: "ORtg (For)", enabled: true },
  { id: "DRtg", label: "DRtg (Against)", enabled: true },
  { id: "nett_diff", label: "Net", enabled: true },
  { id: "two_pt_share", label: "2-pt Share", enabled: true },
  { id: "opp_two_pt_share", label: "Opp 2-pt Share", enabled: true },
  { id: "ko_short_own", label: "Own KO Short%", enabled: true },
  { id: "opp_ko_short_own", label: "Opp KO Short%", enabled: true },
  { id: "short_ko_diff", label: "KO Short DIFF", enabled: true },
  { id: "to_shot_15_for", label: "TO→Shot ≤15s", enabled: true },
  { id: "to_shot_15_against", label: "Opp TO→Shot ≤15s", enabled: true },
  { id: "to_shot_15_diff", label: "TO→Shot DIFF", enabled: true },
]

export function computeDerived(row, { rateMode }) {
  const per100 = rateMode === "per100"
  const rateFactor = per100 ? 100 / (row.poss_for || 1) : 1

  const ortg_for = per100 ? row.ortg_for_pm : row.ortg_for_pm // demo uses pm as base; in real calc, transform
  const drtg_against = per100 ? row.drtg_against_pm : row.drtg_against_pm

  return {
    ...row,
    ortg_for,
    drtg_against,
    net: ortg_for - drtg_against,
  }
}
