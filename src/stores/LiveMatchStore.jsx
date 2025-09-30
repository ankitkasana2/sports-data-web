
import { makeAutoObservable, computed } from "mobx"
import axios from "axios"
import { toJS } from "mobx"
import { nanoid } from 'nanoid';
// Gaelic formatting helper: goals-points (total points = goals*3 + points)
export function toTotalPoints(s) {
  return s.goals * 3 + s.points
}


const apiUrl = import.meta.env;


class LiveMatchStore {
  code = "football"
  clock = { period: "H1", seconds: 0, running: false }
  intervalId = null
  match_id = null

  score = {
    home: { goals: 0, points: 0 },
    away: { goals: 0, points: 0 },
  }

  // core data
  events = []
  possessions = []
  match_context = {}

  lastSavedAt = null
  isOnline = true
  pendingChanges = false

  // UI state
  ui = {
    prematchOpen: true,
    selection: null,
    currentShot: { open: false, xy: [] },
    currentFree: { open: false, xy: [] },
    currentRestart: { open: false, xy: [] },
    currentTurnover: { open: false, xy: [] },
    currentKickoutOrPuckout: { open: false, xy: [] },
    currentSideline: { open: false, xy: [] },
    currentThrowIn: { open: false, xy: [] },
    current45Or65: { open: false, xy: [] },
    currentPanelty: { open: false, xy: [] },
    currentMark: { open: false, xy: [] },
    currentCard: { open: false, xy: [] },
    current50mAdvance: { open: false, xy: [] },
    currentBackPass: { open: false, xy: [] },
    currentNote: { open: false, xy: [] },

  }

  // basic history for undo/redo
  past = []
  future = []

  autosaveTimer = null;

  constructor() {
    makeAutoObservable(this, {
      pppHome: computed,
      pppAway: computed,
      possessionCounts: computed,
    })

    this.initializeAutosave()
    this.initializeOnlineDetection()
    this.loadFromLocalStorage()
  }

  initializeAutosave() {
    // Start autosave timer (every 2.5 seconds)
    // this.autosaveTimer = setInterval(() => {
    //   this.saveToLocalStorage()
    // }, 2500)
  }

  initializeOnlineDetection() {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine

      window.addEventListener("online", () => {
        this.isOnline = true
        if (this.pendingChanges) {
          this.saveToLocalStorage()
        }
      })

      window.addEventListener("offline", () => {
        this.isOnline = false
      })
    }
  }

  saveToLocalStorage() {
    if (typeof window === "undefined") return

    try {
      const saveData = {
        code: this.code,
        clock: this.clock,
        score: this.score,
        events: this.events,
        possessions: this.possessions,
        ui: this.ui,
        timestamp: Date.now(),
      }

      localStorage.setItem("live-match-autosave", JSON.stringify(saveData))
      this.lastSavedAt = Date.now()
      this.pendingChanges = false
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  loadFromLocalStorage() {
    if (typeof window === "undefined") return

    try {
      const saved = localStorage.getItem("live-match-autosave")
      if (!saved) return

      const saveData = JSON.parse(saved)
      const hoursSinceLastSave = (Date.now() - saveData.timestamp) / (1000 * 60 * 60)
      if (hoursSinceLastSave > 24) return

      this.code = saveData.code || this.code
      this.clock = { ...this.clock, ...saveData.clock }
      this.score = { ...this.score, ...saveData.score }
      this.events = saveData.events || []
      this.possessions = saveData.possessions || []
      this.ui = { ...this.ui, ...saveData.ui }
      this.lastSavedAt = saveData.timestamp
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
    }
  }

  destroy() {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer)
      this.autosaveTimer = null
    }
  }

  markChanged() {
    this.pendingChanges = true
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
    this.events.pop()
    this.possessions = v.possessions
    this.ui.currentShot.xy.pop()
    this.ui.currentFree.xy.pop()
    // this.ui = v.ui
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

  savePrematch(data) {

    setTimeout(() => {
      axios.post(`${apiUrl.VITE_BACKEND_PATH}match_context`, data)
        .then(response => {
          console.log("Match_context saved:", response.data);
        })
        .catch(error => {
          console.error("There was an error to save match_context!", error);
        });
    }, 500);

    this.match_context = data
    this.clock.period = "H1"
    this.clock.seconds = 0
    this.startClock()
    return
  }

  startClock() {
    if (this.intervalId) return; // prevent multiple intervals
    this.clock.running = true;
    this.intervalId = setInterval(() => {
      this.clock.seconds = this.clock.seconds + 1;
    }, 1000);
  }

  pauseClock() {
    this.clock.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null; // reset
    }
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
    if (kind === "goal") {
      this.score[team].goals += 1;
    } else {
      this.score[team].points += 1;
    }
    // close current possession on score (per rules)
    this.closeCurrentPossessionOn(team)
  }

  addEvent(e) {

    this.pushHistory()
    const evt = {
      id: `Event_${nanoid(6)}`,
      ts: this.clock.seconds + 's',
      period: this.clock.period,
      time_sec: this.clock.seconds,
      ...e,
    }

    if (e.type != 'note') {
      this.applyPossessionRules(evt)
    }
    this.events.push(evt)
  }

  currentPossession() {
    return this.possessions[this.possessions.length - 1]
  }

  startPossession(evt, start_cause = "touch", start_restart_type = null) {

    const p = {
      possession_id: `Possession_${nanoid(6)}`,       // unique ID
      match_id: this.match_id ?? null,           // match identifier
      team_id: evt.won_team ?? null,                 // controlling team
      period: this.clock.period ?? null,         // current period (H1/H2/etc.)
      start_time_sec: this.clock.seconds,        // start time
      end_time_sec: null,                         // end time (to be filled on close)
      duration_sec: null,                         // duration (computed on close)
      start_event_id: evt.id ?? null,             // first event in possession
      start_cause: start_cause,                   // "touch", "restart", etc.
      start_restart_type: start_restart_type,     // e.g., "kickout", "throwin", "free"
      end_event_id: null,                         // to be filled when possession ends
      end_cause: null,                             // reason possession ended
      shot_event_id: null,                         // linked shot event (if any)
      points_for: 0,                               // points scored in this possession
      sequence_id: null,                            // optional sequence
    }

    console.log('p', p)


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

    // --- CASE 1: No possession yet, and a team has controlled touch ---
    if (!p) {
      if (evt.type !== "strike") {
        const restartTypes = ["puckout", "kickout", "throw_in", "sideline", "free", "65", "45", "penalty"]
        const isRestart = restartTypes.includes(evt.type)
        const restartId = isRestart ? (evt.restart_event_id ?? evt.id) : null

        const poss = this.startPossession(evt, isRestart ? evt.type : undefined, restartId)
        evt.possession_id = poss.possession_id
      }
    }
    // --- CASE 2: Possession is ongoing ---
    else if (p) {
      evt.possession_id = p.id

      // 🚨 END-TYPE EVENTS (normal close)
      const endTypes = new Set(["score", "wide_loss", "short_loss", "whistle", "turnover"])
      if (endTypes.has(evt.type)) {
        this.endPossession(evt.type, evt.id)
      }

      // 🚨 SPECIAL CASE: FOUL
      if (evt.type === "foul") {
        if (evt.against_team === p.team) {
          // ❌ foul against controlling team → possession ends
          this.endPossession("foul", evt.id)
        } else {
          // ✅ foul against opponent → possession continues
          // keep same possession_id
          // (the following free event stays in this possession)
        }
      }

      // 🚨 SPECIAL CASE: FREE
      if (evt.type === "free") {
        if (evt.team === p.team) {
          // ✅ awarded team == current possession → possession continues
          // nothing to close
        } else {
          // ❌ if somehow free is awarded to the other team → possession flips
          this.endPossession("free_lost", evt.id)
          this.startPossession(evt.team, "free", evt.restart_event_id ?? evt.id)
        }
      }
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
    this.pauseClock()
    if (kind === "shot") this.ui.currentShot.open = true
    if (kind === "free") this.ui.currentFree.open = true
    if (kind === "restart") this.ui.currentRestart.open = true
    if (kind === "turnover") this.ui.currentTurnover.open = true
    if (kind === "KickoutOrPuckout") this.ui.currentKickoutOrPuckout.open = true
    if (kind === "sideline") this.ui.currentSideline.open = true
    if (kind === "throwIn") this.ui.currentThrowIn.open = true
    if (kind === "45Or65") this.ui.current45Or65.open = true
    if (kind === "panelty") this.ui.currentPanelty.open = true
    if (kind === "mark") this.ui.currentMark.open = true
    if (kind === "card") this.ui.currentCard.open = true
    if (kind === "50mAdvance") this.ui.current50mAdvance.open = true
    if (kind === "backPass") this.ui.currentBackPass.open = true
    if (kind === "note") this.ui.currentNote.open = true
  }

  closeDialogs() {
    this.ui.currentShot.open = false
    this.ui.currentFree.open = false
    this.ui.currentRestart.open = false
    this.ui.currentTurnover.open = false
    this.ui.currentKickoutOrPuckout.open = false
    this.ui.currentSideline.open = false
    this.ui.currentThrowIn.open = false
    this.ui.current45Or65.open = false
    this.ui.currentPanelty.open = false
    this.ui.currentMark.open = false
    this.ui.currentCard.open = false
    this.ui.current50mAdvance.open = false
    this.ui.currentBackPass.open = false
    this.ui.currentNote.open = false
  }

  setDialogXY(kind, xy) {
    if (kind === "shot") this.ui.currentShot.xy = [...this.ui.currentShot.xy, xy]
    if (kind === "free") this.ui.currentFree.xy = [...this.ui.currentFree.xy, xy]
    if (kind === "restart") this.ui.currentRestart.xy = [...this.ui.currentShot.xy, xy]
    if (kind === "turnover") this.ui.currentTurnover.xy = [...this.ui.currentShot.xy, xy]
    if (kind === "sideline") this.ui.currentSideline.xy = [...this.ui.currentSideline.xy, xy]
  }
}

export const liveMatchStore = new LiveMatchStore()

export function createLiveStore() {
  return new LiveStore()
}
