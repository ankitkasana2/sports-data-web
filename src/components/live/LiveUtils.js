export function secondsToHHMMSS(total) {
  const t = Math.floor(total)
  const m = Math.floor(t / 60)
  const s = t % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function pointsFromScore(goals, points) {
  return goals * 3 + points
}

export function deriveScoreFromShot(shot, code) {
  if (shot.result === "goal") return 3
  if (shot.result === "point") {
    if (code === "football") {
      // Football two-pointer: simplistic derivation - if shot_type is open_play/free and XY suggests outside ~40, return 2
      const isCandidate = shot.shot_type === "open_play" || shot.shot_type === "free"
      if (isCandidate && shot.xy) {
        // Approximate: outside arc if distance from end ~ beyond 40; we don't have ends so use x bands as proxy (0-100)
        const outside40 = shot.xy.x < 30 || shot.xy.x > 70
        return outside40 ? 2 : 1
      }
    }
    return 1
  }
  return 0
}
