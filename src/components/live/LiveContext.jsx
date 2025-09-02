import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react"
import { v4 as uuid } from "uuid"
import { deriveScoreFromShot, secondsToHHMMSS } from "./LiveUtils"

// --- Types removed (Code, Period, TeamID, Event types, etc.)
// Keeping functionality only

const initialState = (code) => ({
  code,
  matchId: "demo-match",
  teamA: { id: "A", name: "Team A" },
  teamB: { id: "B", name: "Team B" },
  clock: { running: false, period: "H1", timeSec: 0, autoRewindOnUndo: false },
  events: [],
  possessions: [],
  restartPendingId: null,
  lastSavedAt: null,
  scoreboard: {
    teamA: { goals: 0, points: 0, total: 0 },
    teamB: { goals: 0, points: 0, total: 0 },
  },
  preMatch: null,
  ui: { hotkeyOverlay: false, preMatchOpen: true },
  undoStack: [],
  redoStack: [],
})

function pushHistory(state) {
  const snapshot = JSON.stringify({
    events: state.events,
    possessions: state.possessions,
    scoreboard: state.scoreboard,
    restartPendingId: state.restartPendingId,
    clock: state.clock,
  })
  return { ...state, undoStack: [...state.undoStack, snapshot], redoStack: [] }
}

function popUndo(state) {
  if (state.undoStack.length === 0) return state
  const last = state.undoStack[state.undoStack.length - 1]
  const prev = JSON.parse(last)
  const redoSnap = JSON.stringify({
    events: state.events,
    possessions: state.possessions,
    scoreboard: state.scoreboard,
    restartPendingId: state.restartPendingId,
    clock: state.clock,
  })
  return {
    ...state,
    events: prev.events,
    possessions: prev.possessions,
    scoreboard: prev.scoreboard,
    restartPendingId: prev.restartPendingId,
    clock: state.clock.autoRewindOnUndo
      ? prev.clock
      : { ...state.clock, running: false, timeSec: prev.clock.timeSec, period: prev.clock.period },
    undoStack: state.undoStack.slice(0, -1),
    redoStack: [...state.redoStack, redoSnap],
  }
}

function popRedo(state) {
  if (state.redoStack.length === 0) return state
  const last = state.redoStack[state.redoStack.length - 1]
  const next = JSON.parse(last)
  const undoSnap = JSON.stringify({
    events: state.events,
    possessions: state.possessions,
    scoreboard: state.scoreboard,
    restartPendingId: state.restartPendingId,
    clock: state.clock,
  })
  return {
    ...state,
    events: next.events,
    possessions: next.possessions,
    scoreboard: next.scoreboard,
    restartPendingId: next.restartPendingId,
    clock: { ...state.clock, running: false, timeSec: next.clock.timeSec, period: next.clock.period },
    redoStack: state.redoStack.slice(0, -1),
    undoStack: [...state.undoStack, undoSnap],
  }
}

// Core possession logic helpers
const isRestart = (e) =>
  e.type === "kickout" || e.type === "puckout" || e.type === "sideline" || e.type === "throwin" || e.type === "free"

const restartStartType = (state, e) => {
  if (e.type === "kickout") return "kickout"
  if (e.type === "puckout") return "puckout"
  if (e.type === "throwin") return "throwin"
  if (e.type === "sideline") return "sideline"
  if (e.type === "free") {
    if (e.is_45) return "45"
    if (e.is_65) return "65"
    return "free"
  }
  return "turnover"
}

const shotEndsPossession = (shot) => {
  return shot.result === "goal" || shot.result === "point" || shot.result === "wide" || shot.result === "dropped_short"
}

function computeScoreboard(events, state) {
  const A = { goals: 0, points: 0 }
  const B = { goals: 0, points: 0 }

  for (const e of events) {
    if (e.type !== "shot") continue
    const s = e
    const value = deriveScoreFromShot(s, state.code)
    const teamId = e.team_id
    if (!teamId) continue
    if (value >= 3) {
      if (teamId === state.teamA.id) A.goals += 1
      else B.goals += 1
    } else if (value > 0) {
      if (teamId === state.teamA.id) A.points += value
      else B.points += value
    }
  }
  return {
    teamA: { goals: A.goals, points: A.points, total: A.goals * 3 + A.points },
    teamB: { goals: B.goals, points: B.points, total: B.goals * 3 + B.points },
  }
}

function attachEventPossession(state, event) {
  const newPoss = [...state.possessions]
  let restartPendingId = state.restartPendingId
  const nowTime = event.time_sec

  const endOpenForTeam = (teamId, endType) => {
    if (!teamId) return
    const open = [...newPoss].reverse().find((p) => !p.end_time_sec && p.team_id === teamId)
    if (open) {
      open.end_time_sec = nowTime
      open.end_event_id = event.id
      open.duration_sec = Math.max(0, nowTime - open.start_time_sec)
      open.end_type = endType
    }
  }

  if (isRestart(event)) {
    restartPendingId = event.id
    return { ...state, possessions: newPoss, restartPendingId }
  }

  if (restartPendingId && event.type === "shot") {
    const shot = event
    const lastRestart = state.events.find((e) => e.id === restartPendingId)
    const executingTeam =
      lastRestart?.type === "kickout" || lastRestart?.type === "puckout" || lastRestart?.type === "sideline"
        ? lastRestart.executing_team_id
        : lastRestart?.type === "free"
        ? lastRestart.awarded_to_team_id
        : undefined

    const isPlacedRestart =
      shot.shot_type === "free" ||
      shot.shot_type === "45" ||
      shot.shot_type === "65" ||
      shot.shot_type === "penalty" ||
      shot.shot_type === "sideline_cut"

    if (isPlacedRestart && executingTeam) {
      const possId = uuid()
      newPoss.push({
        id: possId,
        team_id: executingTeam,
        start_event_id: restartPendingId,
        end_event_id: event.id,
        start_time_sec: lastRestart?.time_sec ?? nowTime,
        end_time_sec: nowTime,
        duration_sec: Math.max(0, nowTime - (lastRestart?.time_sec ?? nowTime)),
        start_type: restartStartType(state, lastRestart),
        end_type: shot.result === "wide" || shot.result === "dropped_short" ? "wide" : "score",
        restart_event_id: restartPendingId,
      })
      event.possession_id = possId
      restartPendingId = null
      return { ...state, possessions: newPoss, restartPendingId }
    }
  }

  if (restartPendingId && !isRestart(event)) {
    const lastRestart = state.events.find((e) => e.id === restartPendingId)
    const startType = restartStartType(state, lastRestart)
    const possId = uuid()
    const teamId = event.team_id
    if (teamId) {
      newPoss.push({
        id: possId,
        team_id: teamId,
        start_event_id: event.id,
        start_time_sec: event.time_sec,
        start_type: startType,
        restart_event_id: lastRestart.id,
      })
      event.possession_id = possId
      restartPendingId = null
    }
  } else {
    if (event.type === "turnover") {
      const t = event
      endOpenForTeam(t.team_losing_possession_id, "turnover")
      const possId = uuid()
      newPoss.push({
        id: possId,
        team_id: t.team_gaining_possession_id,
        start_event_id: event.id,
        start_time_sec: event.time_sec,
        start_type: "turnover",
      })
      event.possession_id = possId
    } else {
      const teamId = event.team_id
      if (teamId) {
        const open = [...newPoss].reverse().find((p) => !p.end_time_sec && p.team_id === teamId)
        if (open) {
          event.possession_id = open.id
          if (event.type === "shot") {
            const s = event
            if (shotEndsPossession(s)) {
              open.end_time_sec = event.time_sec
              open.end_event_id = event.id
              open.duration_sec = Math.max(0, event.time_sec - open.start_time_sec)
              open.end_type = s.result === "wide" || s.result === "dropped_short" ? "wide" : "score"
            }
          }
          if (event.type === "whistle") {
            open.end_time_sec = event.time_sec
            open.end_event_id = event.id
            open.duration_sec = Math.max(0, event.time_sec - open.start_time_sec)
            open.end_type = "whistle"
          }
        }
      }
    }
  }
  return { ...state, possessions: newPoss, restartPendingId }
}

function reducer(state, action) {
  switch (action.type) {
    case "TICK": {
      if (!state.clock.running) return state
      const timeSec = Math.max(0, state.clock.timeSec + action.by)
      return { ...state, clock: { ...state.clock, timeSec } }
    }
    case "CLOCK_START":
      return { ...state, clock: { ...state.clock, running: true } }
    case "CLOCK_PAUSE":
      return { ...state, clock: { ...state.clock, running: false } }
    case "CLOCK_SET": {
      if (state.clock.running) return state
      const period = action.period ?? state.clock.period
      return { ...state, clock: { ...state.clock, timeSec: Math.max(0, action.timeSec), period } }
    }
    case "SET_CODE":
      return { ...state, code: action.code }
    case "OPEN_DIALOG": {
      if (action.dialog === "shot") return { ...state, ui: { ...state.ui, currentShot: { open: true } } }
      if (action.dialog === "free") return { ...state, ui: { ...state.ui, currentFree: { open: true } } }
      if (action.dialog === "restart") return { ...state, ui: { ...state.ui, currentRestart: { open: true } } }
      if (action.dialog === "turnover") return { ...state, ui: { ...state.ui, currentTurnover: { open: true } } }
      return state
    }
    case "CLOSE_DIALOGS":
      return {
        ...state,
        ui: {
          ...state.ui,
          currentShot: { open: false },
          currentFree: { open: false },
          currentRestart: { open: false },
          currentTurnover: { open: false },
        },
      }
    case "SET_DIALOG_XY": {
      const { dialog, xy } = action
      if (dialog === "shot")
        return {
          ...state,
          ui: { ...state.ui, currentShot: { ...(state.ui.currentShot ?? { open: true }), open: true, xy } },
        }
      if (dialog === "free")
        return {
          ...state,
          ui: { ...state.ui, currentFree: { ...(state.ui.currentFree ?? { open: true }), open: true, xy } },
        }
      if (dialog === "restart")
        return {
          ...state,
          ui: { ...state.ui, currentRestart: { ...(state.ui.currentRestart ?? { open: true }), open: true, xy } },
        }
      if (dialog === "turnover")
        return {
          ...state,
          ui: { ...state.ui, currentTurnover: { ...(state.ui.currentTurnover ?? { open: true }), open: true, xy } },
        }
      return state
    }
    case "SUBMIT_EVENT": {
      const stamped = {
        ...action.event,
        id: action.event.id ?? uuid(),
        period: state.clock.period,
        time_sec: state.clock.timeSec,
        hhmmss: secondsToHHMMSS(state.clock.timeSec),
      }

      let next = pushHistory(state)
      next = attachEventPossession(next, stamped)
      const events = [...next.events, stamped]
      const scoreboard = computeScoreboard(events, next)
      return {
        ...next,
        events,
        scoreboard,
        ui: {
          ...next.ui,
          currentShot: { open: false },
          currentFree: { open: false },
          currentRestart: { open: false },
          currentTurnover: { open: false },
        },
      }
    }
    case "UNDO":
      return popUndo(state)
    case "REDO":
      return popRedo(state)
    case "SET_HOTKEY_OVERLAY":
      return { ...state, ui: { ...state.ui, hotkeyOverlay: action.open } }
    case "AUTOSAVED":
      return { ...state, lastSavedAt: Date.now() }
    case "OPEN_PREMATCH":
      return { ...state, ui: { ...state.ui, preMatchOpen: action.open } }
    case "SAVE_PREMATCH": {
      return {
        ...state,
        preMatch: action.data,
        ui: { ...state.ui, preMatchOpen: false },
        clock: { ...state.clock, running: false, period: "H1", timeSec: 0 },
      }
    }
    default:
      return state
  }
}

const LiveCtx = createContext(null)

export function LiveProvider({ children, code }) {
  const [state, dispatch] = useReducer(reducer, code, initialState)

  const rafRef = useRef()
  useEffect(() => {
    let last = performance.now()
    const loop = (now) => {
      const dt = (now - last) / 1000
      last = now
      if (state.clock.running) {
        dispatch({ type: "TICK", by: dt })
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => rafRef.current && cancelAnimationFrame(rafRef.current)
  }, [state.clock.running])

  useEffect(() => {
    const iv = setInterval(() => {
      try {
        const save = {
          state: {
            ...state,
            undoStack: [],
            redoStack: [],
          },
        }
        localStorage.setItem("live-autosave", JSON.stringify(save))
        dispatch({ type: "AUTOSAVED" })
      } catch {}
    }, 2500)
    return () => clearInterval(iv)
  }, [state])

  useEffect(() => {
    const raw = localStorage.getItem("live-autosave")
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (parsed?.state) {
        // future restore logic here
      }
    } catch {}
  }, [])

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch])
  return <LiveCtx.Provider value={value}>{children}</LiveCtx.Provider>
}

export function useLive() {
  const ctx = useContext(LiveCtx)
  if (!ctx) throw new Error("useLive must be used within LiveProvider")
  return ctx
}
