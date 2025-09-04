import { useMemo, useEffect } from "react"
import { MiniPitch } from "./MiniPitch"
import { observer } from "mobx-react-lite"
import { useStores } from "../../stores/StoresProvider"
import { toJS } from "mobx"


function MiniPitchPanel() {
  const { liveMatchStore } = useStores()
  const store = liveMatchStore

  const ghost = [
    ...(toJS(store.ui.currentShot)?.xy ?? []),
    ...(toJS(store.ui.currentFree)?.xy ?? [])
  ];


  return (
    <div className="space-y-3">
      <MiniPitch code={store.code} mode="view" value={ghost ?? []} />
    </div>
  )
}

export default observer(MiniPitchPanel)

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
