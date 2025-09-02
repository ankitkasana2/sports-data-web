import { useMemo } from "react"
import { useLive } from "./LiveContext"
import { MiniPitch } from "./MiniPitch"

export function MiniPitchPanel() {
  const { state } = useLive()
  const lastShots = useMemo(() => state.events.filter((e) => e.type === "shot").slice(-12), [state.events])
  const ghost = state.events.map((e)=>{return e.xy})

  console.log("hello",ghost[0])

  return (
    <div className="space-y-3">
      <MiniPitch code={state.code} mode="view" value={ghost ?? []} />
    </div>
  )
}

function ShotDot({ result }) {
  const color =
    result === "goal" || result === "point"
      ? "bg-emerald-600"
      : result === "wide"
        ? "bg-red-500"
        : result === "saved" || result === "blocked"
          ? "bg-amber-500"
          : "bg-gray-400"
  return <div className={`h-3 w-3 rounded-full ${color}`} title={result} />
}
