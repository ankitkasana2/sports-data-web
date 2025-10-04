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
    this.closeCurrentPossessionOn()
  }

  addEvent(e) {

    this.pushHistory()
    const evt = {
      id: `Event_${nanoid(6)}`,
      ts: this.clock.seconds + 's',
      period: this.clock.period,
      ...e,
    }

    console.log("evt", evt)

    if ((e.type && e.type !== 'note') || (e.event_type && e.event_type !== 'note')) {
      this.applyPossessionRules(evt)
    }
    this.events.push(evt)
  }

  currentPossession() {
    return this.possessions[this.possessions.length - 1]
  }

  // Flexible helper to extract team id from heterogeneous event objects
  extractTeamFromEvent(evt) {
    if (!evt) return null
    return (
      evt.team ||
      evt.awarded_team_id ||
      evt.won_by_team_id ||
      evt.won_team ||
      evt.taken_by_team_id ||
      evt.team_id ||
      null
    )
  }

  startPossession(evtOrTeam, start_cause = "touch", start_restart_type = null) {
    // allow either event object or team id string
    let teamId = null
    let start_event_id = null
    if (typeof evtOrTeam === 'string') {
      teamId = evtOrTeam
    } else if (typeof evtOrTeam === 'object' && evtOrTeam !== null) {
      teamId = this.extractTeamFromEvent(evtOrTeam)
      start_event_id = evtOrTeam.id || null
    }

    const p = {
      possession_id: `Possession_${nanoid(6)}`,
      match_id: this.match_id ?? null,
      team_id: teamId ?? null,
      period: this.clock.period ?? null,
      start_time_sec: this.clock.seconds,
      end_time_sec: null,
      duration_sec: null,
      start_event_id: start_event_id,
      start_cause: start_cause,
      start_restart_type: start_restart_type,
      end_event_id: null,
      end_cause: null,
      shot_event_id: null,
      points_for: 0,
      sequence_id: null,
    }

    console.log('startPossession ->', p)

    this.possessions.push(p)
    return p
  }

  endPossession(end_cause = null, end_event_id = null) {
    const p = this.currentPossession()
    if (!p) return
    if (p.end_time_sec != null) return // already closed

    p.end_time_sec = this.clock.seconds
    p.duration_sec = Math.max(0, p.end_time_sec - p.start_time_sec)
    p.end_event_id = end_event_id
    p.end_cause = end_cause

    // compute points_for from scoreboard snapshot if possible
    // (We don't have per-possession incremental points here; this is a best-effort placeholder.)

    console.log('endPossession ->', p)
    return p
  }

  closeCurrentPossessionOn() {
    this.endPossession("score", null)
  }

  closeForPeriod() {
    // Ends the current possession on period end
    this.endPossession('period_end', null)
  }

  applyPossessionRules(evt) {
    // Normalize type field (support both type and event_type naming)
    const type = evt.type || evt.event_type || null
    const p = this.currentPossession()

    // Helper: mark evt with possession id when a possession exists
    if (p) evt.possession_id = p.possession_id

    // --- CASE 1: No possession yet ---
    if (!p) {
      // Events that should open a possession for a team
      const restartTypes = new Set(['throw_in','sideline','free','65','45','penalty','puckout','kickout','restart','kickout_or_puckout'])

      // Determine team that would start possession
      let awardedTeam = this.extractTeamFromEvent(evt)

      if (type === 'throw_in') {
        // Start for the team who won the throw
        if (evt.won_by_team_id || evt.won_by) awardedTeam = evt.won_by_team_id || evt.won_by
        if (awardedTeam) {
          const poss = this.startPossession(evt, 'throw_in', null)
          evt.possession_id = poss.possession_id
        }
      } else if (restartTypes.has(type)) {
        // For restarts: if this restart awards possession to a team, open it
        // Some restarts may be 'set_shot' (shot will close soon after)
        if (awardedTeam) {
          const poss = this.startPossession(evt, 'restart', type)
          evt.possession_id = poss.possession_id
        }
      } else if (type === 'strike' || type === 'touch') {
        // generic touch starts a possession
        if (awardedTeam) {
          const poss = this.startPossession(evt, 'touch', null)
          evt.possession_id = poss.possession_id
        }
      }

      return
    }

    // --- CASE 2: Possession is ongoing ---
    // Assign possession id
    evt.possession_id = p.possession_id

    // Define end-type events that close possession
    const endTypes = new Set(['shot','score','wide_loss','short_loss','whistle','turnover'])
    if (endTypes.has(type)) {
      this.endPossession(type, evt.id)
      return
    }

    // Foul handling: if foul is against controlling team -> possession ends
    if (type === 'foul' || evt.event_type === 'foul') {
      const againstTeam = evt.against_team || evt.offending_team || null
      if (againstTeam && againstTeam === p.team_id) {
        this.endPossession('foul', evt.id)
        return
      }
      // if foul against opponent -> possession continues (and a free event might be created)
    }

    // Free handling
    if (type === 'free' || evt.event_type === 'free') {
      // standard field names: evt.team (awarded team) or evt.awarded_team_id
      const freeTeam = evt.team || evt.awarded_team_id || evt.won_by_team_id || null

      // If free awarded to same team in possession -> possession continues
      if (freeTeam && freeTeam === p.team_id) {
        // nothing to do
        return
      }

      // Free awarded to other team -> possession flips
      if (freeTeam && freeTeam !== p.team_id) {
        this.endPossession('free_lost', evt.id)
        // Start new possession for awarded team (restart)
        const newPoss = this.startPossession(evt, 'restart', evt.free_type || 'free')
        evt.possession_id = newPoss.possession_id
        return
      }
    }

    // Throw-in handling during possession (e.g., quick throw won by same team) - by default, treat as continuation if won_by same team
    if (type === 'throw_in') {
      const wonBy = evt.won_by_team_id || evt.won_by || null
      if (wonBy && wonBy !== p.team_id) {
        this.endPossession('throw_in_lost', evt.id)
        const newPoss = this.startPossession(evt, 'throw_in', null)
        evt.possession_id = newPoss.possession_id
        return
      }
    }

    // Sideline/45/65/penalty/mark: if awarded to other team, flip; if awarded to same team and outcome is play_on, continue; if set_shot -> ensure possession was opened earlier (should already be)
    if (['sideline','45','65','penalty','mark'].includes(type)) {
      const awarded = evt.team || evt.awarded_team_id || evt.won_by_team_id || null
      if (awarded && awarded !== p.team_id) {
        this.endPossession(type + '_lost', evt.id)
        const newPoss = this.startPossession(evt, 'restart', type)
        evt.possession_id = newPoss.possession_id
        return
      }
      // else same team -> possession continues
    }

    // Back-pass violation: creates a free to opponent -> end possession and start for opponent
    if (type === 'back_pass' || evt.event_type === 'back_pass_to_gk') {
      const opponent = evt.awarded_team_id || evt.team || null
      if (opponent) {
        this.endPossession('back_pass', evt.id)
        const newPoss = this.startPossession(evt, 'restart', 'free')
        evt.possession_id = newPoss.possession_id
        return
      }
    }

    // Kick-out / Puck-out: often opens possession for the winner
    if (type === 'kickout' || type === 'puckout' || type === 'kickout_or_puckout') {
      const winner = evt.won_by_team_id || evt.winner_team_id || evt.taken_by_team_id || evt.taken_by || null
      if (winner && winner !== p.team_id) {
        this.endPossession(type + '_lost', evt.id)
        const newPoss = this.startPossession(evt, 'kickout', 'kickout')
        evt.possession_id = newPoss.possession_id
        return
      }
      // else continues
    }

    // Default: no possession change
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
  return new LiveMatchStore()
}
