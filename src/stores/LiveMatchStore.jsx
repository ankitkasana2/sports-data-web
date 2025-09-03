
import { makeAutoObservable, computed } from "mobx"

// Gaelic formatting helper: goals-points (total points = goals*3 + points)
export function toTotalPoints(s) {
  return s.goals * 3 + s.points
}



class LiveMatchStore {
  code = "football"
  clock = { period: "H1", seconds: 0, running: false }

  score = {
    home: { goals: 0, points: 0 },
    away: { goals: 0, points: 0 },
  }

  // core data
  events = []
  possessions = []

  // UI state
  ui = {
    prematchOpen: true,
    selection: null,
    currentShot: { open: false, xy: [] },
    currentFree: { open: false, xy: null },
    currentRestart: { open: false, xy: null },
    currentTurnover: { open: false, xy: null },
  }

  // basic history for undo/redo
  past = []
  future = []

  constructor() {
    makeAutoObservable(this, {
      pppHome: computed,
      pppAway: computed,
      possessionCounts: computed,
    })
  }

  // serialization for simple history
  snapshot() {
    return JSON.stringify({
      code: this.code,
      clock: this.clock,
      score: this.score,
      events: this.events,
      possessions: this.possessions,
      ui: this.ui,
    })
  }

  restore(s) {
    const v = JSON.parse(s)
    this.code = v.code
    this.clock = v.clock
    this.score = v.score
    this.events = v.events
    this.possessions = v.possessions
    this.ui = v.ui
  }

  pushHistory() {
    this.past.push(this.snapshot())
    this.future = []
  }

  undo() {
    if (!this.past.length) return
    const current = this.snapshot()
    const prev = this.past.pop()
    this.future.push(current)
    this.restore(prev)
  }

  redo() {
    if (!this.future.length) return
    const current = this.snapshot()
    const next = this.future.pop()
    this.past.push(current)
    this.restore(next)
  }

  setCode(code) {
    this.pushHistory()
    this.code = code
  }

  openPrematch(open) {
    this.ui.prematchOpen = open
  }

  savePrematch(data){
    return
  }

  startClock() {
    this.clock.running = true
  }

  pauseClock() {
    this.clock.running = false
  }

  setTime(seconds) {
    this.pushHistory()
    this.clock.seconds = Math.max(0, Math.floor(seconds))
  }

  setPeriod(period) {
    this.pushHistory()
    this.clock.period = period
  }

  tick(delta = 1) {
    if (!this.clock.running) return
    this.clock.seconds = Math.max(0, this.clock.seconds + delta)
  }

  addScore(team, kind) {
    this.pushHistory()
    if (kind === "goal") this.score[team].goals += 1
    else this.score[team].points += 1
    // close current possession on score (per rules)
    this.closeCurrentPossessionOn(team)
  }

  addEvent(e) {
    this.pushHistory()
    const evt = {
      id: crypto.randomUUID(),
      ts: this.clock.seconds,
      ...e,
    }
    this.applyPossessionRules(evt)
    this.events.push(evt)
  }

  currentPossession() {
    return this.possessions[this.possessions.length - 1]
  }

  startPossession(team, start_type, restart_event_id) {
    const p = {
      id: crypto.randomUUID(),
      team,
      start: this.clock.seconds,
      start_type,
      restart_event_id: restart_event_id ?? null,
    }
    this.possessions.push(p)
    return p
  }

  endPossession() {
    const p = this.currentPossession()
    if (p && p.end == null) {
      p.end = this.clock.seconds
    }
  }

  closeCurrentPossessionOn() {
    this.endPossession("score")
  }

  applyPossessionRules(evt) {
    const p = this.currentPossession()

    if (!p && evt.team) {
      if (evt.type !== "strike") {
        const st = ["puckout", "kickout", "throwin", "sideline", "free", "65", "45", "penalty"]
        const isRestart = st.includes(evt.type)
        const restartId = isRestart ? (evt.restart_event_id ?? evt.id) : null
        const poss = this.startPossession(evt.team, isRestart ? evt.type : undefined, restartId)
        evt.possession_id = poss.id
      }
    } else if (p) {
      evt.possession_id = p.id
    }

    const endTypes = new Set(["score", "wide_loss", "short_loss", "whistle", "foul", "turnover"])
    if (endTypes.has(evt.type)) {
      this.endPossession(evt.type)
    }
  }

  // computed metrics
  get pppHome() {
    const poss = this.possessions.filter((p) => p.team === "home" && p.end != null).length || 1
    const points = toTotalPoints(this.score.home)
    return points / poss
  }

  get pppAway() {
    const poss = this.possessions.filter((p) => p.team === "away" && p.end != null).length || 1
    const points = toTotalPoints(this.score.away)
    return points / poss
  }

  get possessionCounts() {
    return {
      home: this.possessions.filter((p) => p.team === "home" && p.end != null).length,
      away: this.possessions.filter((p) => p.team === "away" && p.end != null).length,
    }
  }

  openDialog(kind) {
    if (kind === "shot") this.ui.currentShot.open = true
    if (kind === "free") this.ui.currentFree.open = true
    if (kind === "restart") this.ui.currentRestart.open = true
    if (kind === "turnover") this.ui.currentTurnover.open = true
  }

  closeDialogs() {
    this.ui.currentShot.open = false
    this.ui.currentFree.open = false
    this.ui.currentRestart.open = false
    this.ui.currentTurnover.open = false
  }

  setDialogXY(kind, xy) {
    if (kind === "shot") this.ui.currentShot.xy = [...this.ui.currentShot.xy, xy]
    if (kind === "free") this.ui.currentFree.xy = xy
    if (kind === "restart") this.ui.currentRestart.xy = xy
    if (kind === "turnover") this.ui.currentTurnover.xy = xy
  }
}

export const liveMatchStore = new LiveMatchStore()

export function createLiveStore() {
  return new LiveStore()
}
