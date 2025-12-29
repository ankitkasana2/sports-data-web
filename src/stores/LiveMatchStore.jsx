import { makeAutoObservable, computed, runInAction } from "mobx";
import axios from "axios";
import { nanoid } from "nanoid";

// Gaelic formatting helper: goals-points (total points = goals*3 + points)
export function toTotalPoints(s) {
  return (s?.goals || 0) * 3 + (s?.points || 0);
}

const apiUrl = import.meta.env;

class LiveMatchStore {
  // basic config / state
  code = "football";
  clock = { period: "H1", seconds: 0, running: false };
  intervalId = null;

  score = {
    home: { goals: 0, points: 0 },
    away: { goals: 0, points: 0 },
  };

// Team names 
team_a_name = "";
team_b_name = "";


  // core data (always arrays by default)
  events = [];
  possessions = [];
  match_context = {};

  loading = false;

  lastSavedAt = null;
  isOnline = true;
  pendingChanges = false;

  // UI state
  ui = {
    prematchOpen: true,
    selection: null,
    currentShot: { open: false, xy: [], shotType: "" },
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
    currentSubstitution: { open: false, xy: [] },
    currentBackPass: { open: false, xy: [] },
    currentNote: { open: false, xy: [] },
  };

  // history for undo/redo
  past = [];
  future = [];

  autosaveTimer = null;
  match_id = null;

  constructor() {
    // mark computed fields
    makeAutoObservable(this, {
      pppHome: computed,
      pppAway: computed,
      possessionCounts: computed,
    });

    this.readMatchIdFromURL();
    this.listenURLChange();

    // ensure arrays are never undefined
    this.events = this.events || [];
    this.possessions = this.possessions || [];
  }

  /* --------------------- URL helpers --------------------- */
  readMatchIdFromURL() {
    if (typeof window === "undefined") return;
    const path = window.location.pathname; // e.g. /live/M005
    const parts = path.split("/"); // ["", "live", "M005"]
    this.match_id = parts[2] || null;
    // console.debug("Resolved match_id:", this.match_id);
  }

  listenURLChange() {
    if (typeof window === "undefined") return;

    window.addEventListener("popstate", () => {
      this.readMatchIdFromURL();
    });

    // patch pushState/replaceState to detect navigation done by router
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.readMatchIdFromURL();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.readMatchIdFromURL();
    };
  }

  /* --------------------- Utility helpers --------------------- */
  destroy() {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  markChanged() {
    this.pendingChanges = true;
  }

  /* --------------------- History (safe) --------------------- */
  // snapshot returns plain object (not string) to make debugging easier
  snapshotObject() {
    return {
      code: this.code,
      clock: { ...this.clock },
      score: JSON.parse(JSON.stringify(this.score)),
      events: Array.isArray(this.events) ? JSON.parse(JSON.stringify(this.events)) : [],
      possessions: Array.isArray(this.possessions)
        ? JSON.parse(JSON.stringify(this.possessions))
        : [],
      ui: JSON.parse(JSON.stringify(this.ui)),
      match_context: JSON.parse(JSON.stringify(this.match_context || {})),
    };
  }

  pushHistory() {
    // keep last N snapshots if you want (here unlimited, consider limiting)
    try {
      this.past.push(this.snapshotObject());
      this.future = [];
    } catch (err) {
      // shouldn't happen, but don't break app
      console.error("pushHistory error", err);
    }
  }

  restoreFromSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object") return;
    // safe assignments — fallback to defaults
    this.code = snapshot.code ?? this.code;
    this.clock = snapshot.clock ?? this.clock;
    this.score = snapshot.score ?? this.score;
    this.events = Array.isArray(snapshot.events) ? snapshot.events : [];
    this.possessions = Array.isArray(snapshot.possessions) ? snapshot.possessions : [];
    this.ui = snapshot.ui ?? this.ui;
    this.match_context = snapshot.match_context ?? this.match_context;
  }

  undo() {
    if (!this.past.length) return;
    const current = this.snapshotObject();
    const prev = this.past.pop();
    if (!prev) return;
    this.future.push(current);
    this.restoreFromSnapshot(prev);
    this.pendingChanges = true;
  }

  redo() {
    if (!this.future.length) return;
    const current = this.snapshotObject();
    const next = this.future.pop();
    if (!next) return;
    this.past.push(current);
    this.restoreFromSnapshot(next);
    this.pendingChanges = true;
  }

  /* --------------------- Clock/score helpers --------------------- */
  startClock() {
    if (this.intervalId) return;
    this.clock.running = true;
    this.intervalId = setInterval(() => {
      this.clock.seconds = this.clock.seconds + 1;
    }, 1000);
  }

  pauseClock() {
    this.clock.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setTime(seconds) {
    this.pushHistory();
    this.clock.seconds = Math.max(0, Math.floor(seconds));
  }

  setPeriod(period) {
    this.pushHistory();
    this.clock.period = period;
  }

  tick(delta = 1) {
    if (!this.clock.running) return;
    this.clock.seconds = Math.max(0, this.clock.seconds + delta);
  }

  addScore(team, kind) {
    this.pushHistory();
    if (!this.score[team]) this.score[team] = { goals: 0, points: 0 };
    if (kind === "goal") {
      this.score[team].goals += 1;
    } else if (kind === "two_point") {
      this.score[team].points += 2;
    } else {
      this.score[team].points += 1;
    }
    this.closeCurrentPossessionOn();
  }

  // Topbar score recalculation from events 
  recalculateScore() {
    const home = { goals: 0, points: 0 };
    const away = { goals: 0, points: 0 };

    (this.events || []).forEach((evt) => {
      if (evt.event_type !== "shot") return;

      // NORMALIZE TEAM ID
      const team = (evt.team_id || evt.team || "").trim().toLowerCase();

      // Match against actual team names as well
      const teamAName = (this.team_a_name || "").trim().toLowerCase();
      const teamBName = (this.team_b_name || "").trim().toLowerCase();

      const isHome =
        team === "team_a".toLowerCase() ||
        team === "home" ||
        team === "a" ||
        team === "team a" ||
        team === teamAName;

      const isAway =
        team === "team_b".toLowerCase() ||
        team === "away" ||
        team === "b" ||
        team === "team b" ||
        team === teamBName;

      if (evt.shot_result === "goal") {
        if (isHome) home.goals++;
        if (isAway) away.goals++;
      }

      if (evt.shot_result === "point") {
        if (isHome) home.points++;
        if (isAway) away.points++;
      }
    });

    this.score = { home, away };
  }


  /* --------------------- Fetching / API --------------------- */
  async fetchEvents(matchId) {
    this.loading = true;
    // guard matchId fallback to stored id
    const id = matchId ?? this.match_id;
    if (!id) {
      this.events = [];
      this.loading = false;
      return;
    }

    try {
      const res = await axios.get(`${apiUrl.VITE_BACKEND_PATH}api/events/${id}`);
      // API might return different shapes — be defensive
       console.log("API Response Data:", res?.data);
      const payload = res?.data ?? {};
      // prefer `data` (common), else `events`, else whole payload if it looks like an array
      let events = [];
      if (Array.isArray(payload.data)) events = payload.data;
      else if (Array.isArray(payload.events)) events = payload.events;
      else if (Array.isArray(res)) events = res;
      else if (Array.isArray(payload)) events = payload;

      runInAction(() => {

 // team names  addad
  this.team_a_name = payload.team_a_name || "";
  this.team_b_name = payload.team_b_name || "";

        this.events = events || [];
        this.loading = false;
      });
      this.recalculateScore();
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        // keep events as array to avoid undefined errors
        this.events = Array.isArray(this.events) ? this.events : [];
      });
      if (error?.response) {
        console.log(" Backend Error Response:", error.response.data);
      } else {
        console.log(" Unknown Error:");
      }
    }
  }

  /* --------------------- Event creation / local apply --------------------- */

  addEventLocal(eventObj, { newestFirst = true } = {}) {
    // ensure arrays exist
    if (!Array.isArray(this.events)) this.events = [];
    // push history before mutating in case user wants undo
    this.pushHistory();

    const newEvent = {
      id: eventObj.id ?? `Event_${nanoid(6)}`,
      matchId: this.match_id ?? eventObj.matchId ?? null,
      ts: eventObj.ts ?? this.clock.seconds,
      period: eventObj.period ?? this.clock.period,
      ...eventObj,
    };

    if (newestFirst) {
      this.events.unshift(newEvent);
    } else {
      this.events.push(newEvent);
    }

    this.pendingChanges = true;
    // try to apply possession rules to maintain possessions
    try {
      this.applyPossessionRules(newEvent);
    } catch (err) {
      // guard — possession logic shouldn't break event insertion
      console.error("applyPossessionRules error", err);
    }
    return newEvent;
  }

  // add event with API create (calls addEventLocal on success)
  async addEvent(e) {

    if (!Array.isArray(this.events)) this.events = [];

    const evt = {
      id: e.id ?? `Event_${nanoid(6)}`,
      matchId: this.match_id,
      ts: e.ts ?? this.clock.seconds,
      period: e.period ?? this.clock.period,
      possession_id: e.possession_id ?? this.currentPossessionId,
      ...e,
    };
    


    if (
      (e.type && e.type !== "note") ||
      (e.event_type && e.event_type !== "note")
    ) {
      this.applyPossessionRules(evt);
    }


    // 3️⃣ Make a CLEAN COPY to send to backend this code use for posession id otherwise pass direct evt in api.
    const evtForBackend = JSON.parse(JSON.stringify(evt));
    // push history before network call if you want to be able to undo attempt
    this.pushHistory();

    try {
      const response = await axios.post(`${apiUrl.VITE_BACKEND_PATH}api/createEvent`, evtForBackend);
      // if backend returns success flag, use it; else assume success when 2xx

      const success = response?.data?.success ?? response.status < 400;
      if (success) {
        // update possessions and add locally
        if ((e.type && e.type !== "note") || (e.event_type && e.event_type !== "note")) {
          this.applyPossessionRules(evt);
        }
        // ensure events array and then push
        if (!Array.isArray(this.events)) this.events = [];
        this.events.unshift(evt);
        return true;
      } else {

        return false;
      }
    } catch (error) {
      console.error("Error creating event:", error);
      // keep store consistent (events remains array)
      if (!Array.isArray(this.events)) this.events = [];
      return false;
    }
  }

  /* --------------------- Possession helpers --------------------- */
  currentPossession() {
    if (!Array.isArray(this.possessions)) this.possessions = [];
    return this.possessions[this.possessions.length - 1];
  }

  extractTeamFromEvent(evt) {
    if (!evt) return null;
    return (
      evt.team ||
      evt.awarded_team_id ||
      evt.won_by_team_id ||
      evt.won_team ||
      evt.taken_by_team_id ||
      evt.team_id ||
      null
    );
  }

  startPossession(evtOrTeam, start_cause = "touch", start_restart_type = null) {
    let teamId = null;
    let start_event_id = null;
    if (typeof evtOrTeam === "string") {
      teamId = evtOrTeam;
    } else if (typeof evtOrTeam === "object" && evtOrTeam !== null) {
      teamId = this.extractTeamFromEvent(evtOrTeam);
      start_event_id = evtOrTeam.id || null;
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
    };

    if (!Array.isArray(this.possessions)) this.possessions = [];
    this.possessions.unshift(p);
    return p;
  }

  endPossession(end_cause = null, end_event_id = null) {
    const p = this.currentPossession();
    if (!p) return;
    if (p.end_time_sec != null) return;
    p.end_time_sec = this.clock.seconds;
    p.duration_sec = Math.max(0, p.end_time_sec - p.start_time_sec);
    p.end_event_id = end_event_id;
    p.end_cause = end_cause;
    return p;
  }

  closeCurrentPossessionOn() {
    this.endPossession("score", null);
  }

  /* apply possession rules (kept mostly same but defensive) */
  applyPossessionRules(evt) {
    const type = evt.type || evt.event_type || null;
    const p = this.currentPossession();

    if (p) evt.possession_id = p.possession_id;

    if (!p) {
      const restartTypes = new Set([
        "throw_in",
        "sideline",
        "free",
        "65",
        "45",
        "penalty",
        "puckout",
        "kickout",
        "restart",
        "kickout_or_puckout",
      ]);

      let awardedTeam = this.extractTeamFromEvent(evt);

      if (type === "throw_in") {
        if (evt.won_by_team_id || evt.won_by)
          awardedTeam = evt.won_by_team_id || evt.won_by;
        if (awardedTeam) {
          const poss = this.startPossession(evt, "throw_in", null);
          evt.possession_id = poss.possession_id;
        }
      } else if (restartTypes.has(type)) {
        if (awardedTeam) {
          const poss = this.startPossession(evt, "restart", type);
          evt.possession_id = poss.possession_id;
        }
      } else if (type === "strike" || type === "touch") {
        if (awardedTeam) {
          const poss = this.startPossession(evt, "touch", null);
          evt.possession_id = poss.possession_id;
        }
      }
      return;
    }

    // ongoing possession
    evt.possession_id = p.possession_id;
    const endTypes = new Set([
      "shot",
      "score",
      "wide_loss",
      "short_loss",
      "whistle",
      "turnover",
    ]);
    if (endTypes.has(type)) {
      this.endPossession(type, evt.id);
      return;
    }

    if (type === "foul" || evt.event_type === "foul") {
      const againstTeam = evt.against_team || evt.offending_team || null;
      if (againstTeam && againstTeam === p.team_id) {
        this.endPossession("foul", evt.id);
        return;
      }
    }

    if (type === "free" || evt.event_type === "free") {
      const freeTeam = evt.team || evt.awarded_team_id || evt.won_by_team_id || null;
      if (freeTeam && freeTeam === p.team_id) {
        return;
      }
      if (freeTeam && freeTeam !== p.team_id) {
        this.endPossession("free_lost", evt.id);
        const newPoss = this.startPossession(evt, "restart", evt.free_type || "free");
        evt.possession_id = newPoss.possession_id;
        return;
      }
    }

    if (type === "throw_in") {
      const wonBy = evt.won_by_team_id || evt.won_by || null;
      if (wonBy && wonBy !== p.team_id) {
        this.endPossession("throw_in_lost", evt.id);
        const newPoss = this.startPossession(evt, "throw_in", null);
        evt.possession_id = newPoss.possession_id;
        return;
      }
    }

    if (["sideline", "45", "65", "penalty", "mark"].includes(type)) {
      const awarded = evt.team || evt.awarded_team_id || evt.won_by_team_id || null;
      if (awarded && awarded !== p.team_id) {
        this.endPossession(type + "_lost", evt.id);
        const newPoss = this.startPossession(evt, "restart", type);
        evt.possession_id = newPoss.possession_id;
        return;
      }
    }

    if (type === "back_pass" || evt.event_type === "back_pass_to_gk") {
      const opponent = evt.awarded_team_id || evt.team || null;
      if (opponent) {
        this.endPossession("back_pass", evt.id);
        const newPoss = this.startPossession(evt, "restart", "free");
        evt.possession_id = newPoss.possession_id;
        return;
      }
    }

    if (type === "kickout" || type === "puckout" || type === "kickout_or_puckout") {
      const winner = evt.won_by_team_id || evt.winner_team_id || evt.taken_by_team_id || evt.taken_by || null;
      if (winner && winner !== p.team_id) {
        this.endPossession(type + "_lost", evt.id);
        const newPoss = this.startPossession(evt, "kickout", "kickout");
        evt.possession_id = newPoss.possession_id;
        return;
      }
    }

    // default: nothing
  }

  /* --------------------- computed --------------------- */
  get pppHome() {
    const poss = (Array.isArray(this.possessions) ? this.possessions : []).filter(
      (p) => p?.team === "home" && p?.end != null
    ).length || 1;
    const points = toTotalPoints(this.score.home);
    return points / poss;
  }

  get pppAway() {
    const poss = (Array.isArray(this.possessions) ? this.possessions : []).filter(
      (p) => p?.team === "away" && p?.end != null
    ).length || 1;
    const points = toTotalPoints(this.score.away);
    return points / poss;
  }

  get possessionCounts() {
    const arr = Array.isArray(this.possessions) ? this.possessions : [];
    return {
      home: arr.filter((p) => p?.team === "home" && p?.end != null).length,
      away: arr.filter((p) => p?.team === "away" && p?.end != null).length,
    };
  }

  /* --------------------- small UI helpers --------------------- */
  openPrematch(open) {
    this.ui.prematchOpen = !!open;
  }

  savePrematch(data) {
    setTimeout(() => {
      axios
        .post(`${apiUrl.VITE_BACKEND_PATH}match_context`, data)
        .then((response) => {
          console.log("Match_context saved:", response.data);
        })
        .catch((error) => {
          console.error("There was an error to save match_context!", error);
        });
    }, 500);

    this.match_context = data;
    this.clock.period = "H1";
    this.clock.seconds = 0;
    this.startClock();
    return;
  }

  openDialog(kind, from = null) {
    this.pauseClock()
    if (kind === "shot") {

      if (from == 'sideline') {
        this.ui.currentShot.shotType = 'sideline'
      } else if (from == '45' || from == '65') {
        this.ui.currentShot.shotType = from
      } else if (from == 'penalty') {
        this.ui.currentShot.shotType = 'penalty'
      } else if (from == 'mark') {
        this.ui.currentShot.shotType = from
      } else if (from == 'ordinary') {
        this.ui.currentShot.shotType = 'free'
      }

      this.ui.currentShot.open = true
    }
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
    if (kind === "substitution") this.ui.currentSubstitution.open = true
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
    this.ui.currentSubstitution.open = false
    this.ui.currentBackPass.open = false
    this.ui.currentNote.open = false
  }

  setDialogXY(kind, xy) {
    if (kind === "shot") this.ui.currentShot.xy = [...(this.ui.currentShot.xy || []), xy];
    if (kind === "free") this.ui.currentFree.xy = [...(this.ui.currentFree.xy || []), xy];
    if (kind === "restart")
      this.ui.currentRestart.xy = [...(this.ui.currentRestart.xy || []), xy];
    if (kind === "turnover")
      this.ui.currentTurnover.xy = [...(this.ui.currentTurnover.xy || []), xy];
    if (kind === "sideline")
      this.ui.currentSideline.xy = [...(this.ui.currentSideline.xy || []), xy];
  }
}




export const liveMatchStore = new LiveMatchStore();
export function createLiveStore() {
  return new LiveMatchStore();
}




